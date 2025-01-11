import { initializeApp } from "firebase/app";
    import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
    import { getDatabase, ref, set, onValue } from "firebase/database";

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

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authDiv = document.getElementById('auth');
    const dashboardDiv = document.getElementById('dashboard');
    const usernameSpan = document.getElementById('username');

    loginBtn.addEventListener('click', () => {
      const email = emailInput.value;
      const password = passwordInput.value;
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          loadUserData(userCredential.user.uid);
        })
        .catch((error) => {
          alert(error.message);
        });
    });

    signupBtn.addEventListener('click', () => {
      const email = emailInput.value;
      const password = passwordInput.value;
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          set(ref(database, 'users/' + user.uid), {
            email: user.email,
            notes: ["ملاحظة افتراضية 1", "ملاحظة افتراضية 2"] // إضافة ملاحظات افتراضية
          });
          loadUserData(user.uid);
        })
        .catch((error) => {
          alert(error.message);
        });
    });

    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => {
        authDiv.style.display = 'block';
        dashboardDiv.style.display = 'none';
      });
    });

    function loadUserData(uid) {
      const userRef = ref(database, 'users/' + uid);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          usernameSpan.textContent = userData.email;
          authDiv.style.display = 'none';
          dashboardDiv.style.display = 'block';

          // تحميل الملاحظات إذا كانت موجودة
          const notesList = document.getElementById('notesList') || document.createElement('ul');
          notesList.id = 'notesList';
          notesList.innerHTML = ''; // مسح المحتوى القديم

          if (userData.notes) {
            userData.notes.forEach((note, index) => {
              const noteItem = document.createElement('li');
              noteItem.textContent = note;
              notesList.appendChild(noteItem);
            });
          }

          dashboardDiv.appendChild(notesList);
        } else {
          alert('لا توجد بيانات للمستخدم!');
        }
      });
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData(user.uid);
      }
    });
