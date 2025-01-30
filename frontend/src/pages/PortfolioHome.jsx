import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdEdit } from "react-icons/md";


const PortfolioHome = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user?.bio || 'As a dedicated professional, I excel in software development with a focus on creating innovative solutions. My experience in diverse projects and passion for excellence make me a valuable asset. I thrive in fast-paced environments, consistently delivering high-quality results and exceeding expectations.');

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

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
        { name: 'AskUrDoc', image: '../src/img/askurdoc.jpg', link: 'https://github.com/Speedy2705/DBMS_Project' },
        { name: 'E-Commerce', image: '../src/img/E-Commerce.jpg', link: 'https://github.com/Speedy2705/MERN' },
        { name: 'TrackFolio', image: '../src/img/TrackFolio.jpg', link: 'https://github.com/Speedy2705/Pr_Project' },
        { name: 'Gaming Community', image: '../src/img/BigDawgs.png', link: 'https://github.com/Divanshu0212/canuhkit' },
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
                            <img src={user?.photos[0].value} alt="Profile" className="avatar rounded-full w-48 h-48" />
                        </div>
                        <div>
                            <h2 className="text-3xl mb-5 font-semibold">{user?.displayName}</h2>
                            <div className="flex items-center space-x-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={bio}
                                        onChange={handleBioChange}
                                        className="mt-2 px-4 py-2 bg-[#161B22] text-[#E5E5E5] rounded"
                                    />
                                ) : (
                                    <p className="text-gray-400 w-[calc(800px)]">{bio}</p>
                                )}
                                <div
                                    onClick={isEditing ? handleSaveClick : handleEditClick}
                                    className="flex cursor-pointer items-center justify-center w-8 h-8 text-white rounded-full relative z-50"
                                >
                                    <MdEdit />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center pb-4 mb-4 pr-20">
                        <div className="flex justify-center space-x-8">
                            <div>
                                <p className="text-2xl font-semibold">10</p>
                                <p className="text-lg text-gray-400">Projects</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">8</p>
                                <p className="text-lg text-gray-400">Completed Task</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-4 mb-4">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200">
                    <h3 className="text-5xl pb-10 font-semibold">Hero Projects</h3>
                </div>
                <div className="flex space-x-4 overflow-x-auto pt-5 pl-5">
                    {projects.map((project, index) => (
                        <a key={index} href={project.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 hover:scale-105">
                            <img
                                className="h-44 w-44 rounded-full object-cover border-2 border-[#31aad5] hover:scale-100"
                                src={project.image}
                                alt={project.name}
                            />
                            <p className="text-sm text-gray-400">{project.name}</p>
                        </a>
                    ))}
                    <button
                        onClick={handleAddProject}
                        className="flex text-5xl items-center justify-center w-44 h-44 text-[#E5E5E5] rounded-full transition duration-300"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8 border-b border-gray-200">
                <h3 className="text-5xl pb-10 font-semibold">Certificates</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {certificates.map((certificate, index) => (
                    <a key={index} href={certificate.link} target="_blank" rel="noopener noreferrer">
                        <img
                            className="w-full h-full object-cover"
                            src={certificate.image}
                            alt={certificate.name}
                        />
                    </a>
                ))}
                <button
                    onClick={handleAddCertificate}
                    className="flex text-5xl items-center justify-center w-full text-[#E5E5E5] transition duration-300"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

export default PortfolioHome;
