import React from 'react';

const ContactUs = () => {
  return (
    <div className="bg-[#0D1117] min-h-screen flex flex-col items-center justify-center text-[#E5E5E5] p-8">
      <h1 className="text-4xl font-bold text-[#00FFFF] mb-6">Contact Us</h1>
      <div className="bg-[#161B22] p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <form className="space-y-4">
          <input className="w-full p-3 bg-[#0D1117] border border-[#00FFFF] rounded-md" type="text" placeholder="Your Name" />
          <input className="w-full p-3 bg-[#0D1117] border border-[#00FFFF] rounded-md" type="email" placeholder="Your Email" />
          <textarea className="w-full p-3 bg-[#0D1117] border border-[#00FFFF] rounded-md h-32" placeholder="Your Message"></textarea>
          <button className="w-full p-3 bg-[#9C27B0] text-[#E5E5E5] rounded-md hover:bg-purple-700">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
