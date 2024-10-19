import React, { useState, useEffect } from 'react';

const CLIENT_ID = 'dedb9569c9b441428ebc8905d8be2df8';
const REDIRECT_URI = 'http://localhost:3000'; // Update to your redirect URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'code';
const SCOPES = 'user-read-private user-read-email';

const SpotifyLogin = () => {
    const [token, setToken] = useState('');
    const [profile, setProfile] = useState(null);

    // Function to redirect to Spotify for OAuth
    const handleLogin = () => {
        window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
    };

    // Fetch access token on first load using the authorization code from URL
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            // Exchange the authorization code for an access token
            fetch('http://localhost:3000/token', { // assuming token exchange happens in your back-end
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setToken(data.access_token);
                    fetchProfile(data.access_token); // Get the user's profile
                })
                .catch((error) => console.error('Error fetching token:', error));
        }
    }, []);

    // Function to fetch user's profile using the token
    const fetchProfile = async (accessToken) => {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        setProfile(data);
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
                    <h2 className="text-2xl font-semibold">Welcome, {profile.display_name}</h2>
                    <img src={profile.images[0]?.url} alt="Profile" className="rounded-full w-32 h-32 mt-4" />
                    <p className="mt-2">Email: {profile.email}</p>
                </div>
            )}
        </div>
    );
};

export default SpotifyLogin;
