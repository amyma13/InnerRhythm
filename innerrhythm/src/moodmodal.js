import React, { useState } from 'react';

const MoodModal = ({ isOpen, onClose, onAddMood }) => {
    const [moodValues, setMoodValues] = useState({
        happy: 0,
        sad: 0,
        calm: 0,
        excited: 0,
        angry: 0,
        anxious: 0,
    });

    const handleChange = (emotion, value) => {
        setMoodValues((prevValues) => ({
            ...prevValues,
            [emotion]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const total = Object.values(moodValues).reduce((acc, val) => acc + parseInt(val), 0);

        if (total !== 100) {
            alert("The total of all emotions must equal 100.");
            return;
        }

        onAddMood(moodValues); // Call the function to add the mood
        setMoodValues({
            happy: 0,
            sad: 0,
            calm: 0,
            excited: 0,
            angry: 0,
            anxious: 0,
        }); // Reset the mood input
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add Your Mood</h2>
                <form onSubmit={handleSubmit}>
                    {Object.keys(moodValues).map((emotion) => (
                        <div key={emotion} className="mb-4">
                            <label className="block text-gray-700">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={moodValues[emotion]}
                                onChange={(e) => handleChange(emotion, e.target.value)}
                                className="w-full"
                            />
                            <span className="text-gray-600">{moodValues[emotion]}%</span>
                        </div>
                    ))}
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
