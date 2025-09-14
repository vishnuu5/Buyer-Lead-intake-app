import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileX } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-semibold">Lead Not Found</CardTitle>
          <CardDescription>
            The lead you're looking for doesn't exist or you don't have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button asChild className="w-full">
            <Link href="/buyers">Back to Leads</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/buyers/new">Create New Lead</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
