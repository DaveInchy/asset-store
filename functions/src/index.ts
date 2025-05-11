/**
- * Import function triggers from their respective submodules:
- *
- * import {onCall} from "firebase-functions/v2/https";
- * import {onDocumentWritten} from "firebase-functions/v2/firestore";
- *
- * See a full list of supported triggers at https://firebase.google.com/docs/functions
- */
    -
 import * as functions from "firebase-functions";
+import * as admin from "firebase-admin";
+
    +// Initialize Firebase Admin SDK.
    +// This is necessary for functions to interact with other Firebase services like Firestore.
    +// Ensure you've run `npm install firebase-admin` or `yarn add firebase-admin` in your `functions` directory.
    +admin.initializeApp();
+
    +const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

-// export const helloWorld = functions.https.onRequest((request, response) => {
    -//   functions.logger.info("Hello logs!", {structuredData: true});
    -//   response.send("Hello from Firebase!");
    -// });
    +/**
+ * Triggered when a new Firebase Authentication user is created.
+ * This function creates a corresponding user document in Firestore.
+ */
    +export const createUserProfile = functions.auth.user().onCreate(async (user) => {
        +  functions.logger.info(`New user registered: ${user.uid}, Email: ${user.email}`);
        +
            +  // Data to save for the new user in Firestore
            +  const userProfile = {
+ email: user.email, // Store email (optional, as it's in Auth)
        +    displayName: user.displayName || null, // If available from provider
            +    photoURL: user.photoURL || null, // If available from provider
                +    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Timestamp of profile creation
                    +    // Add any game-specific default fields here
                    +    // e.g., score: 0, level: 1, preferences: {}
                    +  };
+
    +  try {
        +    await db.collection("users").doc(user.uid).set(userProfile);
        +    functions.logger.info(`User profile created in Firestore for UID: ${user.uid}`);
        +  } catch (error) {
            +    functions.logger.error(`Error creating user profile for UID: ${user.uid}`, error);
            +    // Optionally, you could try to delete the Auth user if profile creation fails critically,
                +    // but this requires careful error handling.
                +  }
+});
--- a / my - nextjs - game / functions / src / index.ts
+++ b / my - nextjs - game / functions / src / index.ts
@@ -1, 14 + 1, 36 @@
-/**
- * Import function triggers from their respective submodules:
- *
- * import {onCall} from "firebase-functions/v2/https";
- * import {onDocumentWritten} from "firebase-functions/v2/firestore";
- *
- * See a full list of supported triggers at https://firebase.google.com/docs/functions
- */
    -
 import * as functions from "firebase-functions";
+import * as admin from "firebase-admin";
+
    +// Initialize Firebase Admin SDK.
    +// This is necessary for functions to interact with other Firebase services like Firestore.
    +// Ensure you've run `npm install firebase-admin` or `yarn add firebase-admin` in your `functions` directory.
    +admin.initializeApp();
+
    +const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

-// export const helloWorld = functions.https.onRequest((request, response) => {
    -//   functions.logger.info("Hello logs!", {structuredData: true});
    -//   response.send("Hello from Firebase!");
    -// });
    +/**
+ * Triggered when a new Firebase Authentication user is created.
+ * This function creates a corresponding user document in Firestore.
+ */
    +export const createUserProfile = functions.auth.user().onCreate(async (user) => {
        +  functions.logger.info(`New user registered: ${user.uid}, Email: ${user.email}`);
        +
            +  // Data to save for the new user in Firestore
            +  const userProfile = {
+ email: user.email, // Store email (optional, as it's in Auth)
        +    displayName: user.displayName || null, // If available from provider
            +    photoURL: user.photoURL || null, // If available from provider
                +    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Timestamp of profile creation
                    +    // Add any game-specific default fields here
                    +    // e.g., score: 0, level: 1, preferences: {}
                    +  };
+
    +  try {
        +    await db.collection("users").doc(user.uid).set(userProfile);
        +    functions.logger.info(`User profile created in Firestore for UID: ${user.uid}`);
        +  } catch (error) {
            +    functions.logger.error(`Error creating user profile for UID: ${user.uid}`, error);
            +    // Optionally, you could try to delete the Auth user if profile creation fails critically,
                +    // but this requires careful error handling.
                +  }
+});
