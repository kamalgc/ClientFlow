'use client'
import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function UpdateCardForm({ onComplete }: { onComplete: () => void }) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const res = await fetch("/api/users/payment-method/update", { method: "POST" })
    const { client_secret } = await res.json()

    const result = await stripe?.confirmCardSetup(client_secret, {
      payment_method: {
        card: elements?.getElement(CardElement)!,
      },
    })

    if (result?.error) {
      alert(result.error.message)
    } else {
      alert("Card updated successfully!")
      onComplete()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="border p-2 rounded" />
      <Button type="submit" className="mt-2">Save Card</Button>
    </form>
  )
}

export default function PaymentMethodSettings() {
  const [cardInfo, setCardInfo] = useState<any>(null)
  const [editing, setEditing] = useState(false)

  const loadCard = async () => {
    const res = await fetch("/api/users/payment-method")
    const data = await res.json()
    setCardInfo(data)
  }

  useEffect(() => { loadCard() }, [])

  return (
    <div>
      {!editing ? (
        <div>
          {cardInfo ? (
            <p>
  {cardInfo?.brand
    ? `${cardInfo.brand.toUpperCase()} ending in ${cardInfo.last4}, exp ${cardInfo.exp_month}/${cardInfo.exp_year}`
    : "No card on file"}
</p>
          ) : (
            <p>No card on file</p>
          )}
          <Button onClick={() => setEditing(true)}>Update Card</Button>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <UpdateCardForm onComplete={() => { setEditing(false); loadCard() }} />
        </Elements>
      )}
    </div>
  )
}