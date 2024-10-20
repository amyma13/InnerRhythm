import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

// Spotify OAuth details
const CLIENT_ID = 'dedb9569c9b441428ebc8905d8be2df8';
const REDIRECT_URI = 'http://localhost:3000';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';
const SCOPES = 'user-read-private user-read-email';

const Login = () => {
    const [token, setToken] = useState('');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    
    const defaultEmotions = [
        { name: "happy", happy: 100, sad: 0, angry: 0, calm: 0, anxious: 0, excited: 0 },
        { name: "sad", happy: 0, sad: 100, angry: 0, calm: 0, anxious: 0, excited: 0 },
        { name: "angry", happy: 0, sad: 0, angry: 100, calm: 0, anxious: 0, excited: 0 },
        { name: "calm", happy: 0, sad: 0, angry: 0, calm: 100, anxious: 0, excited: 0 },
        { name: "anxious", happy: 0, sad: 0, angry: 0, calm: 0, anxious: 100, excited: 0 },
        { name: "excited", happy: 100, sad: 0, angry: 0, calm: 0, anxious: 0, excited: 100 }
    ];

    const handleLogin = () => {
        window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
    };

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            setLoading(true);
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
                sessionStorage.setItem('spotify_access_token', data.access_token);
                sessionStorage.setItem('username', data.display_name);
                uploadProfileFirebase(data.display_name);
                fetchProfile(data.access_token);
            })
            .catch((error) => console.error('Error fetching token:', error))
            .finally(() => setLoading(false));
        }
    }, []);

    const uploadProfileFirebase = async (username) => {
        try {
            const ref = collection(db, "Users");
            const findDoc = doc(db, "Users", username);
            const docUserInfo = await getDoc(findDoc);
            if (!docUserInfo.exists()) {
                await setDoc(doc(ref, username), {
                    username: username,
                    emotions: defaultEmotions,
                    activities: [""],
                });
            }
        } catch (error) {
            console.log("Error uploading to database: " + error);
        }
    };

    const fetchProfile = async (accessToken) => {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setProfile(data);
            history.push('/homepage');
            window.location.reload();
        } else {
            console.error('Failed to fetch profile:', response.statusText);
        }
    };

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-green-500 animate-pulse">Inner Rhythm</h1>
                <p className="text-gray-400 mt-2">Discover your mood through music</p>
            </div>

            {!token ? (
                <button 
                    onClick={handleLogin}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 shadow-lg"
                >
                    Login with Spotify
                </button>
            ) : (
                <div className="mt-6">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <div className="loader"></div> 
                            <p className="mt-4">Loading profile...</p>
                        </div>
                    ) : profile ? (
                        <div className="flex flex-col items-center">
                            <h2 className="text-3xl font-semibold mb-4">Welcome, {profile.display_name}</h2>
                            <img src={profile.images[0]?.url} alt="Profile" className="rounded-full w-40 h-40 shadow-lg" />
                            <p className="mt-4 text-lg text-gray-400">Email: {profile.email}</p>
                            <button
                                onClick={() => {
                                    setToken('');
                                    sessionStorage.clear();
                                }}
                                className="mt-6 bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default Login;
