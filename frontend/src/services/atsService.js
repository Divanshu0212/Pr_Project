// Mock data for frontend development - will connect to actual backend later
const mockAnalysis = {
  id: "analysis-123",
  resumeName: "John_Doe_Frontend_Developer.pdf",
  jobTitle: "Senior Frontend Developer",
  score: 78,
  categoryScores: [
    { name: "Format", score: 90 },
    { name: "Keywords", score: 75 },
    { name: "Skills", score: 82 },
    { name: "Experience", score: 68 },
  ],
  format: {
    type: "PDF",
    isCompatible: true,
    issues: [],
  },
  keywordMatchPercentage: 75,
  skillsMatchPercentage: 82,
  keyPhraseCount: 12,
  readabilityScore: 8,
  matchedKeywords: [
    "React", "JavaScript", "CSS", "HTML", "Redux", "TypeScript", 
    "Responsive Design", "Frontend", "UI/UX", "Git"
  ],
  missingKeywords: [
    "Vue.js", "GraphQL", "Jest", "CI/CD", "Docker"
  ],
  jobDescription: "We're looking for a Senior Frontend Developer who is proficient in React, Redux, JavaScript, TypeScript, HTML5, and CSS3. The ideal candidate should have experience with Vue.js, GraphQL, Jest testing, and CI/CD pipelines. Knowledge of Docker is a plus.",
  improvementSuggestions: [
    {
      text: "Add missing keywords like Vue.js and GraphQL to your resume if you have experience with them.",
      example: "Developed components using both React and Vue.js for different client projects."
    },
    {
      text: "Include more specific metrics and achievements in your experience section.",
      example: "Improved site performance by reducing load time by 40% through code optimization."
    },
    {
      text: "Highlight testing experience with Jest or other testing frameworks.",
      example: "Implemented comprehensive test suite using Jest and React Testing Library with 80% code coverage."
    },
    {
      text: "Add a brief section about any DevOps experience, especially CI/CD and Docker.",
      example: "Familiar with Docker containerization and GitHub Actions CI/CD pipelines."
    }
  ]
};

// Mock data for keyword analysis
const mockKeywordAnalysis = {
  matchRate: 67,
  matchedKeywords: [
    { keyword: "React", occurrences: 5, importance: "high" },
    { keyword: "JavaScript", occurrences: 8, importance: "high" },
    { keyword: "CSS", occurrences: 4, importance: "medium" },
    { keyword: "HTML", occurrences: 3, importance: "medium" },
    { keyword: "Redux", occurrences: 2, importance: "high" },
    { keyword: "TypeScript", occurrences: 3, importance: "high" },
    { keyword: "Responsive Design", occurrences: 1, importance: "medium" },
    { keyword: "Frontend", occurrences: 6, importance: "high" },
    { keyword: "UI/UX", occurrences: 2, importance: "medium" },
    { keyword: "Git", occurrences: 1, importance: "low" }
  ],
  missingKeywords: [
    { keyword: "Vue.js", importance: "high" },
    { keyword: "GraphQL", importance: "high" },
    { keyword: "Jest", importance: "medium" },
    { keyword: "CI/CD", importance: "medium" },
    { keyword: "Docker", importance: "low" }
  ],
  recommendations: [
    "Add the high-importance keywords Vue.js and GraphQL to your resume if you have experience with them.",
    "Include testing frameworks like Jest in your skills section.",
    "Mention any experience with CI/CD pipelines or DevOps practices.",
    "Consider increasing the frequency of high-importance keywords like React and Redux."
  ]
};

// Mock resume list for comparison tool
const mockResumes = [
  {
    id: "resume-1",
    name: "Frontend_Developer_v1.pdf",
    score: 72,
    matchedKeywords: ["React", "JavaScript", "CSS", "HTML", "Redux", "Frontend", "UI/UX", "Git"]
  },
  {
    id: "resume-2",
    name: "Frontend_Developer_v2.pdf",
    score: 78,
    matchedKeywords: ["React", "JavaScript", "CSS", "HTML", "Redux", "TypeScript", "Frontend", "UI/UX", "Git"]
  },
  {
    id: "resume-3",
    name: "Frontend_Developer_v3.pdf",
    score: 85,
    matchedKeywords: ["React", "JavaScript", "CSS", "HTML", "Redux", "TypeScript", "Responsive Design", "Frontend", "UI/UX", "Git", "Jest"]
  }
];

// Simulate API calls with promises
export const analyzeResume = async (file, jobDescription) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve("analysis-123");
    }, 2000);
  });
};

export const getAnalysisById = async (analysisId) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(mockAnalysis);
    }, 1000);
  });
};

export const analyzeKeywords = async (resumeText, jobDescription) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(mockKeywordAnalysis);
    }, 1500);
  });
};

export const getResumesList = async () => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(mockResumes);
    }, 800);
  });
};

export const compareResumes = async (resumeId1, resumeId2, jobDescription) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const resume1 = mockResumes.find(r => r.id === resumeId1);
      const resume2 = mockResumes.find(r => r.id === resumeId2);
      
      resolve({
        scoreComparison: {
          resume1: resume1.score,
          resume2: resume2.score,
          difference: Math.abs(resume1.score - resume2.score)
        },
        keywordComparison: {
          resume1: resume1.matchedKeywords,
          resume2: resume2.matchedKeywords,
          uniqueToResume1: resume1.matchedKeywords.filter(k => !resume2.matchedKeywords.includes(k)),
          uniqueToResume2: resume2.matchedKeywords.filter(k => !resume1.matchedKeywords.includes(k))
        }
      });
    }, 1500);
  });
};