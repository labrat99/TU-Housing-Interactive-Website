/* Firebase connection for Tulane Housing Hub (project: tu-housing-hub).
   These values are public by design — security is enforced by Firestore rules + Auth,
   not by keeping this secret. Uses the no-build "compat" SDK loaded in each page. */
var firebaseConfig = {
  apiKey: "AIzaSyDjcjl0XoxB1S2qn1LV4Fy--_WuUExFfrg",
  authDomain: "tu-housing-hub.firebaseapp.com",
  projectId: "tu-housing-hub",
  storageBucket: "tu-housing-hub.firebasestorage.app",
  messagingSenderId: "129489043004",
  appId: "1:129489043004:web:4c3ecae0c3c332920e4d39"
};

try {
  firebase.initializeApp(firebaseConfig);
  window.fbAuth = firebase.auth();
  window.fbDB = firebase.firestore();
  window.FIREBASE_READY = true;
  console.log('[hub] Firebase initialized for project', firebaseConfig.projectId);
} catch (e) {
  window.FIREBASE_READY = false;
  console.warn('[hub] Firebase init failed:', e && e.message);
}

// Read live data from Firestore? Now ON — the database is created and seeded
// (8 reviews + 4 sublets). The site reads real records; the seed file is only
// a fallback if Firestore is ever unreachable.
window.HUB_USE_FIRESTORE = true;
