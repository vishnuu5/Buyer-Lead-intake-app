import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (email !== "demo@example.com") {
      return NextResponse.json({ error: "Invalid demo email" }, { status: 400 });
    }

    // Find the demo user
    const user = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });

    if (!user) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    // Create a simple session cookie (for demo purposes)
    const cookieStore = await cookies();
    cookieStore.set("demo-user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
