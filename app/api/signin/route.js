import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import User from '../../../models/user.model';

const SECRET_KEY = 'NOTESAPI';

export async function POST(req) {

  
  try {
      await connectDB();
      const { email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' },{status:400});
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' },{status:400});
    }

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY, { expiresIn: '1h' });
    return NextResponse.json({ user: existingUser, token },{status:200});

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Something went wrong' },{status:500});
  }
}
