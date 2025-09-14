"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, LogIn } from "lucide-react";

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create a demo session by setting a cookie
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@example.com" }),
      });

      if (response.ok) {
        router.push("/buyers");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Demo Login</CardTitle>
          <CardDescription>
            Login with the demo account to see the seed data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This will log you in as the demo user to view the sample buyer leads.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value="demo@example.com"
              disabled
              className="bg-muted"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? "Logging in..." : "Login as Demo User"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>This demo account has 5 sample buyer leads</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
