// Settings.js
import React, { useState } from 'react';

function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState('light');

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <div className="p-10 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-5">Settings</h1>
      
      <div className="mb-5">
        <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationToggle}
            className="mr-2"
          />
          <span>Enable Notifications</span>
        </label>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-semibold mb-2">Theme</h2>
        <select value={theme} onChange={handleThemeChange} className="bg-gray-800 text-white p-2 rounded">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-semibold mb-2">Account</h2>
        <p className="text-lg">Manage your account details here.</p>
        {/* Add more account-related options here */}
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-semibold mb-2">Privacy</h2>
        <p className="text-lg">Adjust your privacy settings.</p>
        {/* Add more privacy-related options here */}
      </div>
    </div>
  );
}

export default Settings;