import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const demoUserId = cookieStore.get("demo-user-id")?.value;
    
    if (demoUserId) {
      // Clear the demo user cookie
      cookieStore.delete("demo-user-id");
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Not a demo user" }, { status: 400 });
  } catch (error) {
    console.error("Demo logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
