import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA9h_32RAALDD6_dUnvpQAJGbPO_wiEe0",
    authDomain: "looks-d9510.firebaseapp.com",
    projectId: "looks-d9510",
    storageBucket: "looks-d9510.firebasestorage.app",
    messagingSenderId: "233234503223",
    appId: "1:233234503223:web:7f109a4e6edf79c39b91b2",
    measurementId: "G-5K0JMNRN6M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "guests";

const tabLoginBtn = document.getElementById('tab-login-btn');
const tabRegisterBtn = document.getElementById('tab-register-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const notification = document.getElementById('auth-notification');

const authView = document.getElementById('auth-view');
const qrView = document.getElementById('qr-view');
const userDisplayName = document.getElementById('user-display-name');
const badgeDoc = document.getElementById('badge-doc');
const badgeOrigin = document.getElementById('badge-origin');
const badgeStatus = document.getElementById('badge-status');
const qrcodeContainer = document.getElementById('qrcode');
const logoutBtn = document.getElementById('logout-btn');

let currentUserDocId = null; 
let qrInstance = null;

function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.display = 'flex';
    notification.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)';
    notification.style.border = `1px solid ${isError ? '#ef4444' : '#34d399'}`;
    notification.style.color = isError ? '#f87171' : '#34d399';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const docId = document.getElementById('reg-doc').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const origin = document.getElementById('reg-origin').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        let exists = false;
        querySnapshot.forEach((docSnap) => {
            if (docSnap.data().doc === docId) {
                exists = true;
            }
        });

        if (exists) {
            showNotification("Ya existe un registro con esta cédula.", true);
            return;
        }

        await addDoc(collection(db, COLLECTION_NAME), {
            name,
            doc: docId,
            phone,
            origin,
            password,
            status: "Ausente",
            createdAt: new Date().toISOString()
        });

        // Cambio directo e instantáneo a la pestaña de inicio de sesión
        registerForm.reset();
        tabLoginBtn.click();
        showNotification("¡Registrado con éxito! Ya puedes iniciar sesión.");
    } catch (error) {
        console.error("Error al registrar:", error);
        showNotification("Hubo un error al registrar en la base de datos.", true);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docId = document.getElementById('login-doc').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        let foundUser = null;
        let foundId = null;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.doc === docId) {
                foundUser = data;
                foundId = docSnap.id;
            }
        });

        if (!foundUser) {
            showNotification("No se encontró ningún registro con esta cédula.", true);
        } else {
            if (foundUser.password && foundUser.password !== password) {
                showNotification("Contraseña incorrecta.", true);
                return;
            }

            currentUserDocId = foundId;

            userDisplayName.textContent = foundUser.name;
            badgeDoc.textContent = foundUser.doc;
            badgeOrigin.textContent = foundUser.origin || 'N/A';
            badgeStatus.textContent = foundUser.status;
            badgeStatus.className = `status-badge badge-${foundUser.status}`;

            qrcodeContainer.innerHTML = "";

            const qrDataString = foundUser.doc;

            qrInstance = new QRCode(qrcodeContainer, {
                text: qrDataString,
                width: 180,
                height: 180,
                colorDark: "#3C005A",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            authView.style.display = 'none';
            qrView.style.display = 'block';
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        showNotification("Error al conectar con la base de datos.", true);
    }
});

logoutBtn.addEventListener('click', () => {
    currentUserDocId = null;
    loginForm.reset();
    qrView.style.display = 'none';
    authView.style.display = 'block';
});