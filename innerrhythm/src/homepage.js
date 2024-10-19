import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

function HomePage() {
  const [expandedMood, setExpandedMood] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moods, setMoods] = useState([]);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [newMoodName, setNewMoodName] = useState('');
  const [newMoodPlaylist, setNewMoodPlaylist] = useState('');
  const dropdownRef = useRef(null);
  const [emotionValues, setEmotionValues] = useState({
    Happy: 0,
    Sad: 0,
    Calm: 0,
    Angry: 0,
    Anxious: 0,
    Excited: 0,
});
  const moodValues = {
    happy: {
        target_energy: 0.8,
        target_danceability: 0.8,
        target_valence: 0.9,
        min_tempo: 120,
        max_tempo: 140
    },
    sad: {
        target_energy: 0.2,
        target_danceability: 0.2,
        target_valence: 0.2,
        min_tempo: 60,
        max_tempo: 80
    },
    angry: {
        target_energy: 0.9,
        target_danceability: 0.6,
        target_valence: 0.3,
        min_tempo: 140,
        max_tempo: 160,
    },
    calm: {
        target_energy: 0.2,        
        target_danceability: 0.4,  
        target_valence: 0.5,       
        min_tempo: 60,            
        max_tempo: 80,             
    },
    anxious: {
        target_energy: 0.6,        
        target_danceability: 0.5, 
        target_valence: 0.4,      
        min_tempo: 100,           
        max_tempo: 120,          
    },
    excited: {
        target_energy: 0.7,        
        target_danceability: 0.7, 
        target_valence: 0.8,      
        min_tempo: 120,           
        max_tempo: 140,          
    },
};

const handleEmotionChange = (emotion, value) => {
  const parsedValue = Math.max(0, Math.min(100, parseInt(value) || 0)); // Ensure the value is between 0 and 100
  setEmotionValues(prev => ({ ...prev, [emotion]: parsedValue }));
};

const getTotalEmotions = () => {
  return Object.values(emotionValues).reduce((a, b) => a + b, 0);
};
  const toggleMood = (id) => {
    setExpandedMood(expandedMood === id ? null : id);
  };

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      const token = sessionStorage.getItem('spotify_access_token');
      if (token) {
        try {
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setProfilePhoto(data.images[0]?.url);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    const fetchMoods = async () => {
      const username = sessionStorage.getItem("username"); // get username later
      try {
        const findDoc = doc(db, "Users", username);
        const docUserInfo = await getDoc(findDoc);
        if (docUserInfo.exists()) {
          const userData = docUserInfo.data();
          const emotions = userData.emotions; 
          console.log("Emotions:", emotions);
          setMoods(emotions);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error fetching user: " + error);
      }
    }

    fetchProfilePhoto();
    fetchMoods();
    //getSongsMood();
  }, []);

  const getSongsMood = async () => {
    const token = sessionStorage.getItem("spotify_access_token");

    // Loop through each mood in moodValues
    for (const mood in moodValues) {
        const moodParams = moodValues[mood];  // Get the parameters for each mood
        console.log(`Fetching songs for mood: ${mood}`);

        try {
            const url = new URL('https://api.spotify.com/v1/recommendations');

            // Append query parameters
            const params = {
                limit: 3,  // Limit to 3 songs per mood
                market: 'US',
                seed_genres: 'pop,rock',  // Example seed genres
                target_energy: moodParams.target_energy,
                target_danceability: moodParams.target_danceability,
                target_valence: moodParams.target_valence,
                min_tempo: moodParams.min_tempo,
                max_tempo: moodParams.max_tempo
            };

            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const data = await response.json();

            // Check if data.tracks exists and is an array before accessing it
            if (data && data.tracks && Array.isArray(data.tracks)) {
                const songNames = data.tracks.map(track => track.name);  // Extract song names
                console.log(`Songs for ${mood}:`, songNames);
            } else {
                console.log(`No tracks found for mood: ${mood}`, data);
            }

        } catch (error) {
            console.error(`Error fetching songs for mood ${mood}:`, error);
        }
    }
};

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('spotify_access_token');
    window.location.href = '/';
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCreateMood = async () => {
    const moodId = moods.length + 1; // Create a new ID based on current moods length
    const newMood = {
      id: moodId,
      name: newMoodName,
      values: emotionValues, // Convert input string to array
    };

    try {
      // Add new mood to Firestore (assuming a structure)
      const username = sessionStorage.getItem("username"); // get username later
      await setDoc(doc(db, "Users", username), {
        emotions: [...moods, newMood]
      }, { merge: true });
      setMoods([...moods, newMood]); // Update state
      setShowModal(false); // Close modal after saving
      setNewMoodName('');
      setNewMoodPlaylist('');
    } catch (error) {
      console.error('Error adding mood:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      {/* Sidebar */}
      <div className="w-1/5 p-5 bg-gray-800 overflow-y-auto">
      
  <h2 className="text-2xl font-bold mb-8">MOODS</h2>

  <ul className="space-y-4">
     {/* Add New Mood button */}
  <li className="text-lg">
      <button
        onClick={() => setShowModal(true)}
        className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
      >
        Create a New Mood
      </button>
    </li>
    {moods.map((mood) => (
      <li key={mood.id} className="text-lg">
        <div
          onClick={() => toggleMood(mood.id)}
          className="cursor-pointer hover:bg-gray-700 p-2 rounded"
        >
          {mood.name}
        </div>
        {expandedMood === mood.id && (
          <ul className="mt-2 ml-4 space-y-2">
            {mood.playlist.map((song, index) => (
              <li key={index} className="text-sm">
                <div className="bg-gray-700 p-2 rounded">
                  {song}
                </div>
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</div>

      {/* Main Content */}
      <div className="w-4/5 p-10 relative">
        {/* Profile Button with Dropdown */}
        <div className="absolute top-5 right-5 flex items-center">
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-8 h-8 rounded-full mr-2 cursor-pointer"
              onClick={toggleDropdown}
            />
          )}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-full focus:outline-none"
            >
              Profile
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-10">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <div
                  className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-between mt-10">
          <div className="w-1/3 h-40 bg-green-500 flex items-center justify-center rounded-lg">
            <h3 className="text-2xl font-semibold">Song</h3>
          </div>
          <div className="w-2/3 ml-5">
            <h1 className="text-4xl font-bold">Discover</h1>
            <p className="mt-2 text-lg">description</p>
            <button className="mt-5 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
              Play
            </button>
          </div>
        </div>

        {/* Week Wrapped */}
        <div className="mt-10 w-full h-40 bg-green-500 flex items-center justify-center rounded-lg">
          <h2 className="text-2xl font-semibold">Week Wrapped</h2>
        </div>

        {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-5 rounded shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Create New Mood</h2>
      
      <div className="mb-4">
        <label className="text-white">Mood Name</label>
        <input
          type="text"
          placeholder="Enter mood name"
          value={newMoodName}
          onChange={(e) => setNewMoodName(e.target.value)}
          className="mb-2 p-2 rounded w-full bg-gray-700 text-white"
        />
      </div>

      {/* Emotion Scale Inputs */}
      <div className="mb-4">
        <label className="text-white">Distribute emotions (total must equal 100):</label>
        {["Happy", "Sad", "Calm", "Angry", "Anxious", "Excited"].map((emotion) => (
          <div key={emotion} className="flex items-center mb-2">
            <span className="text-white mr-2">{emotion}</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={emotionValues[emotion] || 0}
              onChange={(e) => handleEmotionChange(emotion, e.target.value)}
              className="p-2 rounded w-16 bg-gray-700 text-white"
            />
          </div>
        ))}
        <p className="text-white">Total: {getTotalEmotions()}</p>
        {getTotalEmotions() !== 100 && (
          <p className="text-red-500">Total must equal 100!</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mr-2"
          onClick={handleCreateMood}
          disabled={getTotalEmotions() !== 100} // Disable if total is not 100
        >
          Create
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem('spotify_access_token');
      if (!token) return;

      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!profileData) return <p>No profile data found.</p>;

  return (
    <div>
      <h1>{profileData.display_name}'s Profile</h1>
      <img src={profileData.images[0]?.url} alt="Profile" />
      <p>Email: {profileData.email}</p>
      {/* Other profile details */}
    </div>
  );
}


export default HomePage;
