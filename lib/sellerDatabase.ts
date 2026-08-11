import { getSupabase } from './supabase'

export interface SellerStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  monthlyGrowth: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  image_url: string
  images: string[]
  sku: string
  is_active: boolean
  seller_id: string
  created_at: string
  updated_at: string
  // Inventory data
  inventory?: {
    current_stock: number
    reserved_stock: number
    available_stock: number
    reorder_level: number
    cost_per_unit: number
    supplier: string
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
    last_restocked: string
  }
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  seller_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  payment_status: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  } | null
  tracking_number: string
  created_at: string
  updated_at: string
  // Relations
  customer?: {
    full_name: string
    email: string
  }
  order_items?: Array<{
    id: string
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
    product?: {
      name: string
      image_url: string
    }
  }>
}

export interface Contract {
  id: string
  seller_id: string
  creator_id: string
  product_ids: string[]
  commission_rate: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  terms: string
  total_sales: number
  total_commission: number
  created_at: string
  updated_at: string
  // Relations
  creator?: {
    full_name: string
    email: string
    username: string
    followers_count: number
  }
  products?: Array<{
    id: string
    name: string
    price: number
    image_url: string
  }>
}

export interface InventoryItem {
  id: string
  product_id: string
  seller_id: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_level: number
  reorder_quantity: number
  cost_per_unit: number
  supplier: string
  last_restocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  created_at: string
  updated_at: string
  // Relations
  product?: {
    name: string
    price: number
    category: string
    sku: string
    image_url: string
  }
}

// Seller Stats
export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  try {
    // Get total products
    const supabase = getSupabase();
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('is_active', true)

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('status', 'pending')

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .in('status', ['delivered', 'shipped', 'processing'])

    const totalRevenue = revenueData?.reduce((sum: number, order: { total_amount: number }) => sum + Number(order.total_amount), 0) || 0

    // Get unique customers count
    const { data: customerData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('seller_id', sellerId)

    const uniqueCustomers = new Set(customerData?.map((order: { user_id: string }) => order.user_id) || [])
    const totalCustomers = uniqueCustomers.size

    // Calculate monthly growth (simplified - comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const { data: recentRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('status', ['delivered', 'shipped', 'processing'])

    const { data: previousRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('seller_id', sellerId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())
      .in('status', ['delivered', 'shipped', 'processing'])

    const recentTotal = recentRevenue?.reduce((sum: number, order: { total_amount: number }) => sum + Number(order.total_amount), 0) || 0
    const previousTotal = previousRevenue?.reduce((sum: number, order: { total_amount: number }) => sum + Number(order.total_amount), 0) || 0
    const monthlyGrowth = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalCustomers,
      pendingOrders: pendingOrders || 0,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
    }
  } catch (error) {
    console.error('Error fetching seller stats:', error)
    throw error
  }
}

// Products
export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        inventory (
          current_stock,
          reserved_stock,
          available_stock,
          reorder_level,
          cost_per_unit,
          supplier,
          status,
          last_restocked
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map((product: Product & { inventory?: Array<InventoryItem> }) => ({
      ...product,
      inventory: product.inventory?.[0] || null
    })) || []
  } catch (error) {
    console.error('Error fetching seller products:', error)
    throw error
  }
}

// Orders
export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  try {
    console.log('getSellerOrders - Fetching orders for seller:', sellerId);
    const supabase = getSupabase();
    
    // First, get the orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    console.log('getSellerOrders - Orders response:', { orders, ordersError });
    if (ordersError) throw ordersError

    if (!orders || orders.length === 0) {
      console.log('getSellerOrders - No orders found');
      return []
    }

    // Get order items for all orders
    const orderIds = orders.map((order: any) => order.id)
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        unit_price,
        total_price,
        products (
          name,
          image_url
        )
      `)
      .in('order_id', orderIds)

    console.log('getSellerOrders - Order items response:', { orderItems, itemsError });
    if (itemsError) throw itemsError

    // Process the data
    const processedOrders = orders.map((order: any) => {
      const orderItemsForOrder = orderItems?.filter((item: any) => item.order_id === order.id) || []
      
      return {
        ...order,
        customer: order.profiles,
        order_items: orderItemsForOrder.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          product: item.products
        }))
      }
    })
    
    console.log('getSellerOrders - Processed orders:', processedOrders);
    return processedOrders
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    throw error
  }
}

// Contracts
export async function getSellerContracts(sellerId: string): Promise<Contract[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        profiles!contracts_creator_id_fkey (
          full_name,
          email,
          username,
          followers_count
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get products for each contract
    const contractsWithProducts = await Promise.all(
      (data || []).map(async (contract: {
        id: string
        seller_id: string
        creator_id: string
        product_ids: string[]
        commission_rate: number
        status: 'pending' | 'active' | 'completed' | 'cancelled'
        terms: string
        total_sales: number
        total_commission: number
        created_at: string
        updated_at: string
        profiles: {
          full_name: string
          email: string
          username: string
          followers_count: number
        }
      }) => {
        if (contract.product_ids && contract.product_ids.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, image_url')
            .in('id', contract.product_ids)

          return {
            ...contract,
            creator: contract.profiles,
            products: products || []
          }
        }
        return {
          ...contract,
          creator: contract.profiles,
          products: []
        }
      })
    )

    return contractsWithProducts
  } catch (error) {
    console.error('Error fetching seller contracts:', error)
    throw error
  }
}

// Inventory
export async function getSellerInventory(sellerId: string): Promise<InventoryItem[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          name,
          price,
          category,
          sku,
          image_url
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map((item: {
      id: string
      product_id: string
      seller_id: string
      current_stock: number
      reserved_stock: number
      available_stock: number
      reorder_level: number
      reorder_quantity: number
      cost_per_unit: number
      supplier: string
      last_restocked: string
      status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
      created_at: string
      updated_at: string
      products: {
        name: string
        price: number
        category: string
        sku: string
        image_url: string
      }
    }) => ({
      ...item,
      product: item.products
    })) || []
  } catch (error) {
    console.error('Error fetching seller inventory:', error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string, sellerId: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('seller_id', sellerId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// Create product with inventory
export async function createProductWithInventory(
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  inventoryData: Partial<InventoryItem>
) {
  try {
    const supabase = getSupabase();
    // Create product first
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (productError) throw productError

    // Create inventory record
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert([{
        product_id: product.id,
        seller_id: productData.seller_id,
        current_stock: inventoryData.current_stock || 0,
        reserved_stock: inventoryData.reserved_stock || 0,
        reorder_level: inventoryData.reorder_level || 10,
        reorder_quantity: inventoryData.reorder_quantity || 50,
        cost_per_unit: inventoryData.cost_per_unit || 0,
        supplier: inventoryData.supplier || '',
        last_restocked: inventoryData.last_restocked || new Date().toISOString()
      }])
      .select()
      .single()

    if (inventoryError) throw inventoryError

    return { product, inventory }
  } catch (error) {
    console.error('Error creating product with inventory:', error)
    throw error
  }
}

// Update inventory
export async function updateInventory(inventoryId: string, updates: Partial<InventoryItem>, sellerId: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', inventoryId)
      .eq('seller_id', sellerId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error updating inventory:', error)
    throw error
  }
}
