import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import { Subscriber } from "@/models/Portfolio";
import { sendSubscriptionConfirmation } from "@/lib/notifications";

const AUTH_COOKIE_NAME = "auth_token";
const SESSION_VALUE = "authenticated_jahnvi_session_token";

async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token && token.value === SESSION_VALUE;
}

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

// GET all subscribers (Admin only)
export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: subscribers
    });
  } catch (error) {
    console.error("GET Subscribers error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a subscriber (Admin only)
export async function DELETE(request) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    await Subscriber.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Subscriber deleted successfully."
    });
  } catch (error) {
    console.error("DELETE Subscriber error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
