import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function Mood() {
  const history = useHistory();

  // Manage selected mood states
  const [selectedMoods, setSelectedMoods] = useState({});
  const [moods, setMoods] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [showSecondModal, setShowSecondModal] = useState(false); // State for second modal

  const getMoods = async () => {
    const username = sessionStorage.getItem("username");
    const findDoc = doc(db, 'Users', username);
    const docUserInfo = await getDoc(findDoc);

    if (docUserInfo.exists()) {
      const userData = docUserInfo.data();
      const emotions = userData.emotions || []; // Default to empty array if no emotions

      // Initialize selectedMoods based on fetched emotions
      const initialSelectedMoods = {};
      emotions.forEach(mood => {
        initialSelectedMoods[mood.name] = false; // Initialize each mood as not selected
      });

      setMoods(emotions);
      setSelectedMoods(initialSelectedMoods); // Set selectedMoods based on fetched data
    } else {
      console.log('No such document!');
    }
  };

  // Clear currMood once when the component first mounts
  useEffect(() => {
    sessionStorage.setItem('currMood', JSON.stringify({}));
    getMoods();
  }, []);

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
    setProgress(Object.keys(currMood).length / Object.keys(updatedMoods).length * 100);
  };

  // New function to handle submit
  const handleSubmit = () => {
    setShowModal(true); // Show modal on submit click
  };

  // Function to confirm submission
  const confirmSubmission = () => {
    let currMood = JSON.parse(sessionStorage.getItem('currMood')) || {};
    const numItems = Object.keys(currMood).length;
    const valuePerMood = numItems > 0 ? (100 / numItems).toFixed(2) : 0;

    for (let key in currMood) {
      currMood[key] = parseFloat(valuePerMood);
    }

    sessionStorage.setItem('currMood', JSON.stringify(currMood));
    setShowModal(false); // Close first modal
    setShowSecondModal(true); // Show second modal
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
        {/* New submit button */}
        <button
          className="bg-gray-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition duration-300 mr-4"
          onClick={handleSubmit}
        >
          Submit
        </button>
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
          }}
        >
          all done here!
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="mb-4">Are you sure you want to submit your mood selections?</p>
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowModal(false)} // Close modal without submitting
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
                onClick={confirmSubmission} // Confirm and submit
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Modal */}
      {showSecondModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Let's tune into your inner rhythm...</h2>
      <p className="mb-4">Now would be a good time to go on a 15-minute run!</p>
      <p className="mb-4">Here is our recommended playlist for this:</p>
      <ul className="mb-4 list-disc list-inside text-gray-300">
        <li>1. "Can't Stop the Feeling!" by Justin Timberlake</li>
        <li>2. "Uptown Funk" by Mark Ronson ft. Bruno Mars</li>
        <li>3. "Eye of the Tiger" by Survivor</li>
        <li>4. "Run the World (Girls)" by Beyoncé</li>
        <li>5. "Stronger" by Kanye West</li>
        <li>6. "Feel Good Inc." by Gorillaz</li>
        <li>7. "Shut Up and Dance" by WALK THE MOON</li>
        <li>8. "Lose Yourself" by Eminem</li>
        <li>9. "Blinding Lights" by The Weeknd</li>
        <li>10. "Happy" by Pharrell Williams</li>
      </ul>
      <div className="flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setShowSecondModal(false); // Close second modal
            history.push('/mood'); // Navigate back to the Mood page
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Mood;
