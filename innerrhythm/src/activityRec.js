import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Helper function to get a random activity from an array
function getRandomActivity(activities) {
  const randomIndex = Math.floor(Math.random() * activities.length);
  return activities[randomIndex];
}

export function findHighestEmotion(emotions) {
  // Initialize variables to store the highest emotion and its value
  let highestEmotion = '';
  let highestValue = -1;

  // Iterate over the object keys
  for (const [emotion, value] of Object.entries(JSON.parse(emotions))) {
    // Check if the current value is higher than the stored highest value
    if (value > highestValue) {
      highestEmotion = emotion;
      highestValue = value;
    }
  }
  console.log(`The highest emotion is: ${highestEmotion}`);
  return highestEmotion; // Return the highest emotion for further use
}

// Main function to choose activity based on user's mood and activities
export async function chooseActivity() {
  try {
    const username = sessionStorage.getItem('username');

    // Fetch user document from Firestore
    const findDoc = doc(db, 'Users', username);
    const docUserInfo = await getDoc(findDoc);
    const userData = docUserInfo.data();
    const activities = userData.activities || [];

    // Determine the highest emotion
    let highestEmotion = findHighestEmotion(sessionStorage.getItem('currMood'));

    // Fetch activities for the highest emotion from the 'activity_moods' collection
    const moodDoc = doc(db, 'activity_moods', highestEmotion);
    const moodDocInfo = await getDoc("moodDoc");
    console.log(moodDocInfo.data());

    if (moodDocInfo.exists()) {
      const moodData = moodDocInfo.data();
      const possibleActivities = moodData.Activity || []; // Ensure it's an array or fallback to empty array
      // Check if possibleActivities is an array and has items
      if (Array.isArray(possibleActivities) && possibleActivities.length > 0) {
        const randomActivity = getRandomActivity(possibleActivities);
        console.log(`Random activity for ${highestEmotion} mood: ${randomActivity}`);
        return randomActivity; // Return the random activity as the result
      } else {
        console.log(`No activities found for mood: ${highestEmotion}`);
        return null;
      }
    } else {
      console.log(`No document found for mood: ${highestEmotion}`);
      return null;
    }
  } catch (error) {
    console.log('Error fetching activity: ' + error);
  }
}