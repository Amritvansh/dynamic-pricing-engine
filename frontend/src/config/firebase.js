import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ── Firebase project configuration ──────────────────────────
// Note: authDomain fixed to match project ID (namic-price-engine)
const firebaseConfig = {
  apiKey: "AIzaSyCAXChICPPlhqyK8so4KWPLkTXnQPvOLXY",
  authDomain: "namic-price-engine.firebaseapp.com",
  projectId: "namic-price-engine",
  storageBucket: "namic-price-engine.firebasestorage.app",
  messagingSenderId: "422913085335",
  appId: "1:422913085335:web:1fa2a4fcb24720acd8fed2",
  measurementId: "G-1TJDYPM44C"
};

const app = initializeApp(firebaseConfig);

// ── Export auth instance for use across the app ─────────────
export const auth = getAuth(app);
export default app;
