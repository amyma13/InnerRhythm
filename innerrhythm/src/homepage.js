import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function HomePage() {
  const [expandedMood, setExpandedMood] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moods, setMoods] = useState([]);
  const [randomSong, setRandomSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newMoodName, setNewMoodName] = useState('');
  const [emotionValues, setEmotionValues] = useState({
    Happy: 0,
    Sad: 0,
    Calm: 0,
    Angry: 0,
    Anxious: 0,
    Excited: 0,
  });
  const dropdownRef = useRef(null);
  const history = useHistory();

  // Fetch moods data and profile photo
  useEffect(() => {
    const token = sessionStorage.getItem('spotify_access_token');
    const fetchData = async () => {
      const username = sessionStorage.getItem('username');

      if (token) {
        try {
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const profileData = await response.json();
          setProfilePhoto(profileData.images[0]?.url);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }

      console.log(sessionStorage.getItem('currMood'));

      try {
        const findDoc = doc(db, 'Users', username);
        const docUserInfo = await getDoc(findDoc);
        if (docUserInfo.exists()) {
          const userData = docUserInfo.data();
          const emotions = userData.emotions || []; // Default to empty array if no emotions
          setMoods(emotions);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.log('Error fetching user: ' + error);
      }
    };
   
    fetchData();
    fetchRandomSong();
  }, []);

  


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
    
  const handleLogout = () => {
    sessionStorage.removeItem('spotify_access_token');
    history.push('/');
    window.location.reload();
  };

  const toMood = () => {
    history.push('/mood');
    window.location.reload();
  };

  const toSettings = () => {
    history.push('/settings');
    window.location.reload();
  };

  const handleCreateMood = async () => {
    const newMood = { // Unique ID for new mood
        name: newMoodName,
        happy: emotionValues.Happy,
        sad: emotionValues.Sad,
        angry: emotionValues.Angry,
        calm: emotionValues.Calm,
        anxious: emotionValues.Anxious,
        excited: emotionValues.Excited
    };

    try {
      const username = sessionStorage.getItem('username');
      await setDoc(doc(db, 'Users', username), {
        emotions: [...moods, newMood],
      }, { merge: true });

      setMoods([...moods, newMood]);
      setShowModal(false);
      setNewMoodName('');
    } catch (error) {
      console.error('Error adding mood:', error);
    }
  };

  // Prepare data for the chart
  const chartData = {
    labels: moods.map(mood => mood.name), 
    datasets: [
      {
        label: 'Happy',
        data: moods.map(mood => mood.values?.Happy || 0), 
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Sad',
        data: moods.map(mood => mood.values?.Sad || 0), 
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
 
    ],
  };

  const fetchRandomSong = async () => {
    //const token = sessionStorage.getItem('spotify_access_token');
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/recommendations?limit=1&seed_genres=pop`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Check if data contains tracks
      if (data.tracks && data.tracks.length > 0) {
        const randomSong = data.tracks[0]; // Get the first random song
        console.log("here")
        console.log(randomSong.name);
        setRandomSong({
          title: randomSong.name,
          artist: randomSong.artists.map(artist => artist.name).join(', '),
          image: randomSong.album.images[0]?.url, // Get the album cover
        });
      } else {
        console.log('No tracks found.');
      }
    } catch (error) {
      console.error('Error fetching random song:', error);
    }
  };

  const searchPlaylist = (query) => {
    const token = sessionStorage.getItem('spotify_access_token'); // Store your access token here
    
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      // Assuming the first result is the one you want (feel free to implement better filtering)
      const playlists = data.playlists.items;
      if (playlists.length > 0) {
        const playlist = playlists[0]; // First result (Feel Good Happy)
        console.log(`Playlist ID: ${playlist.id}`);
        console.log(`Playlist Name: ${playlist.name}`);
        console.log(`Playlist URL: ${playlist.external_urls.spotify}`);
      } else {
        console.log('No playlist found for the query.');
      }
    })
    .catch(error => console.error('Error with the search request:', error));
  };
// searchPlaylist('Feel Good Happy');


  const token = 'BQCrr4J0SLBYb3_d19OSJ1G9gCKJW5AH6pFDRcYMJAbzgkcxbaFHilUPqKYJ3evQ4CzpJbD-HzWwucyZ_C4sN9kVjaJfdeE5Fxcsrs6TxMBQpW-V1NnFSfzlDE3730WtvR8jCB9yoxh64b5wyIggY_pT93kXPMl6e0mnuWWWvm_gObIaDbGETlcGPmRUyfyVgtRMqnQQFxG6pbBbMSPbhgjQvWkOPiZYOy6Z6HXHcImmBbkpplDlXL1P1inEXzwMcFUZaSQCoVT-EYpk4iuxexEnNHM1u-36ulZH';

  return (
    <div className="flex h-screen bg-black text-white relative font-sans">
      <div className="w-1/5 p-5 bg-[#181818] overflow-y-auto border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-8 text-[#1DB954]">MOODS</h2>
        <ul className="space-y-4">
          <li className="text-lg">
            <button
              onClick={() => setShowModal(true)}
              className="w-full text-left bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
              Create a New Mood
            </button>
          </li>
          {moods.map((mood) => (
            <li key={mood.id} className="text-lg">
              <div
                onClick={() => setExpandedMood(expandedMood === mood.name ? null : mood.name)}
                className="cursor-pointer hover:bg-[#282828] p-2 rounded"
              >
                {mood.name}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-4/5 p-10 relative">
        <div className="absolute top-5 right-5 flex items-center">
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-8 h-8 rounded-full mr-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
          )}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#282828] hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-full focus:outline-none"
            >
              Profile
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded shadow-lg z-10">
              <div
              className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
              onClick={toSettings}
            >
              Settings
            </div>
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
          <div className="w-1/3 h-40 bg-[#1DB954] flex items-center justify-center rounded-lg">
          {randomSong && randomSong.image ? (
            <img src={randomSong.image} alt={randomSong.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <h3 className="text-2xl font-semibold">No Song Selected</h3>
          )}
          </div>
          <div className="w-2/3 ml-5">
            <h1 className="text-4xl font-bold">Discover</h1>
            {randomSong ? (
      <p className="mt-2 text-lg">Recommended song: {randomSong.title} by {randomSong.artist}</p>
    ) : (
      <p className="mt-2 text-lg">No song available.</p>
    )}
            <button className="mt-5 bg-[#1DB954] hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            onClick = {fetchRandomSong}>
              Shuffle 
            </button>
          </div>
        </div>
{/* Button above Week Wrapped Section */}
<div className="flex flex-col items-center mt-10 w-full">
<div
  className="block px-6 py-3 text-sm bg-green-500 text-white font-bold rounded-full hover:bg-green-400 hover:shadow-lg cursor-pointer transition duration-200 ease-in-out"
  onClick={toMood}
>
  Feeling some type of way?
</div>
  </div>
{/* Week Wrapped Section as Interactive Mood Chart */}
<div className="mt-10 w-full">
  <h2 className="text-2xl font-semibold mb-4 text-[#1DB954]">Week Wrapped</h2>
  <Bar
    data={{
      ...chartData,
      datasets: chartData.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: [
          '#1DB954', // Spotify Green
          '#121212', // Spotify Black
          '#535353', // Dark Gray for variation
          '#B3B3B3', // Light Gray
          '#282828', // Spotify dark background shade
        ][index % 5], // Cycling through Spotify color palette
        borderColor: '#FFF', // White border for contrast
        borderWidth: 2, // Thicker border for bar definition
      })),
    }}
   
    options={{
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1DB954', // Spotify green for the labels
            font: {
              size: 14,
              family: "'Helvetica', 'Arial', sans-serif", // Clean, sans-serif font
              weight: 'bold',
            },
          },
        },
        title: {
          display: true,
          text: 'Your Mood Levels Over the Week',
          color: '#FFF', // White title
          font: {
            size: 18,
            family: "'Helvetica', 'Arial', sans-serif", // Matching the font style
            weight: 'bold',
          },
          padding: {
            top: 20,
            bottom: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)', // Subtle gridlines in white
          },
          ticks: {
            color: '#FFF', // White text for the X-axis
            font: {
              size: 12,
              family: "'Helvetica', 'Arial', sans-serif",
            },
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)', // Subtle gridlines in white
          },
          ticks: {
            color: '#FFF', // White text for the Y-axis
            font: {
              size: 12,
              family: "'Helvetica', 'Arial', sans-serif",
            },
          },
        },
      },
      layout: {
        padding: {
          top: 30, // Adding more padding for a balanced look
        },
      },
      elements: {
        bar: {
          borderRadius: 4, // Rounded edges to match Spotify's style
          borderSkipped: false, // Rounded effect on top of bars
        },
      },
    }}
  />
</div>


        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#282828] p-5 rounded shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Create New Mood</h2>
              <div className="mb-4">
                <label className="text-white">Mood Name</label>
                <input
                  type="text"
                  placeholder="Enter mood name"
                  value={newMoodName}
                  onChange={(e) => setNewMoodName(e.target.value)}
                  className="w-full mt-2 p-2 bg-gray-700 text-white rounded"
                />
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
          </div>
        )}
        {/* <button onClick = {searchPlaylist('Feel Good Happy')}> Plz work </button> */}
      </div>
    </div>
  );
}

export default HomePage;
