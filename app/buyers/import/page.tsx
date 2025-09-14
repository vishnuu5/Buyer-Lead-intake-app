"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClientHeader } from "@/components/layout/client-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Upload, Download, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ImportError {
  row: number
  field?: string
  message: string
  data?: any
}

interface ImportResult {
  success: boolean
  message: string
  errors?: ImportError[]
  validCount?: number
  totalCount?: number
  importedCount?: number
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Redirect to buyers page after successful import
        setTimeout(() => {
          router.push("/buyers")
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to upload file. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, status, notes, tags
User1, user1@example.com, 9876543210, CHANDIGARH, APARTMENT, TWO,BUY, 5000000, 7000000, ZERO_TO_THREE_MONTHS, WEBSITE, NEW, Looking for 2BHK in Sector 22, urgent;family
User2,user2@example.com, 9876543211, MOHALI, VILLA, THREE, BUY, 8000000, 12000000, THREE_TO_SIX_MONTHS, REFERRAL, QUALIFIED, Prefers independent house, premium;spacious`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "buyer-leads-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/buyers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Import Leads</h1>
              <p className="text-muted-foreground mt-2">Upload a CSV file to import multiple buyer leads at once</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>Select a CSV file containing buyer lead data (max 200 rows)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">CSV File</Label>
                  <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
                </div>

                {file && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Size: {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}

                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Leads
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Import Instructions</CardTitle>
                <CardDescription>Follow these guidelines for successful import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Use the provided template or ensure your CSV has the correct column headers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Maximum 200 rows per import</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Required fields: fullName, phone, city, propertyType, purpose, timeline, source</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>BHK is required for Apartment and Villa property types</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Use comma-separated values for tags (e.g., "urgent,family")</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Budget amounts should be in INR (e.g., 5000000 for 50 lakhs)</p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Valid Enum Values:</h4>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>City:</strong> CHANDIGARH, MOHALI, ZIRAKPUR, PANCHKULA, OTHER
                    </p>
                    <p>
                      <strong>Property:</strong> APARTMENT, VILLA, PLOT, OFFICE, RETAIL
                    </p>
                    <p>
                      <strong>BHK:</strong> STUDIO, ONE, TWO, THREE, FOUR
                    </p>
                    <p>
                      <strong>Purpose:</strong> BUY, RENT
                    </p>
                    <p>
                      <strong>Timeline:</strong> ZERO_TO_THREE_MONTHS, THREE_TO_SIX_MONTHS, MORE_THAN_SIX_MONTHS,
                      EXPLORING
                    </p>
                    <p>
                      <strong>Source:</strong> WEBSITE, REFERRAL, WALK_IN, CALL, OTHER
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {result.totalCount && (
                  <div className="flex gap-4 mb-4">
                    <Badge variant="outline">Total Rows: {result.totalCount}</Badge>
                    {result.validCount !== undefined && <Badge variant="outline">Valid: {result.validCount}</Badge>}
                    {result.importedCount !== undefined && (
                      <Badge variant="default">Imported: {result.importedCount}</Badge>
                    )}
                    {result.errors && <Badge variant="destructive">Errors: {result.errors.length}</Badge>}
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Validation Errors:</h4>
                    <div className="rounded-md border max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Error</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>{error.field || "General"}</TableCell>
                              <TableCell className="text-destructive">{error.message}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {error.data ? JSON.stringify(error.data).slice(0, 100) + "..." : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {result.success && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Import completed successfully! Redirecting to leads page...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
