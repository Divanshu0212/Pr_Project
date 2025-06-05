const backendDomain = "http://localhost:5000";

const SummaryApi = {
    signUp: {
        url: `${backendDomain}/api/auth/signup`,
        method: "post"
    },
    signIn: {
        url: `${backendDomain}/api/auth/login`,
        method: "post"
    },
    current_user: {
        url: `${backendDomain}/api/user-details`,
        method: "get"
    },
    logout_user: {
        url: `${backendDomain}/api/auth/logout`,
        method: "get"
    },
    googleAuth: {
        url: `${backendDomain}/api/auth/google`
    },
    githubAuth: {
        url: `${backendDomain}/api/auth/github`
    }
};

export default SummaryApi;