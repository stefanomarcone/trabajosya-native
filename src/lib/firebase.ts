import { initializeApp } from 'firebase/app'
import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCb4T5CrBWe8Po2PkLkzJiB1IhZHlCx42U',
  authDomain: 'trabajosya-f29fa.firebaseapp.com',
  projectId: 'trabajosya-f29fa',
  storageBucket: 'trabajosya-f29fa.firebasestorage.app',
  messagingSenderId: '713532993389',
  appId: '1:713532993389:web:041a89b3367d9b73c63464',
}

const app = initializeApp(firebaseConfig)

// In React Native, use indexedDBLocalPersistence or just getAuth (AsyncStorage handled by expo)
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
})
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
