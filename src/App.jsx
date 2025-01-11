import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendSignInLinkToEmail, isSignInWithEmailLink } from 'firebase/auth';
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
        const updates = {
          lastLogin: new Date().toLocaleString(),
          visitCount: (user.visitCount || 0) + 1
        };
        
        update(userRef, updates).then(() => {
          if (user.email === 'mosacyber@gmail.com') {
            setIsAdminPage(true);
          } else {
            loadUserData(user.uid);
          }
        });
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

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await set(ref(database, 'users/' + user.uid), {
        email: user.email,
        notes: [],
        visitCount: 0,
        lastLogin: new Date().toLocaleString()
      });
      setUser(user);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdminPage(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() === '') return;
    const userRef = ref(database, 'users/' + user.uid + '/notes');
    await push(userRef, newNote);
    setNewNote('');
  };

  if (isAdminPage) {
    return <AdminPage auth={auth} database={database} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!user ? (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            تسجيل الدخول
          </button>
          <button
            onClick={handleSignup}
            className="w-full bg-green-500 text-white p-2 mt-2 rounded hover:bg-green-600"
          >
            إنشاء حساب
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">مرحبًا، {user.email}</h1>
          <div className="mb-4">
            <input
              type="text"
              placeholder="أضف ملاحظة جديدة"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={handleAddNote}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              إضافة ملاحظة
            </button>
          </div>
          <ul>
            {notes.map((note, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded mb-2">
                {note}
              </li>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white p-2 mt-4 rounded hover:bg-red-600"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
