import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ARS$ prices updated to June 2026 (approx)
const PRODUCT_NAMES = [
  { name: "Kiak Urbe", brand: "Kiak", category: "Perfumería", price: 12500, costPrice: 7800, barcode: "7791234560011" },
  { name: "Kiak Ventura", brand: "Kiak", category: "Perfumería", price: 14200, costPrice: 8900, barcode: "7791234560028" },
  { name: "Urbano Uctria", brand: "Urbano", category: "Perfumería", price: 13500, costPrice: 8400, barcode: "7791234560035" },
  { name: "Essential Hombre", brand: "Essential", category: "Perfumería", price: 10800, costPrice: 6700, barcode: "7791234560042" },
  { name: "Faces Bronceado", brand: "Faces", category: "Maquillaje", price: 8200, costPrice: 5100, barcode: "7791234560059" },
  { name: "Faces Labial Mate", brand: "Faces", category: "Maquillaje", price: 6300, costPrice: 3900, barcode: "7791234560066" },
  { name: "Natura Tododia", brand: "Natura", category: "Corporal", price: 9800, costPrice: 6100, barcode: "7791234560073" },
  { name: "Natura Ekos", brand: "Natura", category: "Corporal", price: 11800, costPrice: 7400, barcode: "7791234560080" },
  { name: "Cronos Desodorante", brand: "Cronos", category: "Perfumería", price: 9400, costPrice: 5800, barcode: "7791234560097" },
  { name: "Mamãe Bebê", brand: "Mamãe", category: "Infantil", price: 7900, costPrice: 4900, barcode: "7791234560103" },
  { name: "Luna Compacta", brand: "Luna", category: "Maquillaje", price: 15600, costPrice: 9800, barcode: "7791234560110" },
  { name: "Phytoterápica", brand: "Natura", category: "Capilar", price: 11100, costPrice: 6900, barcode: "7791234560127" },
  { name: "Humor Facial", brand: "Humor", category: "Maquillaje", price: 5300, costPrice: 3300, barcode: "7791234560134" },
  { name: "Kriska Barro", brand: "Kriska", category: "Corporal", price: 7100, costPrice: 4400, barcode: "7791234560141" },
  { name: "Erva Doce", brand: "Natura", category: "Corporal", price: 8800, costPrice: 5500, barcode: "7791234560158" },
  { name: "Natura Hombre", brand: "Natura", category: "Perfumería", price: 13900, costPrice: 8700, barcode: "7791234560165" },
  { name: "Seve Shampoo", brand: "Seve", category: "Capilar", price: 6500, costPrice: 4000, barcode: "7791234560172" },
  { name: "Seve Acondicionador", brand: "Seve", category: "Capilar", price: 6800, costPrice: 4200, barcode: "7791234560189" },
]

const CUSTOMER_NAMES = [
  { name: "María López", phone: "11 2345-6789", email: "maria.lopez@email.com" },
  { name: "Carlos Rodríguez", phone: "11 3456-7890", email: "carlos.rodriguez@email.com" },
  { name: "Ana Martínez", phone: "11 4567-8901", email: "ana.martinez@email.com" },
  { name: "Juan Pérez", phone: "11 5678-9012", email: "juan.perez@email.com" },
  { name: "Laura García", phone: "11 6789-0123", email: "laura.garcia@email.com" },
  { name: "Pedro Fernández", phone: "11 7890-1234", email: "pedro.fernandez@email.com" },
  { name: "Sofía Díaz", phone: "11 8901-2345", email: "sofia.diaz@email.com" },
  { name: "Diego Silva", phone: "11 9012-3456", email: "diego.silva@email.com" },
  { name: "Valentina Torres", phone: "11 0123-4567", email: "valentina.torres@email.com" },
  { name: "Mateo Castillo", phone: "11 1234-5678", email: "mateo.castillo@email.com" },
  { name: "Camila Romero", phone: "11 2468-1357", email: "camila.romero@email.com" },
  { name: "Lautaro Vargas", phone: "11 1357-2468", email: "lautaro.vargas@email.com" },
  { name: "Florencia Medina", phone: "11 9876-5432", email: "florencia.medina@email.com" },
  { name: "Agustín Ríos", phone: "11 8765-4321", email: "agustin.rios@email.com" },
  { name: "Julieta Acosta", phone: "11 7654-3210", email: "julieta.acosta@email.com" },
]

const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const

const CAJA_NAMES = ["Caja 1 — Pedido Marzo", "Caja 2 — Pedido Abril", "Caja 3 — Reposición Mayo", "Caja 4 — Lanzamiento Junio", "Caja 5 — Pedido Mayo"]

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

  // Clear existing data for this user (order matters for FK constraints)
  console.log("🧹 Clearing old data...")
  await prisma.cajaItem.deleteMany({ where: { caja: { userId } } })
  await prisma.caja.deleteMany({ where: { userId } })
  await prisma.orderItem.deleteMany({ where: { order: { userId } } })
  await prisma.order.deleteMany({ where: { userId } })
  await prisma.product.deleteMany({ where: { userId } })
  await prisma.customer.deleteMany({ where: { userId } })
  console.log("  ✓ Done")

  // Create products (stock = 0 initially, will be populated via cajas)
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
          stock: 0,
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

  // Create cajas (boxes received) with items that have expiration dates
  console.log("📦 Creating cajas with items...")
  let totalCajaItems = 0
  const cajaStockMap = new Map<string, number>() // productId -> total stock from cajas

  for (let ci = 0; ci < CAJA_NAMES.length; ci++) {
    const numItems = randomInt(3, 6)
    const selectedProducts = new Set<number>()
    const items: { productId: string; cantidad: number; fechaVencimiento: Date | null }[] = []

    for (let j = 0; j < numItems; j++) {
      let idx = randomInt(0, products.length - 1)
      while (selectedProducts.has(idx)) idx = randomInt(0, products.length - 1)
      selectedProducts.add(idx)

      const product = products[idx]
      const cantidad = randomInt(2, 8)
      const daysUntilExpiry = randomInt(-60, 90) // some already expired, some soon, some far
      const fechaVencimiento = new Date()
      fechaVencimiento.setDate(fechaVencimiento.getDate() + daysUntilExpiry)

      items.push({ productId: product.id, cantidad, fechaVencimiento })
      cajaStockMap.set(product.id, (cajaStockMap.get(product.id) ?? 0) + cantidad)
      totalCajaItems++
    }

    const caja = await prisma.caja.create({
      data: {
        nombre: CAJA_NAMES[ci],
        fechaRecibida: randomDate(120),
        userId,
        items: { create: items },
      },
    })

    // Update product stock from this caja
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.cantidad } },
      })
    }

    console.log(`  ✓ Caja "${caja.nombre}" — ${items.length} productos`)

    // Show some items with expiring dates for visibility
    for (const item of items) {
      if (item.fechaVencimiento) {
        const daysLeft = Math.ceil((item.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const product = products.find((p) => p.id === item.productId)
        if (daysLeft <= 30) {
          console.log(`    ⏳ ${product?.name} — vence en ${daysLeft} d (${item.cantidad} uds)`)
        }
      }
    }
  }
  console.log(`  ✓ ${CAJA_NAMES.length} cajas, ${totalCajaItems} items total`)

  // Create orders (uses product.stock which was set by cajas)
  console.log("📋 Creating orders (x60)...")
  const orders = []

  for (let i = 0; i < 60; i++) {
    const customer = customers[randomInt(0, customers.length - 1)]
    const numItems = randomInt(1, 4)
    const selectedProducts = new Set<number>()
    const items: { productId: string; quantity: number; unitPrice: number; subtotal: number }[] = []

    for (let j = 0; j < numItems; j++) {
      let idx = randomInt(0, products.length - 1)
      while (selectedProducts.has(idx)) idx = randomInt(0, products.length - 1)
      selectedProducts.add(idx)

      const product = products[idx]
      const qty = randomInt(1, 3)
      const price = Number(product.price)
      items.push({
        productId: product.id,
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price,
      })
    }

    const total = items.reduce((s, item) => s + item.subtotal, 0)
    const status = ORDER_STATUSES[randomInt(0, 3)]
    const createdAt = randomDate(120)

    const numCuotas = status === "pending" ? randomInt(1, 4) : 1
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(i + 1).padStart(4, "0")}`,
        customerId: customer.id,
        userId,
        status,
        total,
        cuotas: numCuotas,
        createdAt,
        items: { create: items },
        cuotaRecords: numCuotas > 1
          ? {
              create: Array.from({ length: numCuotas }, (_, ci) => ({
                numero: ci + 1,
                monto: Number(total) / numCuotas,
                vencimiento: new Date(new Date(createdAt).getTime() + (ci + 1) * 30 * 24 * 60 * 60 * 1000),
              })),
            }
          : undefined,
      },
    })
    orders.push(order)
  }
  console.log(`  ✓ ${orders.length} orders created`)

  // Show summary
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length
  const deliveredCount = orders.filter((o) => o.status === "delivered").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)

  const expiringCount = await prisma.cajaItem.count({
    where: {
      caja: { userId },
      fechaVencimiento: {
        not: null,
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

  console.log("")
  console.log("📊 Summary:")
  console.log(`  Productos: ${products.length}`)
  console.log(`  Clientes: ${customers.length}`)
  console.log(`  Cajas: ${CAJA_NAMES.length} (${totalCajaItems} items)`)
  console.log(`  Items próximos a vencer (≤30d): ${expiringCount}`)
  console.log(`  Pedidos: ${orders.length} (${pendingCount} pend, ${confirmedCount} conf, ${deliveredCount} entreg, ${cancelledCount} canc)`)
  console.log(`  Ingresos totales: $${totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`)
  console.log("")
  console.log("✅ Seed complete!")

  // Show top stock levels
  const productsWithStock = await prisma.product.findMany({
    where: { userId, isActive: true, stock: { gt: 0 } },
    select: { name: true, stock: true },
    orderBy: { stock: "desc" },
    take: 5,
  })
  console.log("📈 Top stock:")
  for (const p of productsWithStock) {
    console.log(`  ${p.name}: ${p.stock} uds`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
