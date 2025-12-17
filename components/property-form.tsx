"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProperty, updateProperty } from "@/app/actions/property"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { PropertyType } from "@/lib/types"

interface PropertyFormProps {
  userId: string
  property?: {
    id: string
    title: string
    description: string
    property_type: PropertyType
    listing_type: "sale" | "rent"
    address: string
    city: string
    state: string
    zip_code: string
    bedrooms: number | null
    bathrooms: number | null
    square_feet: number | null
    rent_amount: number | null
    sale_price: number | null
    deposit_amount: number | null
    parking: boolean
    furnished: boolean
    amenities: string[] | null
    available_from: string | null
    currency: string
  }
}

export function PropertyForm({ userId, property }: PropertyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    property_type: property?.property_type || ("house" as PropertyType),
    listing_type: property?.listing_type || "rent",
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip_code: property?.zip_code || "",
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    square_feet: property?.square_feet || "",
    rent_amount: property?.rent_amount || "",
    sale_price: property?.sale_price || "",
    deposit_amount: property?.deposit_amount || "",
    currency: property?.currency || "UGX",
    parking: property?.parking || false,
    furnished: property?.furnished || false,
    amenities: property?.amenities?.join(", ") || "",
    available_from: property?.available_from || "",
  })

  const isLand = formData.property_type === "land"
  const isForSale = formData.listing_type === "sale"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Helper function to safely convert to number or null
    const toNumberOrNull = (value: string | number | null | undefined): number | null => {
      if (value === null || value === undefined || value === "") return null
      const num = typeof value === "string" ? Number(value) : value
      return isNaN(num) ? null : num
    }

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        bedrooms: isLand ? null : toNumberOrNull(formData.bedrooms),
        bathrooms: isLand ? null : toNumberOrNull(formData.bathrooms),
        square_feet: toNumberOrNull(formData.square_feet),
        rent_amount: isForSale ? null : toNumberOrNull(formData.rent_amount),
        sale_price: isForSale ? toNumberOrNull(formData.sale_price) : null,
        deposit_amount: toNumberOrNull(formData.deposit_amount),
        currency: formData.currency,
        parking: formData.parking,
        furnished: formData.furnished,
        amenities: formData.amenities
          ? formData.amenities
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : null,
        available_from: formData.available_from && formData.available_from.trim() !== "" 
          ? formData.available_from 
          : null,
      }

      let result
      if (property) {
        result = await updateProperty(property.id, propertyData)
      } else {
        result = await createProperty(propertyData)
      }

      if (!result.success) {
        // Format validation errors for display
        if (result.error.code === "VALIDATION_ERROR" && result.error.details?.errors) {
          const errors = result.error.details.errors as Array<{ path: string[]; message: string }>
          const errorMessages = errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
          setError(errorMessages)
        } else {
          setError(result.error.message)
        }
        setIsLoading(false)
        return
      }

      router.push("/dashboard/properties")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="Beautiful 2BR House or Prime Land for Sale"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property..."
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="property_type">Property Category</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value: PropertyType) => setFormData({ ...formData, property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="listing_type">Listing Type</Label>
                <Select
                  value={formData.listing_type}
                  onValueChange={(value: "sale" | "rent") => setFormData({ ...formData, listing_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Kampala"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State/Region</Label>
                <Input
                  id="state"
                  placeholder="Central"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip_code">Postal Code</Label>
                <Input
                  id="zip_code"
                  placeholder="00256"
                  required
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
              </div>
            </div>

            {!isLand && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    required
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                  />
                </div>
              </div>
            )}

            {isLand && (
              <div className="grid gap-2">
                <Label htmlFor="square_feet">Land Size (Square Feet)</Label>
                <Input
                  id="square_feet"
                  type="number"
                  min="0"
                  placeholder="Enter land size"
                  value={formData.square_feet}
                  onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                />
              </div>
            )}

            {isForSale ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">UGX (Ugandan Shillings)</SelectItem>
                      <SelectItem value="USD">USD (US Dollars)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="rent_amount">Monthly Rent</Label>
                  <Input
                    id="rent_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deposit_amount">Security Deposit</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">UGX (Ugandan Shillings)</SelectItem>
                      <SelectItem value="USD">USD (US Dollars)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!isLand && (
              <div className="grid gap-4">
                <Label>Amenities</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="parking"
                      checked={formData.parking}
                      onCheckedChange={(checked) => setFormData({ ...formData, parking: checked as boolean })}
                    />
                    <Label htmlFor="parking" className="font-normal cursor-pointer">
                      Parking Available
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="furnished"
                      checked={formData.furnished}
                      onCheckedChange={(checked) => setFormData({ ...formData, furnished: checked as boolean })}
                    />
                    <Label htmlFor="furnished" className="font-normal cursor-pointer">
                      Furnished
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amenities">Additional Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="Pool, Gym, Security, Garden"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="available_from">Available From</Label>
              <Input
                id="available_from"
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
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
