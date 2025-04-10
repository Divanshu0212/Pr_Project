import React from 'react';

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="relative w-12 h-12">
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></div>
        <div className="relative inline-flex rounded-full h-12 w-12 bg-cyan-500"></div>
      </div>
    </div>
  );
};

export default Loader;