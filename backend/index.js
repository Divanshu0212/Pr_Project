const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const cookieSession = require("cookie-session");
const passport = require("passport");
const passportSetup = require("./passport");
const authRoute = require("./routes/auth");
const connectDB = require('./config/db');
const router = require('./routes/auth');
const rateLimit = require('express-rate-limit'); // Add this line

const app = express();

// Configure rate limiter (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app.use(limiter); // Apply global limiter

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

app.listen("5000", () => {
  console.log("Server is running!");
});

app.use("/api", router);
const PORT = 8080 || process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Connect to DB");
    console.log("Server is running !!!!!!!");
  });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Keywords database
const KEYWORDS = {
    technical: [
        'javascript', 'python', 'java', 'react', 'node.js', 'angular',
        'vue.js', 'typescript', 'mongodb', 'sql', 'aws', 'docker',
        'kubernetes', 'ci/cd', 'git', 'rest api', 'graphql'
    ],
    soft_skills: [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'critical thinking', 'time management', 'project management',
        'agile', 'scrum'
    ],
    certifications: [
        'aws certified', 'google certified', 'microsoft certified',
        'pmp', 'scrum master', 'cissp', 'ceh'
    ]
};

const REQUIRED_SECTIONS = [
    'summary',
    'experience',
    'education',
    'skills',
    'contact'
];

// Routes
app.use("/auth", authRoute);
app.use("/api", router);

// ATS Analysis endpoint
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const text = await extractTextFromFile(req.file);
        const analysis = analyzeResume(text);
        
        fs.unlinkSync(req.file.path);
        
        res.json(analysis);
    } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ 
            error: 'Failed to analyze resume',
            details: error.message 
        });
    }
});

// Helper Functions
async function extractTextFromFile(file) {
    const filePath = file.path;
    let text = '';

    try {
        if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
        } else {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        }
        return text;
    } catch (error) {
        throw new Error(`Error extracting text: ${error.message}`);
    }
}

function analyzeResume(text) {
    const lowerText = text.toLowerCase();
    
    const keywordAnalysis = analyzeKeywords(lowerText);
    const sectionAnalysis = analyzeSections(lowerText);
    const formatAnalysis = analyzeFormat(text);
    const scores = calculateScores(keywordAnalysis, sectionAnalysis, formatAnalysis);

    return {
        overallScore: scores.overall,
        keywordMatch: scores.keywords,
        formatScore: scores.format,
        keywords: {
            matched: keywordAnalysis.matched,
            missing: keywordAnalysis.missing
        },
        sections: sectionAnalysis,
        formatIssues: formatAnalysis.issues,
        details: {
            technicalSkills: keywordAnalysis.technical,
            softSkills: keywordAnalysis.soft,
            certifications: keywordAnalysis.certifications
        }
    };
}

function analyzeKeywords(text) {
    const result = {
        matched: [],
        missing: [],
        technical: [],
        soft: [],
        certifications: [],
        score: 0
    };

    // Check technical skills
    KEYWORDS.technical.forEach(keyword => {
        if (text.includes(keyword)) {
            result.matched.push(keyword);
            result.technical.push(keyword);
        } else {
            result.missing.push(keyword);
        }
    });

    // Check soft skills
    KEYWORDS.soft_skills.forEach(keyword => {
        if (text.includes(keyword)) {
            result.matched.push(keyword);
            result.soft.push(keyword);
        }
    });

    // Check certifications
    KEYWORDS.certifications.forEach(keyword => {
        if (text.includes(keyword)) {
            result.matched.push(keyword);
            result.certifications.push(keyword);
        }
    });

    const totalKeywords = Object.values(KEYWORDS).flat().length;
    result.score = (result.matched.length / totalKeywords) * 100;

    return result;
}

function analyzeSections(text) {
    const sections = {
        found: [],
        missing: [],
        score: 0
    };

    REQUIRED_SECTIONS.forEach(section => {
        if (text.includes(section)) {
            sections.found.push(section);
        } else {
            sections.missing.push(section);
        }
    });

    sections.score = (sections.found.length / REQUIRED_SECTIONS.length) * 100;
    return sections;
}

function analyzeFormat(text) {
    const analysis = {
        issues: [],
        score: 100
    };

    const wordCount = text.split(/\s+/).length;
    if (wordCount < 200) {
        analysis.issues.push('Resume might be too short');
        analysis.score -= 10;
    }
    if (wordCount > 1000) {
        analysis.issues.push('Resume might be too long');
        analysis.score -= 10;
    }

    if (text.includes('|')) {
        analysis.issues.push('Avoid using vertical bars for formatting');
        analysis.score -= 5;
    }

    if (text.match(/\t/g)) {
        analysis.issues.push('Avoid using tabs for formatting');
        analysis.score -= 5;
    }

    if (!text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
        analysis.issues.push('No email address found');
        analysis.score -= 15;
    }

    if (!text.match(/(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)) {
        analysis.issues.push('No phone number found');
        analysis.score -= 10;
    }

    analysis.score = Math.max(0, analysis.score);
    return analysis;
}

function calculateScores(keywordAnalysis, sectionAnalysis, formatAnalysis) {
    return {
        keywords: Math.round(keywordAnalysis.score),
        sections: Math.round(sectionAnalysis.score),
        format: Math.round(formatAnalysis.score),
        overall: Math.round(
            (keywordAnalysis.score * 0.4) +
            (sectionAnalysis.score * 0.3) +
            (formatAnalysis.score * 0.3)
        )
    };
}
// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size is too large. Maximum size is 5MB'
        });
      }
    }
  
    console.error(err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  });
  
  module.exports = app;
