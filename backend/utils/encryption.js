// backend/utils/encryption.js
const crypto = require('crypto');

// Load environment variables if not already loaded (e.g., in server.js)
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY; // Must be 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16 bytes

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) { // 32 bytes in hex is 64 chars
    console.error('CRITICAL SECURITY ERROR: ENCRYPTION_SECRET_KEY is missing or invalid length. Expected 32-byte hex (64 chars).');
    process.exit(1); // Exit if critical security key is not set
}

// Convert hex key from .env to Buffer
const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

const encrypt = (text) => {
    if (text === null || text === undefined || text === '') {
        return text; // Don't encrypt null, undefined, or empty strings
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Store IV with encrypted data so it can be used for decryption
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
    if (text === null || text === undefined || text === '') {
        return text; // Nothing to decrypt
    }
    const textParts = text.split(':');
    if (textParts.length !== 2) {
        // Not in the expected IV:encryptedData format, return as is or throw error
        console.warn('Decryption warning: Data not in expected IV:encryptedData format. Returning original text. ', text);
        return text;
    }
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':'); // Join in case encrypted text contains more colons

    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message, 'Text:', encryptedText);
        return null; // Or throw an error, depending on your error handling policy
    }
};

module.exports = { encrypt, decrypt };