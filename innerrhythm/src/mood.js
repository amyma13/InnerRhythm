import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';

import { chooseActivity } from './activityRec';


function Mood() {
  const history = useHistory();

  // Clear currMood once when the component first mounts
  useEffect(() => {
    sessionStorage.setItem('currMood', JSON.stringify({}));
  }, []);

  // Manage selected mood states
  const [selectedMoods, setSelectedMoods] = useState({
    Happy: false,
    Relaxed: false,
    Energetic: false,
    Sad: false,
    Focused: false,
    Calm: false,
    Excited: false,
    Angry: false,
    Overwhelmed: false,
  });

  // Progress state
  const [progress, setProgress] = useState(0);

  const toggleMood = (mood) => {
    const updatedMoods = { ...selectedMoods, [mood]: !selectedMoods[mood] };
    setSelectedMoods(updatedMoods);

    let currMood = JSON.parse(sessionStorage.getItem('currMood')) || {};
    if (!selectedMoods[mood]) {
      currMood[mood] = null;
    } else {
      delete currMood[mood];
    }

    sessionStorage.setItem('currMood', JSON.stringify(currMood));
    setProgress(Object.keys(currMood).length / Object.keys(selectedMoods).length * 100);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      
      <div className="flex justify-between items-center p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-green-500">Inner Rhythm</h1>
        <Link to="/" className="text-gray-400 hover:text-green-500">Logout</Link>
      </div>

      <div className="flex flex-col items-center mt-6">
        <h2 className="text-3xl font-bold mb-2">What's your vibe today?</h2>
        <p className="text-gray-400 mb-4">Tap to select your current mood(s)</p>

        {/* Progress bar */}
        <div className="w-full max-w-lg bg-gray-800 rounded-full h-2.5 mb-6">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-6 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {Object.keys(selectedMoods).map((mood) => (
            <button
              key={mood}
              className={`relative ${
                selectedMoods[mood] ? 'bg-green-500 text-black' : 'bg-gray-800 text-white'
              } hover:bg-green-400 transition-all duration-300 transform hover:scale-105 font-bold py-4 rounded`}
              onClick={() => toggleMood(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center p-6">
        <button
          className="bg-gray-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition duration-300"
          onClick={() => {
            let currMood = JSON.parse(sessionStorage.getItem('currMood')) || {};
            const numItems = Object.keys(currMood).length;
            const valuePerMood = numItems > 0 ? (100 / numItems).toFixed(2) : 0;

            for (let key in currMood) {
              currMood[key] = parseFloat(valuePerMood);
            }
            
            sessionStorage.setItem('currMood', JSON.stringify(currMood));           
            history.push('/homepage');
            window.location.reload();

            console.log("HER")
            chooseActivity();

          }}
        >
          all done here!
        </button>
      </div>
    </div>
  );
}

export default Mood;
