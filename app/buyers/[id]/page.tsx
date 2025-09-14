import { notFound } from "next/navigation"
import { prisma } from "@/lib/database"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { BuyerForm } from "@/components/forms/buyer-form"

async function getBuyer(id: string, userId: string) {
  const buyer = await prisma.buyer.findFirst({
    where: { id, ownerId: userId },
    include: {
      history: {
        take: 5,
        orderBy: { changedAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })

  return buyer
}

export default async function EditBuyerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const { id } = await params
  const buyer = await getBuyer(id, user.id)

  if (!buyer) {
    notFound()
  }

  const transformedBuyer = {
    ...buyer,
    email: buyer.email ?? undefined,
    budgetMin: buyer.budgetMin ?? undefined,
    budgetMax: buyer.budgetMax ?? undefined,
    bhk: buyer.bhk ?? undefined,
    notes: buyer.notes ?? undefined,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BuyerForm initialData={transformedBuyer} isEditing={true} buyerId={buyer.id} />
      </main>
    </div>
  )
}
