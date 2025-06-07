import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResumeOptimizer = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [error, setError] = useState(null);

  // Define the backend URL (replace if different)
  const BACKEND_URL = 'http://localhost:8000'; // Adjust if your backend runs elsewhere

  // Fetch default data on component mount
  useEffect(() => {
    const fetchDefaultData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/api/default-resume`);
        // Ensure experiences is always an array
        if (!response.data.experiences) {
            response.data.experiences = [];
        }
        setResumeData(response.data);
      } catch (err) {
        setError('Failed to load default resume data. Please ensure the backend is running.');
        // Fallback to a minimal structure if fetch fails
        setResumeData({
          name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", target_profession: "Software Engineer",
          education: [], experiences: [], projects: [], skills: [], achievements: [], coding_profiles: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDefaultData();
  }, []);

  // --- Helper Functions for Form Handling ---

  const handleInputChange = (e, section, index, field) => {
    const { value } = e.target;
    setResumeData(prevData => {
      const newData = { ...prevData };
      if (index === undefined) { // Top-level field
        newData[section] = value;
      } else { // Field within an array item
        const updatedSection = [...newData[section]];
        updatedSection[index] = { ...updatedSection[index], [field]: value };
        newData[section] = updatedSection;
      }
      return newData;
    });
  };

 const handleTextAreaChange = (e, section, index, subIndex, field) => {
    const { value } = e.target;
    setResumeData(prevData => {
        const newData = { ...prevData };
        const updatedSection = [...newData[section]];
        const updatedItem = { ...updatedSection[index] };
        const updatedDescription = [...updatedItem.description];
        updatedDescription[subIndex] = value;
        updatedItem.description = updatedDescription;
        updatedSection[index] = updatedItem;
        newData[section] = updatedSection;
        return newData;
    });
 };


 const handleSkillChange = (e, categoryIndex, skillIndex) => {
    const { value } = e.target;
    setResumeData(prevData => {
        const newData = { ...prevData };
        const updatedSkills = [...newData.skills];
        const updatedCategory = { ...updatedSkills[categoryIndex] };
        const updatedSkillList = [...updatedCategory.skills];
        updatedSkillList[skillIndex] = value;
        updatedCategory.skills = updatedSkillList;
        updatedSkills[categoryIndex] = updatedCategory;
        newData.skills = updatedSkills;
        return newData;
    });
 };

 const handleAddItem = (section) => {
    setResumeData(prevData => {
      const newData = { ...prevData };
      const newItem = getNewItemTemplate(section);
      newData[section] = [...(newData[section] || []), newItem]; // Ensure section exists
      return newData;
    });
  };

 const handleRemoveItem = (section, index) => {
    setResumeData(prevData => {
      const newData = { ...prevData };
      const updatedSection = [...newData[section]];
      updatedSection.splice(index, 1);
      newData[section] = updatedSection;
      return newData;
    });
  };

 const handleAddBulletPoint = (section, index, field = 'description') => {
     setResumeData(prevData => {
         const newData = { ...prevData };
         const updatedSection = [...newData[section]];
         const updatedItem = { ...updatedSection[index] };
         updatedItem[field] = [...(updatedItem[field] || []), ""]; // Add empty string for new bullet
         updatedSection[index] = updatedItem;
         newData[section] = updatedSection;
         return newData;
     });
 };

  const handleRemoveBulletPoint = (section, index, subIndex, field = 'description') => {
      setResumeData(prevData => {
          const newData = { ...prevData };
          const updatedSection = [...newData[section]];
          const updatedItem = { ...updatedSection[index] };
          const updatedList = [...updatedItem[field]];
          updatedList.splice(subIndex, 1);
          updatedItem[field] = updatedList;
          updatedSection[index] = updatedItem;
          newData[section] = updatedSection;
          return newData;
      });
  };

  const handleAddSkill = (categoryIndex) => {
    setResumeData(prevData => {
        const newData = { ...prevData };
        const updatedSkills = [...newData.skills];
        const updatedCategory = { ...updatedSkills[categoryIndex] };
        updatedCategory.skills = [...updatedCategory.skills, ""];
        updatedSkills[categoryIndex] = updatedCategory;
        newData.skills = updatedSkills;
        return newData;
    })
  }

  const handleRemoveSkill = (categoryIndex, skillIndex) => {
    setResumeData(prevData => {
        const newData = { ...prevData };
        const updatedSkills = [...newData.skills];
        const updatedCategory = { ...updatedSkills[categoryIndex] };
        const updatedSkillList = [...updatedCategory.skills];
        updatedSkillList.splice(skillIndex, 1);
        updatedCategory.skills = updatedSkillList;
        updatedSkills[categoryIndex] = updatedCategory;
        newData.skills = updatedSkills;
        return newData;
    })
  }


  // --- Template for New Items ---
  const getNewItemTemplate = (section) => {
    switch (section) {
      case 'education':
        return { institution: "", degree: "", field: "", date_range: "", gpa: "" };
      case 'experiences':
        return { company: "", position: "", date_range: "", description: [""] };
      case 'projects':
        return { name: "", description: [""], link: "", technologies: [] }; // Tech as string for input ease
      case 'skills':
        return { category: "", skills: [""] };
      case 'achievements':
        return { title: "", description: "" };
      case 'coding_profiles':
        return { platform: "", url: "" };
      default:
        return {};
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOptimizing(true);
    setError(null);
    setOptimizationResult(null);

    try {
        // Basic validation example (expand as needed)
        if (!resumeData.name || !resumeData.email || !resumeData.phone || !resumeData.target_profession) {
            throw new Error("Please fill in all required fields (Name, Email, Phone, Target Profession).");
        }

      // Clean up data before sending (e.g., parse technologies string)
       const dataToSend = {
          ...resumeData,
           projects: resumeData.projects.map(p => ({
              ...p,
              // Split technologies string into array, trim whitespace
              technologies: typeof p.technologies === 'string'
                   ? p.technologies.split(',').map(t => t.trim()).filter(t => t)
                   : (p.technologies || []) // Keep as is if already array or null/undefined
           }))
       };


      const response = await axios.post(`${BACKEND_URL}/api/optimize-resume`, dataToSend);
      setOptimizationResult(response.data);
    } catch (err) {
       setError(err.response?.data?.detail || err.message || 'Failed to optimize resume.');
    } finally {
      setOptimizing(false);
    }
  };

  // --- Render Loading/Error/Form ---
  if (loading) {
    return <div className="text-center p-10">Loading resume data...</div>;
  }

  // Render form only when resumeData is available
  if (!resumeData) {
     return <div className="text-center p-10 text-red-500">{error || 'Could not load resume data.'}</div>;
  }


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">ATS Resume Optimizer</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Personal Information --- */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name" value={resumeData.name} onChange={e => handleInputChange(e, 'name')} required />
            <InputField label="Email" type="email" value={resumeData.email} onChange={e => handleInputChange(e, 'email')} required />
            <InputField label="Phone" type="tel" value={resumeData.phone} onChange={e => handleInputChange(e, 'phone')} required />
            <InputField label="LinkedIn Profile URL (Optional)" value={resumeData.linkedin || ''} onChange={e => handleInputChange(e, 'linkedin')} />
            <InputField label="GitHub Profile URL (Optional)" value={resumeData.github || ''} onChange={e => handleInputChange(e, 'github')} />
            <InputField label="Portfolio URL (Optional)" value={resumeData.portfolio || ''} onChange={e => handleInputChange(e, 'portfolio')} />
            <InputField label="Target Profession" value={resumeData.target_profession} onChange={e => handleInputChange(e, 'target_profession')} required placeholder="e.g., Software Engineer, Data Scientist"/>
          </div>
        </section>

        {/* --- Education --- */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
            Education
            <button type="button" onClick={() => handleAddItem('education')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Education</button>
          </h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border rounded relative">
              <button type="button" onClick={() => handleRemoveItem('education', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Institution" value={edu.institution} onChange={e => handleInputChange(e, 'education', index, 'institution')} required />
                <InputField label="Degree" value={edu.degree} onChange={e => handleInputChange(e, 'education', index, 'degree')} required />
                <InputField label="Field of Study" value={edu.field} onChange={e => handleInputChange(e, 'education', index, 'field')} />
                <InputField label="Date Range" value={edu.date_range} onChange={e => handleInputChange(e, 'education', index, 'date_range')} required placeholder="e.g., Aug 2020 - May 2024" />
                <InputField label="GPA / Percentage (Optional)" value={edu.gpa || ''} onChange={e => handleInputChange(e, 'education', index, 'gpa')} />
              </div>
            </div>
          ))}
        </section>

        {/* --- Experience --- */}
        <section className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
             Experience
             <button type="button" onClick={() => handleAddItem('experiences')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Experience</button>
           </h2>
           {resumeData.experiences && resumeData.experiences.map((exp, index) => (
             <div key={index} className="mb-4 p-4 border rounded relative">
               <button type="button" onClick={() => handleRemoveItem('experiences', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                 <InputField label="Company" value={exp.company} onChange={e => handleInputChange(e, 'experiences', index, 'company')} required />
                 <InputField label="Position" value={exp.position} onChange={e => handleInputChange(e, 'experiences', index, 'position')} required />
                 <InputField label="Date Range" value={exp.date_range} onChange={e => handleInputChange(e, 'experiences', index, 'date_range')} required placeholder="e.g., Jun 2022 - Present" />
               </div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Description (Bullet Points):</label>
               {exp.description.map((desc, descIndex) => (
                 <div key={descIndex} className="flex items-center mb-2">
                   <span className="mr-2 text-gray-600">&bull;</span>
                   <textarea
                     value={desc}
                     onChange={e => handleTextAreaChange(e, 'experiences', index, descIndex, 'description')}
                     className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     rows="2"
                     required
                   ></textarea>
                    <button type="button" onClick={() => handleRemoveBulletPoint('experiences', index, descIndex)} className="ml-2 text-red-400 hover:text-red-600 text-xs">Remove</button>
                 </div>
               ))}
                <button type="button" onClick={() => handleAddBulletPoint('experiences', index)} className="mt-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded">Add Bullet Point</button>
             </div>
           ))}
           {(!resumeData.experiences || resumeData.experiences.length === 0) && <p className="text-gray-500 italic">No experience added yet.</p> }
        </section>


       {/* --- Projects --- */}
        <section className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
             Projects
             <button type="button" onClick={() => handleAddItem('projects')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Project</button>
           </h2>
           {resumeData.projects.map((proj, index) => (
             <div key={index} className="mb-4 p-4 border rounded relative">
               <button type="button" onClick={() => handleRemoveItem('projects', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <InputField label="Project Name" value={proj.name} onChange={e => handleInputChange(e, 'projects', index, 'name')} required />
                  <InputField label="Project Link (Optional)" value={proj.link || ''} onChange={e => handleInputChange(e, 'projects', index, 'link')} />
                   <InputField
                      label="Technologies (comma-separated, Optional)"
                      value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '')}
                      onChange={e => handleInputChange(e, 'projects', index, 'technologies')} // Store as string temporarily
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
               </div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Description (Bullet Points):</label>
               {proj.description.map((desc, descIndex) => (
                 <div key={descIndex} className="flex items-center mb-2">
                   <span className="mr-2 text-gray-600">&bull;</span>
                   <textarea
                     value={desc}
                     onChange={e => handleTextAreaChange(e, 'projects', index, descIndex, 'description')}
                     className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     rows="2"
                     required
                   ></textarea>
                   <button type="button" onClick={() => handleRemoveBulletPoint('projects', index, descIndex)} className="ml-2 text-red-400 hover:text-red-600 text-xs">Remove</button>
                 </div>
               ))}
               <button type="button" onClick={() => handleAddBulletPoint('projects', index)} className="mt-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded">Add Bullet Point</button>
             </div>
           ))}
        </section>

       {/* --- Skills --- */}
        <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                Skills
                <button type="button" onClick={() => handleAddItem('skills')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Skill Category</button>
            </h2>
            {resumeData.skills.map((skillCat, catIndex) => (
                <div key={catIndex} className="mb-4 p-4 border rounded relative">
                     <button type="button" onClick={() => handleRemoveItem('skills', catIndex)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                     <InputField
                         label="Skill Category"
                         value={skillCat.category}
                         onChange={e => handleInputChange(e, 'skills', catIndex, 'category')}
                         required
                         className="mb-3"
                     />
                     <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated or add individually):</label>
                    <div className="space-y-2">
                     {skillCat.skills.map((skill, skillIndex) => (
                         <div key={skillIndex} className="flex items-center">
                             <input
                                 type="text"
                                 value={skill}
                                 onChange={e => handleSkillChange(e, catIndex, skillIndex)}
                                 className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                 placeholder="Enter a skill"
                             />
                              <button type="button" onClick={() => handleRemoveSkill(catIndex, skillIndex)} className="ml-2 text-red-400 hover:text-red-600 text-xs">Remove</button>
                         </div>
                     ))}
                     </div>
                     <button type="button" onClick={() => handleAddSkill(catIndex)} className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded">Add Skill</button>
                </div>
             ))}
        </section>


       {/* --- Achievements (Optional) --- */}
        <section className="bg-white p-6 rounded-lg shadow">
             <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                 Achievements (Optional)
                 <button type="button" onClick={() => handleAddItem('achievements')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Achievement</button>
             </h2>
             {resumeData.achievements && resumeData.achievements.map((ach, index) => (
                 <div key={index} className="mb-4 p-4 border rounded relative">
                    <button type="button" onClick={() => handleRemoveItem('achievements', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                    <InputField label="Title" value={ach.title} onChange={e => handleInputChange(e, 'achievements', index, 'title')} />
                    <label htmlFor={`achievement-desc-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id={`achievement-desc-${index}`}
                        value={ach.description}
                        onChange={e => handleInputChange(e, 'achievements', index, 'description')}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows="2"
                    ></textarea>
                 </div>
             ))}
             {(!resumeData.achievements || resumeData.achievements.length === 0) && <p className="text-gray-500 italic">No achievements added yet.</p> }
        </section>

       {/* --- Coding Profiles (Optional) --- */}
        <section className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
               Coding Profiles (Optional)
               <button type="button" onClick={() => handleAddItem('coding_profiles')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Profile</button>
           </h2>
           {resumeData.coding_profiles && resumeData.coding_profiles.map((prof, index) => (
               <div key={index} className="mb-4 p-4 border rounded relative">
                   <button type="button" onClick={() => handleRemoveItem('coding_profiles', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <InputField label="Platform" value={prof.platform} onChange={e => handleInputChange(e, 'coding_profiles', index, 'platform')} placeholder="e.g., LeetCode, CodeChef" />
                       <InputField label="Profile URL" value={prof.url} onChange={e => handleInputChange(e, 'coding_profiles', index, 'url')} />
                   </div>
               </div>
           ))}
           {(!resumeData.coding_profiles || resumeData.coding_profiles.length === 0) && <p className="text-gray-500 italic">No coding profiles added yet.</p> }
        </section>


        {/* --- Submit Button --- */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={optimizing || loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {optimizing ? 'Optimizing...' : 'Optimize Resume & Generate PDF'}
          </button>
        </div>
      </form>

      {/* --- Optimization Results --- */}
      {optimizationResult && (
        <section className="mt-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Optimization Complete!</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
             <h3 className="text-lg font-semibold text-blue-800 mb-2">Estimated ATS Score:</h3>
             <p className="text-3xl font-bold text-blue-600">{optimizationResult.ats_score.toFixed(1)} / 100</p>
           </div>


          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Improvement Notes:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {optimizationResult.improvement_notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Download Optimized Resume:</h3>
            <a
              href={optimizationResult.pdf_url}
              download="optimized_resume.pdf"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Download PDF
            </a>
            <p className="text-xs text-gray-500 mt-1">This is a base64 encoded PDF. Click to download.</p>
          </div>

           {/* Optional: Display Optimized Data JSON */}
           {/*
           <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimized Data (JSON):</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(optimizationResult.optimized_data, null, 2)}
                </pre>
           </div>
           */}
        </section>
      )}
    </div>
  );
};


// Helper component for input fields
const InputField = ({ label, type = 'text', value, onChange, required = false, placeholder = '', className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder || label}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);


export default ResumeOptimizer;