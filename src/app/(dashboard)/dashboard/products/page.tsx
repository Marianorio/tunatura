import { getProducts } from "@/server/products"
import { ProductList } from "@/components/dashboard/product-list"

export default async function ProductsPage() {
  const products = await getProducts()

  return <ProductList products={products} />
}
