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

// Route to handle token exchange
app.post('/token', async (req, res) => {
    const code = req.body.code; // Get the authorization code from the request

    const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    try {
        // Make a POST request to Spotify's API for exchanging code for tokens
        const response = await axios.post('https://accounts.spotify.com/api/token', data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Send the access token and other info back to the client
        res.json({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_in: response.data.expires_in,
        });
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error exchanging code for token');
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