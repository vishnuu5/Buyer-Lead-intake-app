import { Header } from "@/components/layout/header"
import { BuyerForm } from "@/components/forms/buyer-form"

export default function NewBuyerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BuyerForm />
      </main>
    </div>
  )
}
