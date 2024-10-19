
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// // Authorization token that must have been created previously
// const token = '';

// async function fetchWebApi(endpoint, method, body) {
//   const res = await fetch(`https://api.spotify.com/${endpoint}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     method,
//     body: JSON.stringify(body),
//   });
//   return await res.json();
// }

// // Function to get the user's top tracks
// async function getTopTracks() {
//   return (await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=5', 'GET')).items;
// }

// // Function to get recommended tracks based on seed track IDs
// async function getRecommendedTracks(trackIds) {
//   return (await fetchWebApi(
//     `v1/recommendations?limit=5&seed_tracks=${trackIds.join(',')}`, 'GET'
//   )).tracks;
// }

// function TopTracks() {
//   const [topTracks, setTopTracks] = useState([]); // Default to empty array
//   const [recommendedTracks, setRecommendedTracks] = useState([]); // Default to empty array

//   // Fetch and display top tracks when the component mounts
//   useEffect(() => {
//     async function fetchTracks() {
//       try {
//         const tracks = await getTopTracks();
//         setTopTracks(tracks);
  
//         const trackIds = tracks.map(track => track.id);
//         const recommendations = await getRecommendedTracks(trackIds);
//         setRecommendedTracks(recommendations);
//       } catch (error) {
//         console.error('Failed to fetch top tracks or recommendations', error);
//       }
//     }
//     fetchTracks();
//   }, []); // This ensures useEffect runs only once


//   // Display Top Tracks
//   const displayTopTracks = () => {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {topTracks && topTracks.length > 0 ? (  // Check if topTracks exists and has items
//           topTracks.map((track) => (
//             <div key={track.id} className="bg-gray-800 rounded p-4">
//               <h3 className="text-xl font-semibold">{track.name}</h3>
//               <p className="text-gray-400">by {track.artists.map(artist => artist.name).join(', ')}</p>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-400">Loading top tracks...</p>
//         )}
//       </div>
//     );
//   };

//   // Display Recommended Tracks
//   const displayRecommendedTracks = () => {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {recommendedTracks && recommendedTracks.length > 0 ? (  // Check if recommendedTracks exists and has items
//           recommendedTracks.map((track) => (
//             <div key={track.id} className="bg-gray-800 rounded p-4">
//               <h3 className="text-xl font-semibold">{track.name}</h3>
//               <p className="text-gray-400">by {track.artists.map(artist => artist.name).join(', ')}</p>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-400">Loading recommended tracks...</p>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="bg-black min-h-screen text-white">
//       {/* Header */}
//       <div className="flex justify-between items-center p-4 bg-gray-900">
//         <h1 className="text-3xl font-semibold">Your Top Tracks & Recommendations</h1>
//         <Link to="/" className="text-gray-400 hover:text-green-500">Logout</Link>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto p-6">
//         {/* Top Tracks Section */}
//         <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
//         {displayTopTracks()}

//         {/* Recommended Tracks Section */}
//         <h2 className="text-2xl font-semibold mt-8 mb-4">Recommended Tracks</h2>
//         {displayRecommendedTracks()}
//       </div>
//     </div>
//   );
// }

// export default TopTracks;
