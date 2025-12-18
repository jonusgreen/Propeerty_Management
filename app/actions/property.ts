"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { Result, success, failure, createError, ErrorCode, toAppError } from "@/lib/types"
import type { PropertyType } from "@/lib/types"

// Zod schema for property validation
const propertySchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .trim(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(5000, "Description must be less than 5000 characters")
      .trim(),
    property_type: z.enum(["house", "apartment", "condo", "townhouse", "studio", "land"]),
    listing_type: z.enum(["sale", "rent"]),
    address: z
      .string()
      .min(1, "Address is required")
      .max(200, "Address must be less than 200 characters")
      .trim(),
    city: z
      .string()
      .min(1, "City is required")
      .max(100, "City must be less than 100 characters")
      .trim(),
    state: z
      .string()
      .min(1, "State/Region is required")
      .max(100, "State/Region must be less than 100 characters")
      .trim(),
    zip_code: z
      .string()
      .min(1, "Postal code is required")
      .max(20, "Postal code must be less than 20 characters")
      .trim(),
    bedrooms: z.number().int().min(0).max(50).nullable(),
    bathrooms: z.number().min(0).max(50).nullable(),
    square_feet: z.number().int().min(0).max(10000000).nullable(),
    rent_amount: z.number().min(0).max(1000000000).nullable(),
    sale_price: z.number().min(0).max(1000000000).nullable(),
    deposit_amount: z.number().min(0).max(1000000000).nullable(),
    currency: z.enum(["UGX", "USD"]),
    parking: z.boolean(),
    furnished: z.boolean(),
    amenities: z.array(z.string().max(100)).nullable(),
    available_from: z
      .string()
      .nullable()
      .refine(
        (val) => {
          if (val === null || val === "") return true
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
          if (!dateRegex.test(val)) return false
          const date = new Date(val)
          return !isNaN(date.getTime())
        },
        { message: "Invalid date format" }
      ),
  })
  .refine(
    (data) => {
      // If property type is land, bedrooms and bathrooms should be null
      if (data.property_type === "land") {
        return data.bedrooms === null && data.bathrooms === null
      }
      // Otherwise, bedrooms and bathrooms are required
      return data.bedrooms !== null && data.bathrooms !== null
    },
    {
      message: "Bedrooms and bathrooms are required for non-land properties",
      path: ["bedrooms"],
    }
  )
  .refine(
    (data) => {
      // If listing type is sale, rent_amount should be null and sale_price required
      if (data.listing_type === "sale") {
        return data.rent_amount === null && data.sale_price !== null
      }
      // If listing type is rent, sale_price should be null and rent_amount required
      return data.sale_price === null && data.rent_amount !== null
    },
    {
      message: "Sale price is required for sale listings, rent amount is required for rent listings",
      path: ["sale_price"],
    }
  )

export async function createProperty(
  data: z.infer<typeof propertySchema>
): Promise<Result<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return failure(createError(ErrorCode.UNAUTHORIZED, "User not authenticated"))
    }

    // Validate input with Zod
    const validationResult = propertySchema.safeParse(data)
    if (!validationResult.success) {
      return failure(
        createError(ErrorCode.VALIDATION_ERROR, "Invalid property data", {
          errors: validationResult.error.errors,
        })
      )
    }

    const validatedData = validationResult.data

    // Check user role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "landlord", "blocker"].includes(profile.role)) {
      return failure(
        createError(ErrorCode.FORBIDDEN, "Only landlords, blockers, and admins can create properties")
      )
    }

    // Prepare property data
    const propertyData = {
      landlord_id: user.id,
      title: validatedData.title,
      description: validatedData.description,
      property_type: validatedData.property_type,
      listing_type: validatedData.listing_type,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zip_code: validatedData.zip_code,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      square_feet: validatedData.square_feet,
      rent_amount: validatedData.rent_amount,
      sale_price: validatedData.sale_price,
      deposit_amount: validatedData.deposit_amount,
      currency: validatedData.currency,
      parking: validatedData.parking,
      furnished: validatedData.furnished,
      amenities: validatedData.amenities,
      available_from: validatedData.available_from || null,
      status: "pending" as const,
    }

    // Insert property
    const { data: insertedProperty, error } = await supabase
      .from("properties")
      .insert([propertyData])
      .select("id")
      .single()

    if (error) {
      return failure(
        createError(ErrorCode.DATABASE_ERROR, "Failed to create property", { error: error.message })
      )
    }

    if (!insertedProperty) {
      return failure(createError(ErrorCode.DATABASE_ERROR, "Property creation returned no data"))
    }

    return success({ id: insertedProperty.id })
  } catch (error) {
    return failure(toAppError(error))
  }
}

export async function updateProperty(
  propertyId: string,
  data: z.infer<typeof propertySchema>
): Promise<Result<{ id: string }>> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return failure(createError(ErrorCode.UNAUTHORIZED, "User not authenticated"))
    }

    // Validate input with Zod
    const validationResult = propertySchema.safeParse(data)
    if (!validationResult.success) {
      return failure(
        createError(ErrorCode.VALIDATION_ERROR, "Invalid property data", {
          errors: validationResult.error.errors,
        })
      )
    }

    const validatedData = validationResult.data

    // Check if property exists and user owns it
    const { data: existingProperty, error: fetchError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", propertyId)
      .single()

    if (fetchError || !existingProperty) {
      return failure(createError(ErrorCode.NOT_FOUND, "Property not found"))
    }

    // Check user role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // Only allow update if user is the owner or an admin
    if (existingProperty.landlord_id !== user.id && profile?.role !== "admin") {
      return failure(createError(ErrorCode.FORBIDDEN, "You don't have permission to update this property"))
    }

    // Prepare property data
    const propertyData = {
      title: validatedData.title,
      description: validatedData.description,
      property_type: validatedData.property_type,
      listing_type: validatedData.listing_type,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zip_code: validatedData.zip_code,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      square_feet: validatedData.square_feet,
      rent_amount: validatedData.rent_amount,
      sale_price: validatedData.sale_price,
      deposit_amount: validatedData.deposit_amount,
      currency: validatedData.currency,
      parking: validatedData.parking,
      furnished: validatedData.furnished,
      amenities: validatedData.amenities,
      available_from: validatedData.available_from || null,
    }

    // Update property
    const { error } = await supabase.from("properties").update(propertyData).eq("id", propertyId)

    if (error) {
      return failure(
        createError(ErrorCode.DATABASE_ERROR, "Failed to update property", { error: error.message })
      )
    }

    return success({ id: propertyId })
  } catch (error) {
    return failure(toAppError(error))
  }
}
