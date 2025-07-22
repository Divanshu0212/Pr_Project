// backend/utils/piiRedactor.js

/**
 * Redacts common PII from text.
 * This is a basic implementation and might not catch all edge cases.
 * For robust PII redaction, consider dedicated libraries or services.
 * @param {string} text The input text to redact.
 * @returns {string} The text with PII redacted.
 */
function redactPii(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    let redactedText = text;

    // Regular expressions for common PII patterns
    // Note: These are simplified and illustrative.
    // Real-world PII detection is more complex and often uses NLP models.

    // 1. Emails: Matches common email formats
    redactedText = redactedText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');

    // 2. Phone Numbers: Matches various formats (e.g., 123-456-7890, (123) 456-7890, +1 123 456 7890)
    // This regex is broad; refine as needed for specific country formats.
    redactedText = redactedText.replace(/(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g, '[PHONE_REDACTED]');

    // 3. URLs (to catch personal portfolio/LinkedIn if not already caught by email/phone)
    // This specifically targets common professional social media/portfolio sites if they appear standalone.
    redactedText = redactedText.replace(/(https?:\/\/(?:www\.)?(linkedin\.com|github\.com|portfolio-site\.com|personal-blog\.com)\S*)|(\b[A-Za-z0-9.-]+\.(com|org|net|io|dev)\b)/g, (match, url) => {
        if (url) return '[URL_REDACTED]'; // For explicit URLs
        return match; // Keep other general URLs if not PII related
    });


    // 4. Common names (Optional and very difficult to do accurately without context,
    //    can lead to false positives. Generally, better to rely on user not inputting PII
    //    or more sophisticated NLP tools. For a resume, if a name appears as a heading,
    //    it's usually okay. This is just for demonstration of how you *might* start.
    //    Consider if you *really* need to redact names that aren't emails/phones/URLs.)
    // For now, let's keep this very simple or avoid it unless specifically required
    // beyond email/phone/URL, as it's prone to over-redaction.

    return redactedText;
}

module.exports = {
    redactPii
};