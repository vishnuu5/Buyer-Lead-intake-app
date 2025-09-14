import { createClient } from "../lib/supabase/server";
import { prisma } from "@/lib/database";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  // Check for demo user first
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get("demo-user-id")?.value;
  
  if (demoUserId) {
    const demoUser = await prisma.user.findUnique({
      where: { id: demoUserId },
    });
    if (demoUser) {
      return demoUser;
    }
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Ensure user exists in our database
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    // Create user in our database if they don't exist
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      },
    });
  }

  return dbUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
