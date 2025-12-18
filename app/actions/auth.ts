"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { Result, success, failure, createError, ErrorCode, toAppError } from "@/lib/types"

// Zod schema for sign-up validation
const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .max(255, "Email must be less than 255 characters")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name must be less than 100 characters")
      .trim()
      .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .max(20, "Phone number must be less than 20 characters")
      .regex(/^\+?[\d\s()-]+$/, "Invalid phone number format")
      .trim(),
    role: z.enum(["seller", "blocker", "landlord"]),
  })
  .refine(
    (data) => {
      // Additional password strength check
      return data.password.length >= 8
    },
    {
      message: "Password must be at least 8 characters long",
      path: ["password"],
    }
  )

const signUpSchemaWithRedirect = signUpSchema.extend({
  redirectUrl: z.string().url().optional(),
})

export async function signUp(
  data: z.infer<typeof signUpSchema> & { redirectUrl?: string }
): Promise<Result<{ userId: string }>> {
  try {
    const supabase = await createClient()

    // Validate input with Zod (excluding redirectUrl from validation)
    const { redirectUrl, ...signUpData } = data
    const validationResult = signUpSchema.safeParse(signUpData)
    if (!validationResult.success) {
      return failure(
        createError(ErrorCode.VALIDATION_ERROR, "Invalid sign-up data", {
          errors: validationResult.error.errors,
        })
      )
    }

    const validatedData = validationResult.data

    // Use provided redirect URL or construct from environment
    const emailRedirectTo = redirectUrl || 
      `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/auth/callback`

    // Create user account
    // Note: Supabase will handle duplicate email checks during sign-up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: validatedData.fullName,
          phone_number: validatedData.phoneNumber,
          role: validatedData.role,
        },
      },
    })

    if (authError) {
      // Handle specific Supabase errors
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return failure(createError(ErrorCode.VALIDATION_ERROR, "Email is already registered"))
      }
      return failure(
        createError(ErrorCode.VALIDATION_ERROR, "Failed to create account", {
          error: authError.message,
        })
      )
    }

    if (!authData.user) {
      return failure(createError(ErrorCode.INTERNAL_ERROR, "User creation failed - no user returned"))
    }

    return success({ userId: authData.user.id })
  } catch (error) {
    return failure(toAppError(error))
  }
}
