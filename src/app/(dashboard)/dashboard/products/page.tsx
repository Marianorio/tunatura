import { getProducts } from "@/server/products"
import { getCajas } from "@/server/cajas"
import { ProductList } from "@/components/dashboard/product-list"

export default async function ProductsPage() {
  const [products, cajas] = await Promise.all([getProducts(), getCajas()])

  return <ProductList products={products} initialCajas={cajas} />
}
