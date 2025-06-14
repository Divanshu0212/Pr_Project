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
            url: `${backendDomain}/api/skills/reorder`,
            method: "put"
        }
    },
    projects: {
        get: {
            url: `${backendDomain}/api/projects`,
            method: 'GET'
        },
        counts: {
            url: `${backendDomain}/api/projects/counts`,
            method: 'GET'
        },
        add: {
            url: `${backendDomain}/api/projects`,
            method: 'POST'
        },
        single: {
            url: (id) => `${backendDomain}/api/projects/${id}`,
            method: 'GET'
        },
        update: {
            url: (id) => `${backendDomain}/api/projects/${id}`,
            method: 'PUT'
        },
        delete: {
            url: (id) => `${backendDomain}/api/projects/${id}`,
            method: 'DELETE'
        }
    },
    certificates: {
        get: {
            url: `${backendDomain}/api/certificates`,
            method: 'GET'
        },
        add: {
            url: `${backendDomain}/api/certificates`,
            method: 'POST'
        },
        update: {
            url: `${backendDomain}/api/certificates`,
            method: 'PUT'
        },
        delete: {
            url: `${backendDomain}/api/certificates`,
            method: 'DELETE'
        },
        count: {
            url: `${backendDomain}/api/certificates/count`,
            method: 'GET'
        }
    },
    experiences: {
        get: {
            url: `${backendDomain}/api/experiences`,
            method: 'GET'
        },
        add: {
            url: `${backendDomain}/api/experiences`,
            method: 'POST'
        },
        update: {
            url: `${backendDomain}/api/experiences`,
            method: 'PUT'
        },
        delete: {
            url: `${backendDomain}/api/experiences`,
            method: 'DELETE'
        },
        total: {
            url: `${backendDomain}/api/experiences/total`,
            method: 'GET'
        }
    }
};

export default SummaryApi;