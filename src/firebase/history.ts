// // // // import { db } from './firebaseConfig';
// // // // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// // // // export const saveSearchHistory = async (
// // // //   userId: string,
// // // //   query: string,
// // // //   response: string
// // // // ) => {
// // // //   try {
// // // //     await addDoc(collection(db, 'users', userId, 'history'), {
// // // //       query,
// // // //       response,
// // // //       timestamp: serverTimestamp(),
// // // //     });
// // // //     console.log('Search history saved.');
// // // //   } catch (error) {
// // // //     console.error('Error saving history:', error);
// // // //   }
// // // // };
// // // import { db } from "@/firebase/firebaseConfig";
// // // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // // import { getAuth } from "firebase/auth";

// // // export const saveSearchHistory = async (query: string, response: string) => {
// // //   const auth = getAuth();
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
// // import { db } from "@/firebase/firebaseConfig";
// // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// // import { getAuth } from "firebase/auth";

// // export const saveSearchHistory = async (query: string, response: string) => {
// //   const auth = getAuth();
// //   const user = auth.currentUser;

// //   console.log("Auth instance:", auth);
// //   console.log("Current user:", user);

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
// import { db } from "@/firebase/firebaseConfig";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// export const saveSearchHistory = async (query: string, response: string) => {
//   const auth = getAuth();

//   // 👇 Add these debug logs here
//   console.log("Auth instance:", auth);
//   console.log("Current user:", auth.currentUser);

//   const user = auth.currentUser;

//   if (!user) {
//     console.error("User not authenticated");
//     return;
//   }

//   try {
//     await addDoc(collection(db, "users", user.uid, "history"), {
//       query,
//       response,
//       timestamp: serverTimestamp(),
//     });
//     console.log("Search history saved.");
//   } catch (error) {
//     console.error("Error saving search history:", error);
//   }
// };
// try {
//   const docRef = await addDoc(collection(db, "testCollection"), {
//     message: "Test write",
//     timestamp: serverTimestamp(),
//   });
//   console.log("Test doc written with ID: ", docRef.id);
// } catch (error) {
//   console.error("Error writing test doc:", error);
// }
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const saveSearchHistory = async (query: string, response: string) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("User not authenticated");
    return;
  }

  try {
    await addDoc(collection(db, "users", user.uid, "history"), {
      query,
      response,
      timestamp: serverTimestamp(),
    });
    console.log("Search history saved.");
  } catch (error) {
    console.error("Error saving search history:", error);
  }
};

// Optional: Test Firestore write (call this from somewhere in your app, not at top-level)
export const testFirestoreWrite = async () => {
  try {
    const docRef = await addDoc(collection(db, "testCollection"), {
      message: "Test write",
      timestamp: serverTimestamp(),
    });
    console.log("Test doc written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error writing test doc:", error);
  }
};