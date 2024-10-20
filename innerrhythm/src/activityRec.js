import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';


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
    return highestEmotion;
  }
  
// go into the users acivities, pull a random acitivity 

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
      const moodDocInfo = await getDoc(moodDoc);
  
      if (moodDocInfo.exists()) {
        const moodData = moodDocInfo.data();
        const moodActivities = moodData.Activity || []; // Fetch activities for that mood
  
        // Log all possible activities for that mood
        console.log(`Mood activities for ${highestEmotion}:`, moodActivities);
        
        let possibleActivities;

        userData.activities.forEach ((userActivity) => {
            if (userActivity in moodActivities){
                possibleActivities.append(userActivity);
            }
        })

        let recActivity = getRandomActivity(possibleActivities);
        return recActivity;

      } else {
        console.log(`No activities found for mood: ${highestEmotion}`);
      }
    } catch (error) {
      console.log('Error fetching activity: ' + error);
    }
  }