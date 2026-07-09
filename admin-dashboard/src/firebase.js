import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDJHRZS9mxCGrTBMfyrVVKI_rgOZdBt5uA',
  authDomain: 'restomenu2.firebaseapp.com',
  projectId: 'restomenu2',
  storageBucket: 'restomenu2.firebasestorage.app',
  messagingSenderId: '758372743630',
  appId: '1:758372743630:web:6eb5255c98ef94a1e7539f',
  measurementId: 'G-RSVEJ2ZQNG',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
