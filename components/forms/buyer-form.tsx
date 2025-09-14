"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { buyerSchema, type BuyerFormData } from "@/lib/validations/buyer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Plus } from "lucide-react"

interface BuyerFormProps {
  initialData?: Partial<BuyerFormData>
  isEditing?: boolean
  buyerId?: string
}

export function BuyerForm({ initialData, isEditing = false, buyerId }: BuyerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      city: "CHANDIGARH",
      propertyType: "APARTMENT",
      purpose: "BUY",
      timeline: "ZERO_TO_THREE_MONTHS",
      source: "WEBSITE",
      status: "NEW",
      ...initialData,
    },
  })

  const propertyType = watch("propertyType")

  const onSubmit = async (data: BuyerFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const payload = { ...data, tags }

      const url = isEditing ? `/api/buyers/${buyerId}` : "/api/buyers"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save buyer")
      }

      router.push("/buyers")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Lead" : "Create New Lead"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the lead information below" : "Fill in the details to create a new buyer lead"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Personal Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter full name"
                  aria-invalid={errors.fullName ? "true" : "false"}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-destructive" role="alert">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number (10-15 digits)"
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-destructive" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Select onValueChange={(value) => setValue("city", value as any)} defaultValue={initialData?.city}>
                  <SelectTrigger aria-invalid={errors.city ? "true" : "false"}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHANDIGARH">Chandigarh</SelectItem>
                    <SelectItem value="MOHALI">Mohali</SelectItem>
                    <SelectItem value="ZIRAKPUR">Zirakpur</SelectItem>
                    <SelectItem value="PANCHKULA">Panchkula</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Property Requirements */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Property Requirements</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">
                  Property Type{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("propertyType", value as any)}
                  defaultValue={initialData?.propertyType}
                >
                  <SelectTrigger aria-invalid={errors.propertyType ? "true" : "false"}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                    <SelectItem value="PLOT">Plot</SelectItem>
                    <SelectItem value="OFFICE">Office</SelectItem>
                    <SelectItem value="RETAIL">Retail</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.propertyType.message}
                  </p>
                )}
              </div>

              {(propertyType === "APARTMENT" || propertyType === "VILLA") && (
                <div className="space-y-2">
                  <Label htmlFor="bhk">
                    BHK{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Select onValueChange={(value) => setValue("bhk", value as any)} defaultValue={initialData?.bhk}>
                    <SelectTrigger aria-invalid={errors.bhk ? "true" : "false"}>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDIO">Studio</SelectItem>
                      <SelectItem value="ONE">1 BHK</SelectItem>
                      <SelectItem value="TWO">2 BHK</SelectItem>
                      <SelectItem value="THREE">3 BHK</SelectItem>
                      <SelectItem value="FOUR">4 BHK</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bhk && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.bhk.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purpose">
                  Purpose{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("purpose", value as any)}
                  defaultValue={initialData?.purpose}
                >
                  <SelectTrigger aria-invalid={errors.purpose ? "true" : "false"}>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="RENT">Rent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.purpose.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">
                  Timeline{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("timeline", value as any)}
                  defaultValue={initialData?.timeline}
                >
                  <SelectTrigger aria-invalid={errors.timeline ? "true" : "false"}>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZERO_TO_THREE_MONTHS">0-3 months</SelectItem>
                    <SelectItem value="THREE_TO_SIX_MONTHS">3-6 months</SelectItem>
                    <SelectItem value="MORE_THAN_SIX_MONTHS">6+ months</SelectItem>
                    <SelectItem value="EXPLORING">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timeline && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.timeline.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum Budget (INR)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register("budgetMin", { valueAsNumber: true })}
                  placeholder="Enter minimum budget"
                  aria-invalid={errors.budgetMin ? "true" : "false"}
                  aria-describedby={errors.budgetMin ? "budgetMin-error" : undefined}
                />
                {errors.budgetMin && (
                  <p id="budgetMin-error" className="text-sm text-destructive" role="alert">
                    {errors.budgetMin.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Budget (INR)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register("budgetMax", { valueAsNumber: true })}
                  placeholder="Enter maximum budget"
                  aria-invalid={errors.budgetMax ? "true" : "false"}
                  aria-describedby={errors.budgetMax ? "budgetMax-error" : undefined}
                />
                {errors.budgetMax && (
                  <p id="budgetMax-error" className="text-sm text-destructive" role="alert">
                    {errors.budgetMax.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Lead Information */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Lead Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">
                  Source{" "}
                  <span className="text-destructive" aria-label="required">
                    *
                  </span>
                </Label>
                <Select onValueChange={(value) => setValue("source", value as any)} defaultValue={initialData?.source}>
                  <SelectTrigger aria-invalid={errors.source ? "true" : "false"}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    <SelectItem value="CALL">Phone Call</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.source && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.source.message}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value as any)}
                    defaultValue={initialData?.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="VISITED">Visited</SelectItem>
                      <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                      <SelectItem value="CONVERTED">Converted</SelectItem>
                      <SelectItem value="DROPPED">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Add any additional notes about this lead"
                rows={3}
                aria-invalid={errors.notes ? "true" : "false"}
                aria-describedby={errors.notes ? "notes-error" : undefined}
              />
              {errors.notes && (
                <p id="notes-error" className="text-sm text-destructive" role="alert">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagInput">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag} aria-label="Add tag">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Current tags">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1" role="listitem">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </fieldset>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Lead"
              ) : (
                "Create Lead"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
