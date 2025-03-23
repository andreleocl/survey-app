import { NextResponse } from 'next/server';
import { admin } from '../../utils/firebaseAdmin';

export async function POST(req) {
  const res = NextResponse.json({ message: 'User deleted successfully' });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');

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