// app/api/updateUserPassword/route.js
import { NextResponse } from 'next/server';
import { adminAuth } from '../../utils/firebaseAdmin'; 

export async function POST(request) {
  try {
    const { userId, newPassword } = await request.json();

    await adminAuth.updateUser(userId, { password: newPassword });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}