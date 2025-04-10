// src/utils/data/portfolio-mock.js
export const mockPortfolioItems = [
  {
    _id: '1',
    title: 'E-Commerce Website',
    description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product search, cart functionality, and payment processing.',
    category: 'projects',
    image: '/src/assets/img/E-Commerce.jpg',
    startDate: '2023-03-01',
    endDate: '2023-06-15',
    ongoing: false,
    link: 'https://github.com/username/ecommerce-project',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API']
  },
  {
    _id: '2',
    title: 'TrackFolio',
    description: 'Portfolio tracking application with resume builder and ATS analysis capabilities.',
    category: 'projects',
    image: '/src/assets/img/TrackFolio.jpg',
    startDate: '2024-01-10',
    endDate: null,
    ongoing: true,
    link: 'https://github.com/username/trackfolio',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB']
  },
  {
    _id: '3',
    title: 'Medical Consultation Platform',
    description: 'Telemedicine platform connecting patients with doctors for virtual consultations.',
    category: 'projects',
    image: '/src/assets/img/askurdoc.jpg',
    startDate: '2022-09-15',
    endDate: '2023-01-20',
    ongoing: false,
    link: 'https://github.com/username/medical-platform',
    technologies: ['React', 'Socket.io', 'Express', 'PostgreSQL', 'Twilio API']
  },
  {
    _id: '4',
    title: 'JavaScript',
    description: null,
    category: 'skills',
    proficiency: 'expert',
    startDate: '2019-01-01',
    endDate: null,
    ongoing: true
  },
  {
    _id: '5',
    title: 'React.js',
    description: null,
    category: 'skills',
    proficiency: 'advanced',
    startDate: '2020-03-01',
    endDate: null,
    ongoing: true
  },
  {
    _id: '6',
    title: 'Bachelor of Science in Computer Science',
    description: 'Focused on web development, algorithms, and data structures.',
    category: 'education',
    organization: 'University of Technology',
    location: 'San Francisco, CA',
    startDate: '2018-09-01',
    endDate: '2022-05-15',
    ongoing: false,
    degree: 'B.Sc Computer Science',
    grade: '3.8/4.0'
  },
  {
    _id: '7',
    title: 'Front-end Developer',
    description: 'Developed and maintained responsive web applications using React.js and modern JavaScript. Collaborated with UI/UX designers to implement pixel-perfect designs.',
    category: 'experience',
    organization: 'Tech Solutions Inc.',
    location: 'Remote',
    startDate: '2022-06-01',
    endDate: null,
    ongoing: true
  },
  {
    _id: '8',
    title: 'AWS Certified Developer',
    description: 'Certification validating proficiency in developing, deploying, and debugging cloud-based applications using AWS.',
    category: 'certifications',
    organization: 'Amazon Web Services',
    startDate: '2023-02-10',
    endDate: '2026-02-10',
    ongoing: true,
    link: 'https://www.credly.com/badges/aws-certified-developer',
    image: '/src/assets/img/JEE-Certificate.jpg'
  }
];