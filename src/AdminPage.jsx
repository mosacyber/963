import React, { useState, useEffect } from 'react';
    import { getAuth, signInWithEmailLink, onAuthStateChanged, signOut } from 'firebase/auth';
    import { getDatabase, ref, onValue } from 'firebase/database';

    export default function AdminPage({ auth, database }) {
      const [users, setUsers] = useState([]);
      const [isAdmin, setIsAdmin] = useState(false);

      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && user.email === 'mosacyber@gmail.com') {
            setIsAdmin(true);
            loadUsers();
          } else {
            setIsAdmin(false);
          }
        });
        return () => unsubscribe();
      }, [auth]);

      const loadUsers = () => {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const usersData = snapshot.val();
          if (usersData) {
            setUsers(Object.values(usersData));
          } else {
            setUsers([]);
          }
        });
      };

      const handleLogout = async () => {
        try {
          await signOut(auth);
        } catch (error) {
          alert(error.message);
        }
      };

      if (!isAdmin) {
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-center mb-6">غير مصرح بالدخول</h1>
            <p className="text-center">يجب أن تكون مسجلًا كإدمن للوصول إلى هذه الصفحة.</p>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-center mb-6">لوحة التحكم - الإدمن</h1>
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">المستخدمون المسجلون: {users.length}</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded mb-2">
                  {user.email}
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
        </div>
      );
    }
