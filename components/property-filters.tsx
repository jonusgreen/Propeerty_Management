"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, X } from "lucide-react"

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get("city") || "")
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "Any")
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get("min_bedrooms") || "Any")
  const [maxRent, setMaxRent] = useState(searchParams.get("max_rent") || "")

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (propertyType !== "Any") params.set("property_type", propertyType)
    if (minBedrooms !== "Any") params.set("min_bedrooms", minBedrooms)
    if (maxRent) params.set("max_rent", maxRent)

    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setCity("")
    setPropertyType("Any")
    setMinBedrooms("Any")
    setMaxRent("")
    router.push("/browse")
  }

  const hasFilters = city || propertyType !== "Any" || minBedrooms !== "Any" || maxRent

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g. New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property_type">Property Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min_bedrooms">Min Bedrooms</Label>
            <Select value={minBedrooms} onValueChange={setMinBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max_rent">Max Rent</Label>
            <Input
              id="max_rent"
              type="number"
              placeholder="e.g. 2000"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {hasFilters && (
            <Button onClick={clearFilters} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
