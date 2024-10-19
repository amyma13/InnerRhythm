import React from 'react';
import { useHistory, Link, useLocation } from 'react-router-dom';

function HomePage() {
  const history = useHistory();
  const location = useLocation();
  const { mood } = location.state;

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-4xl font-semibold mt-2 mb-0">
          <span className="text-green-500">Inner</span> Rhythm
        </h1>
        <Link to="/" className="text-gray-400 hover:text-green-500">Logout</Link>
      </div>


      <div className="container flex flex-col items-center justify-center h-screen p-6">
        <div className="button-row space-y-8 w-full max-w-lg">
        
          <button
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded w-full h-20"
          >
            Create Party
          </button>
     
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded w-full h-20"
          >
            Profile
          </button>
  
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded w-full h-20"
          >
            Join/View Party
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
