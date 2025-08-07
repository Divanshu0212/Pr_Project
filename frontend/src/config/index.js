const BACKEND_DOMAIN = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

const SummaryApi = {
    signUp: {
        url: `${BACKEND_DOMAIN}/api/auth/signup`,
        method: "post"
    },
    signIn: {
        url: `${BACKEND_DOMAIN}/api/auth/login`,
        method: "post"
    },
    current_user: {
        url: `${BACKEND_DOMAIN}/api/users/user-details`,
        method: "get"
    },
    logout_user: {
        url: `${BACKEND_DOMAIN}/api/auth/logout`,
        method: "post"
    },
    googleAuth: {
        url: `${BACKEND_DOMAIN}/api/auth/google`
    },
    githubAuth: {
        url: `${BACKEND_DOMAIN}/api/auth/github`
    },
    profileImage: {
        url: `${BACKEND_DOMAIN}/api/profile-image`,
        method: "post"
    },
    deleteProfileImage: {
        url: `${BACKEND_DOMAIN}/api/profile-image`,
        method: "delete"
    },
    portfolioDetails: {
        get: {
            url: `${BACKEND_DOMAIN}/api/portfolio/portfolio-details`,
            method: "get"
        },
        update: {
            url: `${BACKEND_DOMAIN}/api/portfolio/portfolio-details`,
            method: "put"
        }
    },
    portfolio: {
        public: {
            url: (username) => `${BACKEND_DOMAIN}/api/portfolio/public/${username}`,
            method: "GET"
        },
        details: {
            url: `${BACKEND_DOMAIN}/api/portfolio-details`,
            method: "GET"
        },
        updateDetails: {
            url: `${BACKEND_DOMAIN}/api/portfolio-details`,
            method: "PUT"
        },
        search: {
            url: `${BACKEND_DOMAIN}/api/portfolio/search`,
            method: "GET"
        }
    },
    skills: {
        get: {
            url: `${BACKEND_DOMAIN}/api/skills/manage`,
            method: "get"
        },
        create: {
            url: `${BACKEND_DOMAIN}/api/skills/manage`,
            method: "post"
        },
        update: {
            url: (id) => `${BACKEND_DOMAIN}/api/skills/manage/${id}`,
            method: "put"
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/skills/manage/${id}`,
            method: "delete"
        },
        reorder: {
            url: `${BACKEND_DOMAIN}/api/skills/reorder`,
            method: "put"
        }
    },
    projects: {
        get: {
            url: `${BACKEND_DOMAIN}/api/projects`,
            method: 'GET'
        },
        counts: {
            url: `${BACKEND_DOMAIN}/api/projects/counts`,
            method: 'GET'
        },
        add: {
            url: `${BACKEND_DOMAIN}/api/projects`,
            method: 'POST'
        },
        single: {
            url: (id) => `${BACKEND_DOMAIN}/api/projects/${id}`,
            method: 'GET'
        },
        update: {
            url: (id) => `${BACKEND_DOMAIN}/api/projects/${id}`,
            method: 'PUT'
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/projects/${id}`,
            method: 'DELETE'
        }
    },
    certificates: {
        get: {
            url: `${BACKEND_DOMAIN}/api/certificates`,
            method: 'GET'
        },
        add: {
            url: `${BACKEND_DOMAIN}/api/certificates`,
            method: 'POST'
        },
        update: {
            url: (id) => `${BACKEND_DOMAIN}/api/certificates/${id}`,
            method: 'PUT'
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/certificates/${id}`,
            method: 'DELETE'
        },
        count: {
            url: `${BACKEND_DOMAIN}/api/certificates/count`,
            method: 'GET'
        }
    },
    experiences: {
        get: {
            url: `${BACKEND_DOMAIN}/api/experiences`,
            method: 'GET'
        },
        add: {
            url: `${BACKEND_DOMAIN}/api/experiences`,
            method: 'POST'
        },
        update: {
            url: (id) => `${BACKEND_DOMAIN}/api/experiences/${id}`,
            method: 'PUT'
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/experiences/${id}`,
            method: 'DELETE'
        },
        total: {
            url: `${BACKEND_DOMAIN}/api/experiences/total`,
            method: 'GET'
        }
    },
    ats: {
        analyze: {
            url: "http://localhost:8001/analyze",
            method: "POST"
        },
        analyzeText: {
            url: "http://localhost:8001/analyze-text",
            method: "POST"
        },
        health: {
            url: "http://localhost:8001/health",
            method: "GET"
        },
        models: {
            url: "http://localhost:8001/models",
            method: "GET"
        },
        batchAnalyze: {
            url: "http://localhost:8001/batch-analyze",
            method: "POST"
        },
        compare: {
            url: "http://localhost:8001/compare",
            method: "POST"
        },
        keywords: {
            url: (industry) => `http://localhost:8001/keywords/${industry}`,
            method: "GET"
        },
        analytics: {
            url: "http://localhost:8001/analytics",
            method: "GET"
        },
        history: {
            url: `${BACKEND_DOMAIN}/api/ats/history`,
            method: "GET"
        },
        scoreHistory: {
            url: `${BACKEND_DOMAIN}/api/ats/score-history`,
            method: "GET"
        },
        scoreTrends: {
            url: `${BACKEND_DOMAIN}/api/ats/score-trends`,
            method: "GET"
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/ats/analysis/${id}`,
            method: "DELETE"
        },
        storeScore: {
            url: `${BACKEND_DOMAIN}/api/ats/store-score`,
            method: "POST"
        }
    },
    resumes: {
        create: {
            url: `${BACKEND_DOMAIN}/api/resumes`,
            method: "POST"
        },
        single: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/${id}`,
            method: "GET"
        },
        update: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/${id}`,
            method: "PUT"
        },
        getAll: {
            url: `${BACKEND_DOMAIN}/api/resumes`,
            method: "GET"
        },
        delete: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/${id}`,
            method: "DELETE"
        },
        // ADDED THIS ENTRY 👇
        default: {
            url: `${BACKEND_DOMAIN}/api/resumes/default-resume`,
            method: "GET"
        },
        upload: {
            url: `${BACKEND_DOMAIN}/api/resumes/upload`,
            method: "POST"
        },
        list: {
            url: `${BACKEND_DOMAIN}/api/resumes/list`,
            method: "GET"
        },
        getPdf: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/pdf/${id}`,
            method: "GET"
        },
        downloadPdf: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/download/${id}`,
            method: "GET"
        },
        deletePdf: {
            url: (id) => `${BACKEND_DOMAIN}/api/resumes/pdf/${id}`,
            method: "DELETE"
        }
    },
    candidates: {
        search: {
            url: `${BACKEND_DOMAIN}/api/candidates/search`,
            method: "GET"
        },
        stats: {
            url: `${BACKEND_DOMAIN}/api/candidates/stats`,
            method: "GET"
        },
        profile: {
            url: (id) => `${BACKEND_DOMAIN}/api/candidates/${id}`,
            method: "GET"
        }
    }
};

export default SummaryApi;