import { getCustomerDebts } from "@/server/customers"
import { DebtsList } from "@/components/dashboard/debts-list"

export default async function DebtsPage() {
  const debts = await getCustomerDebts()

  return <DebtsList initial={debts} />
}
