// /pages/api/score.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"
import User from "../../../models/user.model";

export async function POST(req){
  try {
    await connectDB() // Ensure the database is connected
    const { userId, score } = await req.json();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.latestScore = score;

    if (score > user.highestScore) {
      user.highestScore = score;
    }

    await user.save();
    return NextResponse.json(
      { message: "Scores updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
};
