// // // // // // import { db } from './firebaseConfig';
// // // // // // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// // // // // // export const saveSearchHistory = async (
// // // // // //   userId: string,
// // // // // //   query: string,
// // // // // //   response: string
// // // // // // ) => {
// // // // // //   try {
// // // // // //     await addDoc(collection(db, 'users', userId, 'history'), {
// // // // // //       query,
// // // // // //       response,
// // // // // //       timestamp: serverTimestamp(),
// // // // // //     });
// // // // // //     console.log('Search history saved.');
// // // // // //   } catch (error) {
// // // // // //     console.error('Error saving history:', error);
// // // // // //   }
// // // // // // };
// // // // // import { db } from "@/firebase/firebaseConfig";
// // // // // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // // // // import { getAuth } from "firebase/auth";

// // // // // export const saveSearchHistory = async (query: string, response: string) => {
// // // // //   const auth = getAuth();
// // // // //   const user = auth.currentUser;

// // // // //   if (!user) {
// // // // //     console.error("User not authenticated");
// // // // //     return;
// // // // //   }

// // // // //   try {
// // // // //     await addDoc(collection(db, "users", user.uid, "history"), {
// // // // //       query,
// // // // //       response,
// // // // //       timestamp: serverTimestamp(),
// // // // //     });
// // // // //     console.log("Search history saved.");
// // // // //   } catch (error) {
// // // // //     console.error("Error saving search history:", error);
// // // // //   }
// // // // // };
// // // // import { db } from "@/firebase/firebaseConfig";
// // // // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // // // import { getAuth } from "firebase/auth";

// // // // export const saveSearchHistory = async (query: string, response: string) => {
// // // //   const auth = getAuth();
// // // //   const user = auth.currentUser;

// // // //   console.log("Auth instance:", auth);
// // // //   console.log("Current user:", user);

// // // //   if (!user) {
// // // //     console.error("User not authenticated");
// // // //     return;
// // // //   }

// // // //   try {
// // // //     await addDoc(collection(db, "users", user.uid, "history"), {
// // // //       query,
// // // //       response,
// // // //       timestamp: serverTimestamp(),
// // // //     });
// // // //     console.log("Search history saved.");
// // // //   } catch (error) {
// // // //     console.error("Error saving search history:", error);
// // // //   }
// // // // };
// // // import { db } from "@/firebase/firebaseConfig";
// // // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // // import { getAuth } from "firebase/auth";

// // // export const saveSearchHistory = async (query: string, response: string) => {
// // //   const auth = getAuth();

// // //   // 👇 Add these debug logs here
// // //   console.log("Auth instance:", auth);
// // //   console.log("Current user:", auth.currentUser);

// // //   const user = auth.currentUser;

// // //   if (!user) {
// // //     console.error("User not authenticated");
// // //     return;
// // //   }

// // //   try {
// // //     await addDoc(collection(db, "users", user.uid, "history"), {
// // //       query,
// // //       response,
// // //       timestamp: serverTimestamp(),
// // //     });
// // //     console.log("Search history saved.");
// // //   } catch (error) {
// // //     console.error("Error saving search history:", error);
// // //   }
// // // };
// // // try {
// // //   const docRef = await addDoc(collection(db, "testCollection"), {
// // //     message: "Test write",
// // //     timestamp: serverTimestamp(),
// // //   });
// // //   console.log("Test doc written with ID: ", docRef.id);
// // // } catch (error) {
// // //   console.error("Error writing test doc:", error);
// // // }
// // import { db } from "@/firebase/firebaseConfig";
// // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // import { getAuth } from "firebase/auth";

// // export const saveSearchHistory = async (query: string, response: string) => {
// //   const auth = getAuth();
// //   const user = auth.currentUser;

// //   if (!user) {
// //     console.error("User not authenticated");
// //     return;
// //   }

// //   try {
// //     await addDoc(collection(db, "users", user.uid, "history"), {
// //       query,
// //       response,
// //       timestamp: serverTimestamp(),
// //     });
// //     console.log("Search history saved.");
// //   } catch (error) {
// //     console.error("Error saving search history:", error);
// //   }
// // };

// // // Optional: Test Firestore write (call this from somewhere in your app, not at top-level)
// // export const testFirestoreWrite = async () => {
// //   try {
// //     const docRef = await addDoc(collection(db, "testCollection"), {
// //       message: "Test write",
// //       timestamp: serverTimestamp(),
// //     });
// //     console.log("Test doc written with ID: ", docRef.id);
// //   } catch (error) {
// //     console.error("Error writing test doc:", error);
// //   }
// // };
// import { db } from './firebaseConfig';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// /**
//  * Save a user's chat message to Firestore
//  * @param userId - The unique ID of the authenticated user
//  * @param prompt - The message or query entered by the user
//  */
// export const saveUserHistory = async (userId: string, prompt: string) => {
//   try {
//     if (!userId || !prompt) {
//       console.warn("User ID or prompt missing. History not saved.");
//       return;
//     }

//     await addDoc(collection(db, 'userHistory'), {
//       userId,
//       prompt,
//       timestamp: serverTimestamp()
//     });

//     console.log("History saved successfully.");
//   } catch (error) {
//     console.error("Error saving history:", error);
//   }
// };
  
import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Save a user's chat message and bot response to Firestore
 * @param userId - The unique ID of the authenticated user
 * @param prompt - The message or query entered by the user
 * @param response - The bot's response
 */
export const saveUserHistory = async (userId: string, prompt: string, response: string) => {
  try {
    if (!userId || !prompt) {
      console.warn("User ID or prompt missing. History not saved.");
      return;
    }

    await addDoc(collection(db, 'users', userId, 'history'), {
      prompt,
      response,
      timestamp: serverTimestamp()
    });

    console.log("History saved successfully.");
  } catch (error) {
    console.error("Error saving history:", error);
  }
};