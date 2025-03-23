import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

let adminAuth;

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)),
        });
        console.log('Firebase Admin SDK initialized successfully.');
        adminAuth = getAuth();
        console.log("admin.auth available: ", !!admin.auth);
    } catch (error) {
        console.error('Firebase Admin initialization error', error.stack);
    }
} else {
    adminAuth = getAuth();
}

export { admin, adminAuth };