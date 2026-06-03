import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PRODUCT_NAMES = [
  { name: "Kiak Urbe", brand: "Kiak", category: "Perfumería", price: 45.50, costPrice: 28.00, stock: 8, barcode: "7791234560011" },
  { name: "Kiak Ventura", brand: "Kiak", category: "Perfumería", price: 52.00, costPrice: 32.00, stock: 12, barcode: "7791234560028" },
  { name: "Urbano Uctria", brand: "Urbano", category: "Perfumería", price: 48.75, costPrice: 30.00, stock: 5, barcode: "7791234560035" },
  { name: "Essential Hombre", brand: "Essential", category: "Perfumería", price: 38.90, costPrice: 24.00, stock: 15, barcode: "7791234560042" },
  { name: "Faces Bronceado", brand: "Faces", category: "Maquillaje", price: 29.90, costPrice: 18.00, stock: 20, barcode: "7791234560059" },
  { name: "Faces Labial Mate", brand: "Faces", category: "Maquillaje", price: 22.50, costPrice: 14.00, stock: 3, barcode: "7791234560066" },
  { name: "Natura Tododia", brand: "Natura", category: "Corporal", price: 35.00, costPrice: 21.00, stock: 10, barcode: "7791234560073" },
  { name: "Natura Ekos", brand: "Natura", category: "Corporal", price: 42.30, costPrice: 26.00, stock: 7, barcode: "7791234560080" },
  { name: "Cronos Desodorante", brand: "Cronos", category: "Perfumería", price: 33.60, costPrice: 20.00, stock: 0, barcode: "7791234560097" },
  { name: "Mamãe Bebê", brand: "Mamãe", category: "Infantil", price: 28.40, costPrice: 17.00, stock: 14, barcode: "7791234560103" },
  { name: "Luna Compacta", brand: "Luna", category: "Maquillaje", price: 56.20, costPrice: 35.00, stock: 6, barcode: "7791234560110" },
  { name: "Phytoterápica", brand: "Natura", category: "Capilar", price: 39.80, costPrice: 24.00, stock: 9, barcode: "7791234560127" },
  { name: "Humor Facial", brand: "Humor", category: "Maquillaje", price: 18.90, costPrice: 11.00, stock: 2, barcode: "7791234560134" },
  { name: "Kriska Barro", brand: "Kriska", category: "Corporal", price: 25.30, costPrice: 15.00, stock: 11, barcode: "7791234560141" },
  { name: "Erva Doce", brand: "Natura", category: "Corporal", price: 31.50, costPrice: 19.00, stock: 4, barcode: "7791234560158" },
]

const CUSTOMER_NAMES = [
  { name: "María López", phone: "11 2345-6789", email: "maria@email.com" },
  { name: "Carlos Rodríguez", phone: "11 3456-7890", email: "carlos@email.com" },
  { name: "Ana Martínez", phone: "11 4567-8901", email: "ana@email.com" },
  { name: "Juan Pérez", phone: "11 5678-9012", email: "juan@email.com" },
  { name: "Laura García", phone: "11 6789-0123", email: "laura@email.com" },
  { name: "Pedro Fernández", phone: "11 7890-1234", email: "pedro@email.com" },
  { name: "Sofía Díaz", phone: "11 8901-2345", email: "sofia@email.com" },
  { name: "Diego Silva", phone: "11 9012-3456", email: "diego@email.com" },
  { name: "Valentina Torres", phone: "11 0123-4567", email: "valentina@email.com" },
  { name: "Mateo Castillo", phone: "11 1234-5678", email: "mateo@email.com" },
  { name: "Camila Romero", phone: "11 2468-1357", email: "camila@email.com" },
  { name: "Lautaro Vargas", phone: "11 1357-2468", email: "lautaro@email.com" },
]

const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(0, daysAgo))
  return d
}

async function main() {
  console.log("🌱 Seeding database...")

  const users = await prisma.user.findMany({ take: 1 })
  if (users.length === 0) {
    console.log("❌ No users found. Create a user first via Google login.")
    await prisma.$disconnect()
    return
  }

  const userId = users[0].id
  console.log(`📋 Using user: ${users[0].name ?? users[0].email} (${userId})`)

  // Clear existing data for this user
  console.log("🧹 Clearing old data...")
  await prisma.orderItem.deleteMany({ where: { order: { userId } } })
  await prisma.order.deleteMany({ where: { userId } })
  await prisma.product.deleteMany({ where: { userId } })
  await prisma.customer.deleteMany({ where: { userId } })

  // Create products
  console.log("📦 Creating products...")
  const products = await Promise.all(
    PRODUCT_NAMES.map((p, i) =>
      prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          costPrice: p.costPrice,
          stock: p.stock,
          barcode: p.barcode,
          sku: `NAT-${String(i + 1).padStart(6, "0")}`,
          isActive: true,
          userId,
        },
      })
    )
  )
  console.log(`  ✓ ${products.length} products created`)

  // Create customers
  console.log("👥 Creating customers...")
  const customers = await Promise.all(
    CUSTOMER_NAMES.map((c) =>
      prisma.customer.create({
        data: { ...c, userId },
      })
    )
  )
  console.log(`  ✓ ${customers.length} customers created`)

  // Create orders
  console.log("📋 Creating orders...")
  let orderCount = 0
  const orders = []

  for (let i = 0; i < 30; i++) {
    const customer = customers[randomInt(0, customers.length - 1)]
    const numItems = randomInt(1, 4)
    const selectedProducts = new Set<number>()
    const items = []

    for (let j = 0; j < numItems; j++) {
      let idx = randomInt(0, products.length - 1)
      while (selectedProducts.has(idx)) idx = randomInt(0, products.length - 1)
      selectedProducts.add(idx)

      const product = products[idx]
      const qty = randomInt(1, 3)
      items.push({
        productId: product.id,
        quantity: qty,
        unitPrice: Number(product.price),
        subtotal: qty * Number(product.price),
      })
    }

    const total = items.reduce((s, i) => s + i.subtotal, 0)
    const status = ORDER_STATUSES[randomInt(0, 3)]
    const createdAt = randomDate(90)

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(i + 1).padStart(4, "0")}`,
        customerId: customer.id,
        userId,
        status,
        total,
        cuotas: status === "pending" ? randomInt(1, 4) : 1,
        createdAt,
        items: { create: items },
      },
    })
    orders.push(order)
    orderCount++
  }
  console.log(`  ✓ ${orderCount} orders created`)

  // Show summary
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length
  const deliveredCount = orders.filter((o) => o.status === "delivered").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)

  console.log("")
  console.log("📊 Summary:")
  console.log(`  Productos: ${products.length}`)
  console.log(`  Clientes: ${customers.length}`)
  console.log(`  Pedidos: ${orders.length} (${pendingCount} pend, ${confirmedCount} conf, ${deliveredCount} entreg, ${cancelledCount} canc)`)
  console.log(`  Ingresos totales: $${totalRevenue.toFixed(2)}`)
  console.log("")
  console.log("✅ Seed complete!")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
