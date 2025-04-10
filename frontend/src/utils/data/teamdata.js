import authLadyImg from "../../assets/img/auth_Lady_img.jpg"; // Corrected import path

const teamDataOld = [
  { name: "Harshita Bhanu", image: authLadyImg },
  { name: "Divanshu Bhargava", image: authLadyImg },
  { name: "Aayushi Thakre", image: authLadyImg },
  { name: "Aryan Kesarwani", image: authLadyImg },
  { name: "Karan Pawar", image: authLadyImg }
];

export default teamDataOld;

export const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Frontend Developer @ Google",
    image: "../../assets/img/member1.jpg", // Updated image path (assuming these exist in img)
    testimonial: "This platform helped me organize my projects and create a resume that finally got me interviews at top tech companies."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Full Stack Developer @ Microsoft",
    image: "../../assets/img/member2.jpg", // Updated image path (assuming these exist in img)
    testimonial: "The ATS Tracker was a game-changer. I improved my resume's score from 65% to 92% and landed my dream job!"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Backend Engineer @ Shopify",
    image: "../../assets/img/member3.jpg", // Updated image path (assuming these exist in img)
    testimonial: "Having all my projects in one place makes it so easy to showcase my work and generate targeted resumes for different roles."
  },
  {
    id: 4,
    name: "Alex Wong",
    role: "Mobile Developer @ Uber",
    image: "../../assets/img/member4.jpg", // Updated image path (assuming these exist in img)
    testimonial: "I credit my career growth to this platform. It helped me organize my development journey and present it professionally."
  },
  {
    id: 5,
    name: "Jessica Patel",
    role: "Data Scientist @ Netflix",
    image: "../../assets/img/member5.jpg", // Updated image path (assuming these exist in img)
    testimonial: "As a data scientist, I needed a way to showcase my projects effectively. This platform made it simple to present my technical work."
  }
];

export const statistics = {
  users: "5,000+",
  resumesGenerated: "15,000+",
  interviewSuccessRate: "85%",
  averageAtsScore: "92%"
};