import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdEdit } from "react-icons/md";
import PropTypes from 'prop-types';
import '../../styles/pages/PortfolioHome.css'; // Assuming you have a CSS file for styles

const PortfolioHome = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user?.bio || 'As a dedicated professional, I excel in software development with a focus on creating innovative solutions. My experience in diverse projects and passion for excellence make me a valuable asset. I thrive in fast-paced environments, consistently delivering high-quality results and exceeding expectations.');
    const [hoveredProject, setHoveredProject] = useState(null);

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };
    const skills = [
        'javascript', 'python', 'java', 'react', 'node.js', 'angular',
        'vue.js', 'typescript', 'mongodb', 'sql', 'aws', 'docker',
        'kubernetes', 'ci/cd', 'git', 'rest api', 'graphql'
    ];

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // Save the updated bio to the server or context here if needed
    };

    const handleAddProject = () => {
        console.log('Add new project');
    };

    const handleAddCertificate = () => {
        console.log('Add new certificate');
    };

    const projects = [
        { name: 'AskUrDoc', image: '../src/img/askurdoc.jpg', link: 'https://github.com/Speedy2705/DBMS_Project', description: 'A project description for AskUrDoc.' },
        { name: 'E-Commerce', image: '../src/img/E-Commerce.jpg', link: 'https://github.com/Speedy2705/MERN', description: 'A project description for E-Commerce.' },
        { name: 'TrackFolio', image: '../src/img/TrackFolio.jpg', link: 'https://github.com/Speedy2705/Pr_Project', description: 'A project description for TrackFolio.' },
        { name: 'Gaming Community', image: '../src/img/BigDawgs.png', link: 'https://github.com/Divanshu0212/canuhkit', description: 'A project description for Gaming Community.' },
    ];

    const certificates = [
        { name: '12th Certificate', image: '../src/img/12th-Certificate.jpg', link: 'https://example.com/certificate1' },
        { name: 'JEE Certificate', image: '../src/img/JEE-Certificate.jpg', link: 'https://example.com/certificate2' },
    ];

    return (
        <div className="mx-auto p-4 w-full bg-[#0D1117] text-[#E5E5E5]">
            <div className="flex justify-between items-center pb-4 mb-4">
                <div className="flex items-center justify-between space-x-4 w-full">
                    <div className='flex items-center justify-between space-x-4'>
                        <div className="mb-4 ml-20">
                            <img src={user?.photos?.[0]?.value} alt="Profile" className="avatar rounded-full w-48 h-48" />
                        </div>
                        <div className='w-[calc(750px)]'>
                            <h2 className="text-3xl mb-5 font-semibold text-left">{user?.displayName}</h2>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={bio}
                                        onChange={handleBioChange}
                                        className="mt-2 px-4 py-2 bg-[#161B22] text-[#E5E5E5] rounded"
                                    />
                                ) : (
                                    <p className="text-gray-400 w-[calc(800px)] text-left">{bio}</p>
                                )}
                                <div
                                    onClick={isEditing ? handleSaveClick : handleEditClick}
                                    className="flex cursor-pointer items-center justify-center w-8 h-8 text-white rounded-full relative z-50"
                                >
                                    <MdEdit />
                                </div>
                            </div>
                            <div className='skills'>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="px-4 py-2 border border-[#00FFFF] text-[#00FFFF] rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center pb-4 mb-4 pr-20">
                        <div className="flex justify-center space-x-8">
                            <div>
                                <p className="text-xl text-[#00FFFF] font-semibold">10</p>
                                <p className="text-lg text-[#9C27B0]">Projects</p>
                            </div>
                            <div>
                                <p className="text-xl text-[#00FFFF] font-semibold">8</p>
                                <p className="text-lg text-[#9C27B0]">Completed Task</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-4 mb-4">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200">
                    <h3 className="text-3xl text-[#00FFFF] pb-10 font-semibold">Pinned Projects</h3>
                </div>
                <div className="flex h-[calc(445px)] space-x-4 overflow-x-auto gap-16 pt-7 pl-20 relative z-50">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            onMouseEnter={() => setHoveredProject(index)}
                            onMouseLeave={() => setHoveredProject(null)}
                            className="relative flex flex-col items-center space-y-2 hover:scale-105 transition duration-300"
                        >
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2">
                                <img
                                    className="h-32 w-32 rounded-full object-cover border-2 border-[#31aad5] shadow-md transform transition hover:scale-105 hover:shadow-[0_10px_40px_rgba(0,255,255,0.5)] duration-300"
                                    src={project.image}
                                    alt={project.name}
                                />
                                <p className="text-sm text-gray-400">{project.name}</p>
                            </a>
                            {hoveredProject === index && (
                                <div className="absolute left-1/2 top-[calc(400px)] z-50 transform -translate-x-1/2 -translate-y-full mt-2 w-64 p-4 bg-[#161B22] text-[#E5E5E5] rounded-lg shadow-lg">
                                    <h4 className="text-lg font-semibold mb-2">{project.name}</h4>
                                    <p className="text-sm mb-2">{project.description}</p>
                                    <img src={project.image} alt={project.name} className="w-full h-32 object-cover rounded" />
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 inline-block">View Project</a>
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={handleAddProject}
                        className="flex text-5xl items-center justify-center w-32 h-32 text-[#E5E5E5] rounded-full transition duration-300"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            <div className="relative -top-52 flex justify-between items-center mb-8 border-b border-gray-200">
                <h3 className="text-3xl text-[#00FFFF] pb-10 font-semibold">Certificates</h3>
            </div>
            <div className="grid grid-cols-3 relative -top-52 h-1">
                {certificates.map((certificate, index) => (
                    <a key={index} href={certificate.link} target="_blank" rel="noopener noreferrer">
                        <img
                            className="w-[calc(450px)] h-52 object-cover"
                            src={certificate.image}
                            alt={certificate.name}
                        />
                    </a>
                ))}
                <button
                    onClick={handleAddCertificate}
                    className="flex text-5xl items-center justify-center w-96 h-56 text-[#E5E5E5] transition duration-300"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

PortfolioHome.propTypes = {
    user: PropTypes.shape({
        bio: PropTypes.string,
        photos: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.string,
            })
        ),
        displayName: PropTypes.string,
    }),
};

export default PortfolioHome;