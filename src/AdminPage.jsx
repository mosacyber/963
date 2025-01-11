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
        const formattedUsers = Object.entries(usersData).map(([uid, user]) => ({
          uid,
          email: user.email,
          notesCount: user.notes ? user.notes.length : 0,
          lastLogin: user.lastLogin || 'غير معروف',
          visitCount: user.visitCount || 0
        }));
        setUsers(formattedUsers);
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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">لوحة التحكم - الإدمن</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">المستخدمون المسجلون</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">عدد الملاحظات</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">آخر تسجيل دخول</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">عدد الزيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-right">{user.email}</td>
                    <td className="px-6 py-4 text-center">{user.notesCount}</td>
                    <td className="px-6 py-4 text-right">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-center">{user.visitCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
