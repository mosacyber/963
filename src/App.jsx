import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, onValue, push, update } from 'firebase/database';
import AdminPage from './AdminPage';

const firebaseConfig = {
  apiKey: "AIzaSyCQt1ISTrLKL8SeKGamofZP0pYveVETK7w",
  authDomain: "mousa-2bf02.firebaseapp.com",
  databaseURL: "https://mousa-2bf02-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mousa-2bf02",
  storageBucket: "mousa-2bf02.firebasestorage.app",
  messagingSenderId: "5049783236",
  appId: "1:5049783236:web:bea04c4047eac95eb6ca91",
  measurementId: "G-BH9WMHX5S4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        
        // تحديث إحصائيات المستخدم
        const userRef = ref(database, 'users/' + user.uid);
        
        // الحصول على عدد الزيارات الحالي أولاً
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          const currentVisitCount = userData?.visitCount || 0;
          
          // تحديث عدد الزيارات
          update(userRef, {
            lastLogin: new Date().toLocaleString(),
            visitCount: currentVisitCount + 1
          }).then(() => {
            if (user.email === 'mosacyber@gmail.com') {
              setIsAdminPage(true);
            } else {
              loadUserData(user.uid);
            }
          });
        }, { onlyOnce: true });
      } else {
        setUser(null);
        setIsAdminPage(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = (uid) => {
    const userRef = ref(database, 'users/' + uid + '/notes');
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setNotes(Object.values(userData));
      } else {
        setNotes([]);
      }
    });
  };

  // باقي الكود يبقى كما هو...
}

export default App;
