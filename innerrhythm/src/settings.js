import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { db } from './firebase';  // Import your Firebase configuration (db should be initialized in this file)
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'; 

const activities = [
  'Running',
  'Walking',
  'Drawing',
  'Painting',
  'Boxing',
  'Yoga',
  'Swimming',
  'Cycling',
  'Hiking',
  'Dancing', 
  'Meditating', 
  'Cleaning', 
  'Lifting', 
  'Journaling'
];

const ActivitySelector = () => {
  const [selectedActivities, setSelectedActivities] = useState([]);
  const history = useHistory(); // Initialize useHistory

  const handleActivityToggle = (activity) => {
    if (selectedActivities.includes(activity)) {
      // Remove activity from selected list if already selected
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      // Add activity to the selected list
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  // Function to add activity to Firestore for the current user
  const addActivity = async (activity) => {
    const username = sessionStorage.getItem("username"); // Get the username from session storage
    if (!username) {
      console.error('No username found in session.');
      return;
    }

    try {
      const userRef = doc(db, "Users", username);
      // Add the activity to the user's activities array in Firestore
      await updateDoc(userRef, {
        activities: arrayUnion(activity)
      });
      console.log(`${activity} added to user ${username}`);
    } catch (error) {
      console.error(`Error adding activity ${activity}:`, error);
    }
  };

  const handleSubmit = async() => {
    if (selectedActivities.length > 0) {
      alert(`You selected: ${selectedActivities.join(', ')}`);
      try {
        const username = sessionStorage.getItem('username');
        if (!username) {
          throw new Error("No username found in session.");
        }

        // Firestore setDoc should be awaited since it's an async function
        await setDoc(doc(db, 'Users', username), {
          activities: [...selectedActivities],  // Spread selectedActivities to merge properly
        }, { merge: true });
        console.log('Activities added successfully.');
        
      } 
      catch (error) {
        console.error('Error adding activity:', error);
      }
    } else {
      alert('No activities selected.');
    };
  };

  const handleBackClick = () => {
    history.push('/homepage'); // Use history.push to navigate to homepage
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-[#1DB954]">Select Your Favorite Activities</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {activities.map((activity, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${selectedActivities.includes(activity) ? 'bg-[#1DB954] text-black' : 'bg-gray-800 text-white hover:bg-[#1DB954] hover:text-black'}`}
            onClick={() => handleActivityToggle(activity)}
          >
            {activity}
          </button>
        ))}
      </div>

      <button 
        className="bg-[#1DB954] hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition duration-200"
        onClick={handleSubmit}
      >
        Update
      </button>

      {selectedActivities.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-white">Selected Activities:</h2>
          <ul className="list-disc list-inside text-lg mt-2 text-gray-400">
            {selectedActivities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Back Button */}
      <button 
        onClick={handleBackClick} 
        className="mt-5 bg-[#1DB954] hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        Back to Home
      </button>
    </div>
  );
}

export default ActivitySelector;
