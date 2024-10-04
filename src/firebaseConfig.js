// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsQQrHHtVoHJozy6nfTjbWyAUpWNJhSXg",
  authDomain: "inaesbot.firebaseapp.com",
  projectId: "inaesbot",
  storageBucket: "inaesbot.appspot.com",
  messagingSenderId: "240510967708",
  appId: "1:240510967708:web:4a1e1e29bed838fa3b7259"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };