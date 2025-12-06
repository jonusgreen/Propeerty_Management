"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { Result, success, failure, createError, ErrorCode, toAppError } from "@/lib/types"

export async function createRentPaymentSession(paymentId: string): Promise<Result<string>> {
  try {
    const supabase = await createClient()

    // Get payment details
    const { data: payment, error: fetchError } = await supabase
      .from("rent_payments")
      .select(
        `
        *,
        tenants!rent_payments_tenant_id_fkey(
          *,
          properties!tenants_property_id_fkey(title, address)
        )
      `,
      )
      .eq("id", paymentId)
      .single()

    if (fetchError) {
      return failure(createError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch payment details",
        { error: fetchError.message }
      ))
    }

    if (!payment) {
      return failure(createError(
        ErrorCode.NOT_FOUND,
        "Payment not found",
        { paymentId }
      ))
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Rent Payment - ${payment.tenants.properties.title}`,
              description: `${payment.tenants.properties.address} - Due ${new Date(payment.due_date).toLocaleDateString()}`,
            },
            unit_amount: Math.round(payment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        payment_id: paymentId,
      },
    })

    return success(session.client_secret!)
  } catch (error) {
    return failure(toAppError(error))
  }
}

export async function markPaymentAsPaid(
  paymentId: string,
  stripePaymentId: string
): Promise<Result<{ success: true }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("rent_payments")
      .update({
        status: "paid",
        paid_date: new Date().toISOString(),
        stripe_payment_id: stripePaymentId,
      })
      .eq("id", paymentId)

    if (error) {
      return failure(createError(
        ErrorCode.DATABASE_ERROR,
        "Failed to mark payment as paid",
        { error: error.message, paymentId }
      ))
    }

    return success({ success: true })
  } catch (error) {
    return failure(toAppError(error))
  }
}

