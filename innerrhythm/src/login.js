import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

const CLIENT_ID = 'dedb9569c9b441428ebc8905d8be2df8';
const REDIRECT_URI = 'http://localhost:3000'; // Update to your redirect URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';
const SCOPES = 'user-read-private user-read-email';

const Login = () => {
    const [token, setToken] = useState('');
    const [profile, setProfile] = useState(null);
    const history = useHistory(); // Use useHistory from react-router-dom
    const defaultEmotions = [
        {
            name: "happy",
            happy: 100,
            sad: 0,
            angry: 0,
            calm: 0,
            anxious: 0,
            excited: 0,
        },
        {
            name: "sad",
            happy: 0,
            sad: 100,
            angry: 0,
            calm: 0,
            anxious: 0,
            excited: 0,
        },
        {
            name: "angry",
            happy: 0,
            sad: 0,
            angry: 100,
            calm: 0,
            anxious: 0,
            excited: 0,
        },
        {
            name: "calm",
            happy: 0,
            sad: 0,
            angry: 0,
            calm: 100,
            anxious: 0,
            excited: 0,
        },
        {
            name: "anxious",
            happy: 0,
            sad: 0,
            angry: 0,
            calm: 0,
            anxious: 100,
            excited: 0,
        },
        {
            name: "excited",
            happy: 100,
            sad: 0,
            angry: 0,
            calm: 0,
            anxious: 0,
            excited: 100,
        }
    ];

    // Function to redirect to Spotify for OAuth
    const handleLogin = () => {
        window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
    };

    // Fetch access token on first load using the authorization code from URL
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            // Exchange the authorization code for an access token
            fetch('http://localhost:3001/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setToken(data.access_token);
                    
                    sessionStorage.setItem('spotify_access_token', data.access_token); // Store token in local storage
                    sessionStorage.setItem('username', data.display_name);
                    uploadProfileFirebase(data.display_name);
                    fetchProfile(data.access_token); // Get the user's profile
                })
                .catch((error) => console.error('Error fetching token:', error));
        }
    }, []);

    const uploadProfileFirebase = async (username) => {
        try {
            const ref = collection(db, "Users");
                await setDoc(doc(ref, "Amy"), {
                    username: "Amy",
                    emotions: defaultEmotions,
                    activities: [""],
                });
                await setDoc(doc(ref, "Yanns"), {
                    username: "Yanns",
                    emotions: defaultEmotions,
                    activities: [""],
                });
            const findDoc = doc(db, "Users", username);
            const docUserInfo = await getDoc(findDoc);
            if (docUserInfo.exists()) {
                console.log("Username exists");
            }
            else {
                const ref = collection(db, "Users");
                await setDoc(doc(ref, username), {
                    username: username,
                    emotions: defaultEmotions,
                    activities: [""],
                });
                console.log("Uploaded user")
            }
        }
        catch (error){
            console.log("Error uploading to database: "+error);
        }
    }

    // Function to fetch user's profile using the token
    const fetchProfile = async (accessToken) => {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setProfile(data);
            console.log("Profile fetched:", data);

            // Redirect to homepage after successfully fetching the profile
            history.push('/homepage'); // Use history.push to redirect
            window.location.reload();
        } else {
            console.error('Failed to fetch profile:', response.statusText);
        }
        
    };
    

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-green-500">Inner Rhythm</h1>
            </div>

            {!token ? (
                <button 
                    onClick={handleLogin}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                    Login with Spotify
                </button>
            ) : (
                <div className="mt-6">
                    {profile ? ( // Check if profile is not null
                        <>
                            <h2 className="text-2xl font-semibold">Welcome, {profile.display_name}</h2>
                            <img src={profile.images[0]?.url} alt="Profile" className="rounded-full w-32 h-32 mt-4" />
                            <p className="mt-2">Email: {profile.email}</p>
                        </>
                    ) : (
                        <p>Loading profile...</p> // Display loading message if profile is null
                    )}
                </div>
            )}
        </div>
    );
};

export default Login; // Ensure you export the component correctly
