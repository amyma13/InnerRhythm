import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';

function Mood() {
  const history = useHistory();

  // Clear currMood once when the component first mounts
  useEffect(() => {
    sessionStorage.setItem('currMood', JSON.stringify({})); // Reset currMood only once when the component mounts
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Manage button states with an object where the keys are the moods and the values are booleans
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

  const toggleMood = (mood) => {
    // Step 1: Update the button's selected state
    const updatedMoods = {
      ...selectedMoods,
      [mood]: !selectedMoods[mood], // Toggle the mood's state
    };

    setSelectedMoods(updatedMoods);

    // Step 2: Modify currMood in sessionStorage
    let currMood = JSON.parse(sessionStorage.getItem('currMood')) || {};

    if (!selectedMoods[mood]) {
      // If the button was grey and is now green, add the mood to currMood
      currMood[mood] = null;
    } else {
      // If the button was green and is now grey, remove the mood from currMood
      delete currMood[mood];
    }

    // Step 3: Store the updated currMood back into sessionStorage
    sessionStorage.setItem('currMood', JSON.stringify(currMood));

    console.log(sessionStorage.getItem('currMood'));
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col justify-between">

      <div className="flex justify-between items-center p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-green-500">Inner Rhythm</h1>
        <Link to="/" className="text-gray-400 hover:text-green-500">Logout</Link>
      </div>

      <div className="flex flex-col items-center justify-center mt-6">
        <h2 className="text-2xl font-semibold">How are you feeling?</h2>
      </div>

      <div className="container mx-auto p-6 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {Object.keys(selectedMoods).map((mood) => (
            <button
              key={mood}
              className={`${
                selectedMoods[mood] ? "bg-green-500 text-black" : "bg-gray-800 text-white"
              } hover:bg-green-400 font-bold py-4 rounded`}
              onClick={() => toggleMood(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Centered "all done here!" button at the bottom */}
      <div className="flex justify-center p-6">
        <button
          className="bg-gray-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition duration-300"
          onClick={() => {
            let currMood = JSON.parse(sessionStorage.getItem('currMood')) || {};
            const numItems = Object.keys(currMood).length;

            const valuePerMood = numItems > 0 ? (1 / numItems).toFixed(2) : 0;
            for (let key in currMood) {
              currMood[key] = parseFloat(valuePerMood); // Set each key's value, ensuring it's a number
            }
            sessionStorage.setItem('currMood', JSON.stringify(currMood));
            console.log(sessionStorage.getItem('currMood'));
            
            // Uncomment this to navigate to homepage after the operation
            history.push('/homepage'); 
            window.location.reload();
          }}
        >
          all done here!
        </button>
      </div>
    </div>
  );
}

export default Mood;
