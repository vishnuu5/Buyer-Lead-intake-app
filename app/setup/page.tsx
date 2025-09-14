"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, ExternalLink, Settings } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Setup Required</CardTitle>
          <CardDescription>
            Your Buyer Lead Management App needs to be configured with Supabase
            to function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              The following environment variables are missing and need to be
              configured in your project settings.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">
                Required Environment Variables:
              </h3>
              <div className="space-y-2 font-mono text-sm bg-muted p-4 rounded-lg">
                <div>NEXT_PUBLIC_SUPABASE_URL</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div>SUPABASE_SERVICE_ROLE_KEY</div>
                <div>DATABASE_URL</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Setup Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Create a new Supabase project at{" "}
                  <a
                    href="https://supabase.com"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Go to Project Settings → API to find your URL and keys</li>
                <li>
                  Add the environment variables to your Vercel project settings
                </li>
                <li>Run the database migration script to set up your tables</li>
                <li>Refresh this page once configured</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Database Setup:</h3>
              <p className="text-sm text-muted-foreground mb-3">
                After configuring Supabase, run this SQL script in your Supabase
                SQL editor:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-xs">
                  You can find the complete SQL script in: <br />
                  <span className="font-semibold">
                    scripts/001_initial_schema.sql
                  </span>
                </code>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Supabase Dashboard
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Refresh After Setup
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>For Vercel deployment:</strong> Add these environment
              variables in your Vercel project settings under Settings →
              Environment Variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
