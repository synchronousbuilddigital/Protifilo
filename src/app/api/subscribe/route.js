import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Subscriber } from "@/models/Portfolio";
import { sendSubscriptionConfirmation } from "@/lib/notifications";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Please enter your name." }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: "Please enter your email." }, { status: 400 });
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already exists
    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ success: false, error: "This email address is already subscribed!" }, { status: 400 });
    }

    // Create subscriber
    const newSubscriber = await Subscriber.create({
      name: cleanName,
      email: cleanEmail
    });

    // Send confirmation email
    try {
      await sendSubscriptionConfirmation({
        name: cleanName,
        email: cleanEmail,
      });
    } catch (emailErr) {
      console.error("Failed to send subscription confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "You have successfully subscribed to blog notifications!"
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json({ success: false, error: "Failed to process subscription. Please try again." }, { status: 500 });
  }
}
