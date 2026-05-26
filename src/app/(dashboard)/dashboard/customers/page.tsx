import { getCustomers } from "@/server/customers"
import { CustomerList } from "@/components/dashboard/customer-list"

export default async function CustomersPage() {
  const customers = await getCustomers()

  return <CustomerList customers={customers} />
}
