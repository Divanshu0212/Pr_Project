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
    },
    profileImage: {
        url: `${backendDomain}/api/profile-image`,
        method: "post"
    },
    deleteProfileImage: {
        url: `${backendDomain}/api/profile-image`,
        method: "delete"
    },
    portfolioDetails: {
        get: {
            url: `${backendDomain}/api/portfolio/portfolio-details`,
            method: "get"
        },
        update: {
            url: `${backendDomain}/api/portfolio/portfolio-details`,
            method: "put"
        }
    },
    skills: {
        get: {
            url: `${backendDomain}/api/skills/manage`,
            method: "get"
        },
        create: {
            url: `${backendDomain}/api/skills/manage`,
            method: "post"
        },
        update: {
            url: `${backendDomain}/api/skills/manage/:id`,
            method: "put"
        },
        delete: {
            url: `${backendDomain}/api/skills/manage/:id`,
            method: "delete"
        },
        reorder: {
            url: `${backendDomain}/api/skills/manage/reorder`,
            method: "put"
        }
    }
};

export default SummaryApi;