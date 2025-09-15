import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorType = searchParams.error

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "no_code":
        return "No authentication code was provided in the link."
      case "client_unavailable":
        return "Authentication service is not properly configured."
      case "unexpected_error":
        return "An unexpected error occurred during authentication."
      default:
        return "The authentication link may have expired or been used already."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">Authentication Error</CardTitle>
          <CardDescription>{getErrorMessage(errorType)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          {errorType && <p className="text-xs text-muted-foreground">Error code: {errorType}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
