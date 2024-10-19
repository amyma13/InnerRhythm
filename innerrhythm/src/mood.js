import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { db } from "./firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

function Mood() {
  const history = useHistory();
  const [mood, setMood] = useState("");

  const goToHomePage = async (selectedMood) => {

    // testing firebase
    const username = "Arianna";
    try {
        const findDoc = doc(db, "Users", username);
        const docUserInfo = await getDoc(findDoc);
        if (docUserInfo.exists()) {
            console.log("Username taken");
        }
        else {
            const ref = collection(db, "Users");
            await setDoc(doc(ref, username), {
                username: username,
                emotions: ["happy", "sad", "angry"],
                activities: [""],
            });
            console.log("Uploaded user")
        }
    }
    catch (error){
        console.log("Error uploading to database: "+error);
    }
     

    setMood(selectedMood);
    // history.push('/homepage', { mood: selectedMood });
  }

  return (
    <div className="bg-black min-h-screen text-white">

      <div className="flex justify-between items-center p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-green-500">Inner Rhythm</h1>
        <Link to="/" className="text-gray-400 hover:text-green-500">Logout</Link>
      </div>

      <div className="flex flex-col items-center justify-center mt-6">
        <h2 className="text-2xl font-semibold">How are you feeling?</h2>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <button
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded"
            onClick={() => goToHomePage('Happy')}
          >
            Happy
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Relaxed')}
          >
            Relaxed
          </button>
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Energetic')}
          >
            Energetic
          </button>
          <button
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded"
            onClick={() => goToHomePage('Sad')}
          >
            Sad
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Focused')}
          >
            Focused
          </button>
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Calm')}
          >
            Calm
          </button>
          <button
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded"
            onClick={() => goToHomePage('Excited')}
          >
            Excited
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Angry')}
          >
            Angry
          </button>
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded"
            onClick={() => goToHomePage('Overwhelmed')}
          >
            Overwhelmed
          </button>
        </div>
      </div>
    </div>
  );
}

export default Mood;
