"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createRentPaymentSession } from "@/app/actions/stripe"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function RentPaymentCheckout({ paymentId }: { paymentId: string }) {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    return await createRentPaymentSession(paymentId)
  }, [paymentId])

  if (isComplete) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">Payment Successful!</h3>
        <p className="mb-4 text-sm text-muted-foreground">Your rent payment has been processed.</p>
        <button
          onClick={() => router.push("/dashboard/payments")}
          className="text-sm text-primary underline underline-offset-4"
        >
          Return to Payments
        </button>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
