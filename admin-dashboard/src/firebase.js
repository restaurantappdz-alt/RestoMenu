import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDlM1Zm5zwsaZ5vhXHZ3gTP-SqFQWkV18Y',
  authDomain: 'menu-85c70.firebaseapp.com',
  projectId: 'menu-85c70',
  storageBucket: 'menu-85c70.firebasestorage.app',
  messagingSenderId: '601922860088',
  appId: '1:601922860088:web:f75c4d8bfd4cf50cd4a2cd',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
