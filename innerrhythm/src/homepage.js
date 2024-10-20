import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

import { chooseActivity } from './activityRec';


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
  const playlists = {
    happy: "Feel Good Happy",
    sad: "Sad Crying",
    angry: "Rage",
    excited: "Energetic Happy",
    calm: "Calm Relaxing",
    anxious: "Stressed"
};

// const checkActiveDevice = async (accessToken) => {
//   const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });
  
//   const data = await response.json();
//   console.log('Active Devices:', data);
//   return data.devices.length > 0; // Returns true if there are active devices
// };

const [playlistID, setPlaylistID] = useState("");
const [songs, setSongs] = useState({});

const fetchRandomSong = async () => {
  //const token = sessionStorage.getItem('spotify_access_token');
  const token ='BQBRQo7s0xd-4uGtBbQqNQ9kJUmx95vEbaZhgw7xPAg_r5T9xfCLSifFWoQIpIkp7ruGUPjcyf_26ly-OTGGv8kBs_h9RlCHOlbjAU4HQZMRaZT2xBde3QZrFa4gShqU8CTDDZLP49vcDkFVbr0r4PQa_YdP7LPQwmNaZMyBWL710ghjvyMtXr98Q3zLg4jHSxhjvFcu7X632rdfJtF7BcJl3IGOOdeBL1lLeH_hf71XO_qZee-EBsJowh5t2SDi9kKJLtOlTjBL';
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

const getActivities = async () => {
    const username = sessionStorage.getItem('username'); // Get the username or user ID
    const activitiesCollection = collection(db, 'Activities'); // Reference to the Activities collection
  
    try {
      const querySnapshot = await getDocs(activitiesCollection); // Fetch all documents in the collection
      const activities = []; // Array to store the fetched activities
  
      // Iterate through the documents and extract the data
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() }); // Push each activity with its ID and data
      });
  
      console.log('Fetched Activities:', activities); // Log the activities for debugging
      return activities; // Return the array of activities
    } catch (error) {
      console.error('Error fetching activities:', error); // Log any errors
      return []; // Return an empty array in case of an error
    }
  };
  
  // Fetch moods data and profile photo
  useEffect(() => {
    const token = sessionStorage.getItem('spotify_access_token');
    const fetchData = async () => {
    const username = sessionStorage.getItem('username');
    const result = await chooseActivity();
    console.log(result)

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
      // console.log

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

  
  // const playSong = async (trackId) => {
  //   if (!token) {
  //     console.error('No access token found.');
  //     return;
  //   }
  
  //   const hasActiveDevice = await checkActiveDevice(token);
  //   if (!hasActiveDevice) {
  //     console.error('No active devices found for playback.');
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         uris: [`spotify:track:${trackId}`],
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       const errorResponse = await response.json();
  //       console.error('Failed to start playback:', response.statusText, errorResponse);
  //     } else {
  //       console.log(`Successfully started playing song with ID: ${trackId}`);
  //     }
  //   } catch (error) {
  //     console.error('Error starting playback:', error.message);
  //   }

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


  const generateRandomEmotionSongs = async () => {
    // Get total percentage for calculating the distribution
    const totalEmotions = getTotalEmotions();
    console.log("GOT HEREE");
  
    // If total is 0, return early
    if (totalEmotions === 0) {
      console.log("No emotions selected.");
      return;
    }
  
    // Prepare the requests for each mood based on the percentage
    const moodRequests = Object.keys(emotionValues).map(async (emotion) => {
      const percentage = emotionValues[emotion];
      const moodName = emotion.toLowerCase(); // Use lowercase for the playlist name
  
      // Calculate the number of songs to fetch based on the percentage
      const numSongsToFetch = Math.floor((percentage / totalEmotions) * 10); // Adjust the multiplier (10) as needed
  
      // Fetch songs only if there's a percentage greater than 0
      if (numSongsToFetch > 0) {
        const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${moodName}&limit=${3}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (data.tracks && data.tracks.length > 0) {
          const tracks = data.tracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
          }));
  
          setSongs(prevSongs => ({
            ...prevSongs,
            [moodName]: tracks,
          }));
  
          console.log(`Fetched ${numSongsToFetch} ${emotion} songs.`);
        }
      }
    });
  
    // Wait for all requests to finish
    await Promise.all(moodRequests);
  };
  

  const searchPlaylist = (query) => {
     // Store your access token here
     if (!playlists.hasOwnProperty(query)){
        generateRandomEmotionSongs();
     }
    const playlist = playlists[query];
    
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
        setPlaylistID(playlist.id);
        fetchPlaylistTracks(playlist.id, query);
        console.log(`Playlist ID: ${playlist.id}`);
        console.log(`Playlist Name: ${playlist.name}`);
        console.log(`Playlist URL: ${playlist.external_urls.spotify}`);
      } else {
        console.log('No playlist found for the query.');
      }
    })
    .catch(error => console.error('Error with the search request:', error));
  };
  const fetchPlaylistTracks = async (playlistId, moodName) => {
    console.log("HERE ID");
    console.log(playlistID);
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const tracks = data.items.map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(', '),
      }));
      console.log(tracks);

      setSongs(prevSongs => ({
        ...prevSongs,
        [moodName]: tracks,
      })); // Update state with the new songs
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  };



  const token = 'BQBRQo7s0xd-4uGtBbQqNQ9kJUmx95vEbaZhgw7xPAg_r5T9xfCLSifFWoQIpIkp7ruGUPjcyf_26ly-OTGGv8kBs_h9RlCHOlbjAU4HQZMRaZT2xBde3QZrFa4gShqU8CTDDZLP49vcDkFVbr0r4PQa_YdP7LPQwmNaZMyBWL710ghjvyMtXr98Q3zLg4jHSxhjvFcu7X632rdfJtF7BcJl3IGOOdeBL1lLeH_hf71XO_qZee-EBsJowh5t2SDi9kKJLtOlTjBL';

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
  <li key={mood.name} className="text-lg">
    <div
      onClick={() => {
        toggleMood(mood.name); // Toggle the dropdown for this mood
        searchPlaylist(mood.name); // Fetch playlist for this mood
      }}
      className={`cursor-pointer hover:bg-[#282828] p-2 rounded ${expandedMood === mood.name ? 'bg-[#282828] text-[#1DB954]' : ''}`}
    >
      {mood.name}
    </div>
    {expandedMood === mood.name && (
      <div className="mt-2 pl-5">
        {songs[mood.name] ? (
          <ul className="divide-y divide-gray-300">
            {songs[mood.name].map((song, index) => (
              <li key={index} className="text-sm py-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-semibold">{song.title}</span> by {song.artist}
                  </div>
                  <button
                    className="text-[#1DB954] hover:text-green-400 focus:outline-none"
                    // onClick={() => playSong(song.id)} 
                  >
                    Play
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Loading songs...</p>
        )}
      </div>
    )}
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
        <div className="flex flex-col items-center mt-10 w-full">
  <div className="flex items-center space-x-3"> {/* Container to align the sign and button */}
    
    {/* "Check in here -->" Sign */}
    <div className="text-sm font-bold text-gray-400 hover:text-green-400 transition duration-300 ease-in-out">
      Check in here &rarr;
    </div>

    {/* Button */}
    <div
      className="relative block px-6 py-3 text-sm bg-green-500 text-white font-bold rounded-full hover:bg-green-400 hover:shadow-2xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 active:shadow-lg"
      onClick={toMood}
    >
      <span className="z-10 relative">Feeling some type of way?</span>

      {/* Ripple Effect */}
      <span className="absolute inset-0 rounded-full overflow-hidden">
        <span className="ripple-animation absolute w-full h-full bg-white opacity-20 transform scale-0 transition-transform duration-500 ease-out"></span>
      </span>
    </div>
  </div>
</div>

{/* Week Wrapped Section as Interactive Mood Chart */}
<div className="mt-10 w-full">
  <h2 className="text-2xl font-semibold mb-4 text-[#1DB954]">Week Wrapped</h2>
  <Bar
    data={{
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Days of the week
      datasets: [
        {
          label: 'Happy',
          data: [2, 3, 2.5, 4, 5, 1, 3], // Hours listened when feeling "Happy" during the week
          backgroundColor: '#1DB954', // Spotify Green for "Happy"
          borderColor: '#FFF',
          borderWidth: 2,
        },
        {
          label: 'Sad',
          data: [1, 2, 2, 3, 1.5, 2, 2.5], // Hours listened when feeling "Chill"
          backgroundColor: '#121212', // Spotify Black for "Chill"
          borderColor: '#FFF',
          borderWidth: 2,
        },
        {
          label: 'Calm',
          data: [0.5, 1, 1.5, 2, 1, 0.5, 1], // Hours listened when feeling "Sad"
          backgroundColor: '#535353', // Dark Gray for "Sad"
          borderColor: '#FFF',
          borderWidth: 2,
        },
        {
          label: 'Angry',
          data: [3, 2.5, 4, 3.5, 4.5, 3, 5], // Hours listened when feeling "Energetic"
          backgroundColor: '#B3B3B3', // Light Gray for "Energetic"
          borderColor: '#FFF',
          borderWidth: 2,
        },
        {
          label: 'Anxious',
          data: [4, 4.5, 3, 2, 3.5, 4, 4.5], // Hours listened when feeling "Focused"
          backgroundColor: '#282828', // Dark background shade for "Focused"
          borderColor: '#FFF',
          borderWidth: 2,
        },
        {
          label: 'Excited',
          data: [4, 4.5, 3, 2, 3.5, 4, 4.5], 
          backgroundColor: '#66D36E',
          borderColor: '#FFF',
          borderWidth: 2,
        },
      ],
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
          text: 'Hours Listened vs Mood Over the Week',
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
            color: '#FFF', // White text for the X-axis (days of the week)
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
            color: '#FFF', // White text for the Y-axis (hours listened)
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
      </div>
    </div>
  );
}

export default HomePage;