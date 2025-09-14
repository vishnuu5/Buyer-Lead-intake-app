"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Check if it's a demo user
      const response = await fetch("/api/demo-logout", { method: "POST" });
      if (response.ok) {
        router.push("/demo-login");
        router.refresh();
        return;
      }

      // Regular Supabase logout
      if (supabase) {
        await supabase.auth.signOut();
      }
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </>
      )}
    </Button>
  );
}
