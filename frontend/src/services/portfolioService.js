import axios from 'axios';
import SummaryApi from '../config'; // Assuming SummaryApi has your base URL

const portfolioService = {
    /**
     * Fetches public portfolio data for a given username.
     * @param {string} username - The username whose public portfolio is to be fetched.
     * @returns {Promise<Object>} The public portfolio data.
     * @throws {Error} If the username is missing or the API call fails.
     */
    getPublicPortfolioByUsername: async (username) => {
        if (!username) {
            throw new Error("Username is required to fetch public portfolio.");
        }
        try {
            // Using axios for consistency, assuming SummaryApi provides the full URL
            const response = await axios.get(SummaryApi.portfolio.public.url(username));
            return response.data; // axios automatically parses JSON
        } catch (error) {
            // Re-throw with a more user-friendly message or structured error
            const errorMessage = error.response?.data?.message || 'Failed to fetch public portfolio.';
            throw new Error(errorMessage);
        }
    },
    // Add other portfolio-related service calls here if needed in the future
};

export default portfolioService;