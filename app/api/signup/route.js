import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import User from "../../../models/user.model";

const SECRET_KEY = "NOTESAPI";

export async function POST(req) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" },{status:500});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return NextResponse.json({ user, token },{status:201});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong" },{status:500});
  }
}
