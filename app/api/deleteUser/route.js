import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)),
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
        console.error('Firebase Admin initialization error', error.stack);
    }
}

export async function POST(req) {
    const res = NextResponse.json({ message: 'User deleted successfully' });
    res.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow specific methods
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

    try {
        const { userId } = await req.json();

        // Delete user from Authentication
        await admin.auth().deleteUser(userId);

        // Delete user from Firestore
        const userDocRef = admin.firestore().collection('users').doc(userId);
        await userDocRef.delete();

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}