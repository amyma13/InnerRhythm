const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // For storing client credentials in environment variables

const app = express();
const port = 3001; // Backend running on port 3001

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies

// Load client credentials from environment variables for security
const CLIENT_ID = process.env.CLIENT_ID || 'dedb9569c9b441428ebc8905d8be2df8';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'a7587750dc7f4a15b81143bc1e26976d';
const REDIRECT_URI = 'http://localhost:3000'; // Ensure it matches with your Spotify redirect URI

//app.use(bodyParser.json());

app.post('/token', async (req, res) => {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    try {
        const token_response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:3000', // Must match the redirect URI used in the login
                client_id: 'dedb9569c9b441428ebc8905d8be2df8', // Your Spotify client ID
                client_secret: 'a7587750dc7f4a15b81143bc1e26976d', // Your Spotify client secret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const accessToken = token_response.data.access_token;

        // Make a request to Spotify's User Profile API to get user information
        const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const displayName = userProfileResponse.data.display_name;
        res.json({
            access_token: accessToken,
            display_name: displayName, // Return the display name of the user
        });
        
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).json({ error: 'Failed to exchange code for token' });
    }
});

// Example route to test if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express yay!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});