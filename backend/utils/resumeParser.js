// backend/utils/resumeParser.js
// Install these packages:
// npm install pdf-parse mammoth

const pdfParse = require('pdf-parse'); // For PDF parsing
const mammoth = require('mammoth'); // For DOCX parsing

/**
 * Parses a resume file buffer into plain text.
 * @param {Buffer} fileBuffer The resume file content as a Buffer.
 * @param {string} mimeType The MIME type of the file (e.g., 'application/pdf').
 * @returns {Promise<string>} The extracted plain text content of the resume.
 * @throws {Error} If the file type is unsupported or parsing fails.
 */
async function parseResume(fileBuffer, mimeType) {
    if (!fileBuffer || !mimeType) {
        throw new Error('File buffer and MIME type are required for parsing.');
    }

    try {
        if (mimeType === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            return data.text;
        } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Mammoth handles both .doc and .docx files
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            return result.value; // The raw text content
        } else {
            throw new Error(`Unsupported resume file type: ${mimeType}`);
        }
    } catch (error) {
        console.error(`Error parsing resume (${mimeType}):`, error.message);
        throw new Error(`Failed to parse resume: ${error.message}`);
    }
}

module.exports = {
    parseResume
};