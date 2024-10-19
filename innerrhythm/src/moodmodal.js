import React, { useState } from 'react';

const MoodModal = ({ isOpen, onClose, onAddMood }) => {
    const [mood, setMood] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddMood(mood); // Call the function to add the mood
        setMood(''); // Reset the mood input
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add a New Mood</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        placeholder="Enter your mood"
                        className="border border-gray-400 p-2 rounded w-full mb-4"
                        required
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Mood
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MoodModal;
