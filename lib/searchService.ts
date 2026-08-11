import { getSupabaseAdmin } from '@/lib/supabase'
import { Database } from '@/lib/types'

interface SearchFilters {
  category?: string
  color?: string
  size?: string
  gender?: string
  occasion?: string
  season?: string
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  fabric?: string
  fitStyle?: string
}

interface SearchParams {
  query: string
  filters?: SearchFilters
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popularity'
  limit?: number
  offset?: number
}

interface SearchResult {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  images: string[]
  category: string
  sub_category: string
  seller_id: string
  is_active: boolean
  stock_quantity: number
  sku: string
  tags: string[]
  color: string
  size: string
  fabric_material: string
  fit_style: string
  occasion: string
  pattern_design: string
  season: string
  gender: string
  age_group: string
  brand_name: string
  price_range: string
  created_at: string
  updated_at: string
  relevance_score?: number
}

interface ProductSuggestion {
  id: string
  name: string
  category?: string
  sub_category?: string
  brand_name?: string
  tags?: string[]
}

// Search suggestion with type and category
export interface SearchSuggestion {
  text: string
  type: 'product' | 'category' | 'brand' | 'tag'
  category?: string
  count?: number
}

// Enhanced synonym mapping for fuzzy search
const synonyms: Record<string, string[]> = {
  'kurta': ['ethnic wear', 'traditional', 'indian wear', 'kurti', 'kurthi'],
  'shirt': ['top', 'tee', 't-shirt', 'tshirt', 'blouse'],
  'pants': ['trousers', 'bottoms', 'pant'],
  'jeans': ['denim', 'denims', 'jean'],
  'dress': ['frock', 'gown', 'dresses'],
  'shoes': ['footwear', 'boots', 'sneakers', 'shoe', 'sneaker'],
  'bag': ['purse', 'handbag', 'tote', 'bags'],
  'watch': ['wristwatch', 'timepiece', 'watches'],
  'phone': ['mobile', 'smartphone', 'cell phone'],
  'laptop': ['notebook', 'computer', 'laptops'],
  'headphones': ['earphones', 'earbuds', 'headset'],
  'hoodie': ['hoodie', 'hoody', 'sweatshirt', 'pullover'],
  'jacket': ['coat', 'blazer', 'outerwear'],
  'sweater': ['pullover', 'jumper', 'cardigan'],
  'shorts': ['short pants', 'bermuda'],
  'sandals': ['flip flops', 'slides'],
  'wallet': ['purse', 'billfold'],
  'belt': ['waistband', 'girdle'],
  'sunglasses': ['shades', 'sun glasses'],
  'casual': ['informal', 'everyday', 'relaxed'],
  'formal': ['business', 'office', 'professional'],
  'party': ['celebration', 'festive', 'occasion'],
  'summer': ['warm weather', 'hot season'],
  'winter': ['cold weather', 'cold season'],
  'cotton': ['natural fiber', 'breathable'],
  'leather': ['genuine leather', 'hide'],
  'denim': ['jeans material', 'blue jeans'],
  'silk': ['luxury fabric', 'smooth'],
  'wool': ['warm fabric', 'knit'],
  'polyester': ['synthetic', 'durable'],
  'men': ['male', 'mens', "men's"],
  'women': ['female', 'womens', "women's"],
  'unisex': ['unisexual', 'for all'],
  'kids': ['children', 'child', 'youth'],
  'adult': ['grown up', 'mature'],
  'small': ['s', 'small size'],
  'medium': ['m', 'medium size'],
  'large': ['l', 'large size'],
  'extra large': ['xl', 'extra large size'],
  'black': ['dark', 'ebony'],
  'white': ['ivory', 'cream'],
  'blue': ['navy', 'azure'],
  'red': ['crimson', 'scarlet'],
  'green': ['emerald', 'forest'],
  'yellow': ['gold', 'amber'],
  'pink': ['rose', 'magenta'],
  'purple': ['violet', 'lavender'],
  'brown': ['tan', 'beige'],
  'gray': ['grey', 'silver'],
}

// Stop words to ignore in search
const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with'
])

// Common misspellings and corrections
const spellingCorrections: Record<string, string> = {
  'kurti': 'kurta',
  'kurthi': 'kurta',
  'tshirt': 't-shirt',
  'tshirts': 't-shirt',
  'jean': 'jeans',
  'pant': 'pants',
  'shoe': 'shoes',
  'dresse': 'dress',
  'dres': 'dress',
  'jacket': 'jacket',
  'jackets': 'jacket',
  'watch': 'watch',
  'watches': 'watch',
  'phone': 'phone',
  'phones': 'phone',
  'laptop': 'laptop',
  'laptops': 'laptop',
  'headphone': 'headphones',
  'earphone': 'earphones',
  'earbud': 'earbuds',
  'sweater': 'sweater',
  'sweaters': 'sweater',
  'short': 'shorts',
  'sandal': 'sandals',
  'wallet': 'wallet',
  'wallets': 'wallet',
  'belt': 'belt',
  'belts': 'belt',
  'sunglass': 'sunglasses',
  'casual': 'casual',
  'formal': 'formal',
  'party': 'party',
  'summer': 'summer',
  'winter': 'winter',
  'cotton': 'cotton',
  'leather': 'leather',
  'denim': 'denim',
  'silk': 'silk',
  'wool': 'wool',
  'polyester': 'polyester',
  'men': 'men',
  'women': 'women',
  'unisex': 'unisex',
  'kids': 'kids',
  'adult': 'adult',
  'small': 'small',
  'medium': 'medium',
  'large': 'large',
  'black': 'black',
  'white': 'white',
  'blue': 'blue',
  'red': 'red',
  'green': 'green',
  'yellow': 'yellow',
  'pink': 'pink',
  'purple': 'purple',
  'brown': 'brown',
  'gray': 'gray',
  'grey': 'gray'
}

// Tokenize and normalize search query with spelling correction
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 0 && !stopWords.has(token))
    .map(token => {
      // Apply spelling correction if available
      return spellingCorrections[token] || token
    })
}

// Expand query with synonyms
function expandQuery(tokens: string[]): string[] {
  const expanded = new Set<string>()
  
  for (const token of tokens) {
    expanded.add(token)
    
    // Add synonyms if they exist
    if (synonyms[token]) {
      synonyms[token].forEach(syn => expanded.add(syn))
    }
    
    // Check if token is a synonym and add the main term
    for (const [mainTerm, syns] of Object.entries(synonyms)) {
      if (syns.includes(token)) {
        expanded.add(mainTerm)
      }
    }
  }
  
  return Array.from(expanded)
}

// Enhanced relevance scoring with better weights and field matching
function calculateRelevanceScore(
  product: SearchResult,
  queryTokens: string[]
): number {
  let score = 0
  const productName = product.name?.toLowerCase() || ''
  const productDesc = product.description?.toLowerCase() || ''
  const productCategory = product.category?.toLowerCase() || ''
  const productSubCategory = product.sub_category?.toLowerCase() || ''
  const productBrand = product.brand_name?.toLowerCase() || ''
  const productTags = product.tags?.map((tag: string) => tag.toLowerCase()) || []
  const productColor = product.color?.toLowerCase() || ''
  const productSize = product.size?.toLowerCase() || ''
  const productMaterial = product.fabric_material?.toLowerCase() || ''
  const productOccasion = product.occasion?.toLowerCase() || ''
  const productSeason = product.season?.toLowerCase() || ''
  const productGender = product.gender?.toLowerCase() || ''
  
  // Check if title contains ALL query tokens (extremely high weight)
  const allTokensInTitle = queryTokens.every(token => productName.includes(token))
  if (allTokensInTitle) {
    score += 50  // Massive boost for products with all tokens in title
  }
  
  // Check if title contains MOST tokens (high weight)
  const tokensInTitleCount = queryTokens.filter(token => productName.includes(token)).length
  if (tokensInTitleCount === queryTokens.length - 1 && queryTokens.length > 1) {
    score += 30  // High boost for products with most tokens
  }
  
  for (const token of queryTokens) {
    // Exact title match (highest weight)
    if (productName.includes(token)) {
      // Boost for exact word match
      const words = productName.split(/\s+/)
      if (words.some(word => word === token)) {
        score += 10
      } else {
        score += 8
      }
    }
    
    // Title starts with token (very high weight)
    if (productName.startsWith(token)) {
      score += 12
    }
    
    // Tags exact match (high weight)
    if (productTags.some((tag: string) => tag === token)) {
      score += 6
    } else if (productTags.some((tag: string) => tag.includes(token))) {
      score += 4
    }
    
    // Category exact match (high weight)
    if (productCategory === token || productSubCategory === token) {
      score += 6
    } else if (productCategory.includes(token) || productSubCategory.includes(token)) {
      score += 4
    }
    
    // Brand exact match (high weight)
    if (productBrand === token) {
      score += 6
    } else if (productBrand.includes(token)) {
      score += 4
    }
    
    // Color exact match (medium weight)
    if (productColor === token) {
      score += 5
    } else if (productColor.includes(token)) {
      score += 3
    }
    
    // Size exact match (medium weight)
    if (productSize === token) {
      score += 5
    } else if (productSize.includes(token)) {
      score += 3
    }
    
    // Material exact match (medium weight)
    if (productMaterial === token) {
      score += 5
    } else if (productMaterial.includes(token)) {
      score += 3
    }
    
    // Occasion exact match (medium weight)
    if (productOccasion === token) {
      score += 5
    } else if (productOccasion.includes(token)) {
      score += 3
    }
    
    // Season exact match (medium weight)
    if (productSeason === token) {
      score += 5
    } else if (productSeason.includes(token)) {
      score += 3
    }
    
    // Gender exact match (medium weight)
    if (productGender === token) {
      score += 5
    } else if (productGender.includes(token)) {
      score += 3
    }
    
    // Description match (lower weight)
    if (productDesc.includes(token)) {
      score += 2
    }
    
    // SKU match (medium weight)
    if (product.sku?.toLowerCase().includes(token)) {
      score += 4
    }
  }
  
  // Boost for products with stock
  if (product.stock_quantity > 0) {
    score += 1
  }
  
  // Boost for newer products (recency factor)
  const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated < 30) {
    score += 2
  } else if (daysSinceCreated < 90) {
    score += 1
  }
  
  return score
}

// Advanced full-text search with PostgreSQL ts_rank - TIERED STRATEGY
async function searchWithFullText(
  query: string,
  tokens: string[],
  expandedTokens: string[],
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{
  products: SearchResult[]
  total: number
  appliedFilters: SearchFilters
  spellingSuggestion?: string
}> {
  const queryLower = query.toLowerCase()
  
  // TIER 1: Exact phrase match in title
  const tier1Results = await searchTier1ExactPhrase(queryLower, filters, limit, offset, supabaseAdmin)
  if (tier1Results.products.length >= Math.min(limit, 10)) {
    return tier1Results
  }
  
  // TIER 2: All words present in title/tags
  const tier2Results = await searchTier2AllWords(tokens, filters, limit, offset, supabaseAdmin)
  if (tier2Results.products.length >= Math.min(limit, 5)) {
    return combineResults([tier1Results, tier2Results], limit)
  }
  
  // TIER 3: Most words present (75%+)
  const tier3Results = await searchTier3MostWords(tokens, filters, limit, offset, supabaseAdmin)
  if (tier3Results.products.length >= Math.min(limit, 3)) {
    return combineResults([tier1Results, tier2Results, tier3Results], limit)
  }
  
  // TIER 4: Any word matches (fuzzy search)
  const tier4Results = await searchTier4AnyWord(expandedTokens, query, filters, limit, offset, supabaseAdmin)
  
  return combineResults([tier1Results, tier2Results, tier3Results, tier4Results], limit)
}

// Helper to combine and deduplicate results from multiple tiers
function combineResults(
  tierResults: Array<{ products: SearchResult[], total: number, appliedFilters: SearchFilters }>,
  limit: number
): { products: SearchResult[], total: number, appliedFilters: SearchFilters } {
  const seenIds = new Set<string>()
  const combinedProducts: SearchResult[] = []
  
  for (const tier of tierResults) {
    for (const product of tier.products) {
      if (!seenIds.has(product.id) && combinedProducts.length < limit) {
        seenIds.add(product.id)
        combinedProducts.push(product)
      }
    }
  }
  
  return {
    products: combinedProducts,
    total: combinedProducts.length,
    appliedFilters: tierResults[0]?.appliedFilters || {}
  }
}

// TIER 1: Exact phrase match in product name
async function searchTier1ExactPhrase(
  query: string,
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{ products: SearchResult[], total: number, appliedFilters: SearchFilters }> {
  try {
    let baseQuery = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
    
    // Apply filters
    baseQuery = applyFilters(baseQuery, filters)
    
    const { data, error, count } = await baseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Boost exact matches
    const scoredProducts = (data || []).map((product: any) => {
      const nameLower = product.name.toLowerCase()
      let score = 100 // High base score for tier 1
      
      if (nameLower === query) score += 50 // Exact match
      else if (nameLower.startsWith(query)) score += 30 // Starts with
      else if (nameLower.includes(` ${query} `)) score += 20 // Whole word
      
      return { ...product, relevance_score: score }
    })
    
    scoredProducts.sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0))
    
    return {
      products: scoredProducts,
      total: count || 0,
      appliedFilters: filters
    }
  } catch (err) {
    return { products: [], total: 0, appliedFilters: filters }
  }
}

// TIER 2: All words present in title/tags
async function searchTier2AllWords(
  tokens: string[],
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{ products: SearchResult[], total: number, appliedFilters: SearchFilters }> {
  try {
    let baseQuery = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
    
    // Build condition: all tokens must appear in name OR tags
    const conditions = tokens.map(token => `name.ilike.%${token}%`).join(',')
    baseQuery = baseQuery.or(conditions)
    
    // Apply filters
    baseQuery = applyFilters(baseQuery, filters)
    
    const { data, error } = await baseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Filter to only products that have ALL tokens
    const filtered = (data || []).filter((product: any) => {
      const searchText = `${product.name} ${product.tags?.join(' ')}`.toLowerCase()
      return tokens.every(token => searchText.includes(token))
    })
    
    const scoredProducts = filtered.map((product: any) => ({
      ...product,
      relevance_score: 80 + (product.stock_quantity > 0 ? 5 : 0)
    }))
    
    return {
      products: scoredProducts,
      total: filtered.length,
      appliedFilters: filters
    }
  } catch (err) {
    return { products: [], total: 0, appliedFilters: filters }
  }
}

// TIER 3: Most words present (75%+)
async function searchTier3MostWords(
  tokens: string[],
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{ products: SearchResult[], total: number, appliedFilters: SearchFilters }> {
  try {
    const threshold = Math.ceil(tokens.length * 0.75)
    
    let baseQuery = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
    
    const conditions = tokens.map(token => `name.ilike.%${token}%`).join(',')
    baseQuery = baseQuery.or(conditions)
    
    baseQuery = applyFilters(baseQuery, filters)
    
    const { data, error } = await baseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Filter to products with at least 75% of tokens
    const filtered = (data || []).filter((product: any) => {
      const searchText = `${product.name} ${product.description} ${product.tags?.join(' ')}`.toLowerCase()
      const matchCount = tokens.filter(token => searchText.includes(token)).length
      return matchCount >= threshold
    })
    
    const scoredProducts = filtered.map((product: any) => {
      const searchText = `${product.name} ${product.description}`.toLowerCase()
      const matchCount = tokens.filter(token => searchText.includes(token)).length
      return {
        ...product,
        relevance_score: 60 + (matchCount / tokens.length) * 20
      }
    })
    
    scoredProducts.sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0))
    
    return {
      products: scoredProducts,
      total: filtered.length,
      appliedFilters: filters
    }
  } catch (err) {
    return { products: [], total: 0, appliedFilters: filters }
  }
}

// TIER 4: Any word matches (fuzzy)
async function searchTier4AnyWord(
  expandedTokens: string[],
  query: string,
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{ products: SearchResult[], total: number, appliedFilters: SearchFilters }> {
  return await fuzzySearch(query, expandedTokens, expandedTokens, filters, limit, offset, supabaseAdmin)
}

// Helper to apply filters to a query
function applyFilters(baseQuery: any, filters: SearchFilters): any {
  if (filters.category) baseQuery = baseQuery.eq('category', filters.category)
  if (filters.color) baseQuery = baseQuery.eq('color', filters.color)
  if (filters.size) baseQuery = baseQuery.eq('size', filters.size)
  if (filters.gender) baseQuery = baseQuery.eq('gender', filters.gender)
  if (filters.occasion) baseQuery = baseQuery.eq('occasion', filters.occasion)
  if (filters.season) baseQuery = baseQuery.eq('season', filters.season)
  if (filters.minPrice !== undefined) baseQuery = baseQuery.gte('price', filters.minPrice)
  if (filters.maxPrice !== undefined) baseQuery = baseQuery.lte('price', filters.maxPrice)
  if (filters.brands && filters.brands.length > 0) baseQuery = baseQuery.in('brand_name', filters.brands)
  if (filters.fabric) baseQuery = baseQuery.eq('fabric_material', filters.fabric)
  if (filters.fitStyle) baseQuery = baseQuery.eq('fit_style', filters.fitStyle)
  return baseQuery
}

// Fuzzy search using trigram similarity
async function fuzzySearch(
  query: string,
  tokens: string[],
  expandedTokens: string[],
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{
  products: SearchResult[]
  total: number
  appliedFilters: SearchFilters
}> {
  // Use OR search with expanded tokens
  let baseQuery = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
  
  // Build OR conditions for fuzzy matching
  const searchPattern = `%${query}%`
  const orConditions = [
    `name.ilike.${searchPattern}`,
    `description.ilike.${searchPattern}`,
    `brand_name.ilike.${searchPattern}`,
    `category.ilike.${searchPattern}`,
    `sub_category.ilike.${searchPattern}`,
    `tags.cs.{${tokens.join(',')}}` // Array contains any token
  ]
  
  baseQuery = baseQuery.or(orConditions.join(','))
  
  // Apply filters using helper
  baseQuery = applyFilters(baseQuery, filters)
  
  const { data, error, count } = await baseQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Fuzzy search error:', error)
    return await basicSearch(query, filters, limit, offset, supabaseAdmin)
  }
  
  // Calculate relevance scores
  const scoredProducts = (data || []).map((product: any) => ({
    ...product,
    relevance_score: calculateRelevanceScore(product, tokens)
  }))
  
  // Sort by relevance score
  scoredProducts.sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0))
  
  return {
    products: scoredProducts,
    total: count || scoredProducts.length,
    appliedFilters: filters
  }
}

// Fallback basic search function
async function basicSearch(
  query: string,
  filters: SearchFilters,
  limit: number,
  offset: number,
  supabaseAdmin: any
): Promise<{
  products: SearchResult[]
  total: number
  appliedFilters: SearchFilters
}> {
  let baseQuery = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
  
  if (query.trim()) {
    const searchPattern = `%${query}%`
    baseQuery = baseQuery.or(`name.ilike.${searchPattern},description.ilike.${searchPattern},brand_name.ilike.${searchPattern},category.ilike.${searchPattern}`)
  }
  
  // Apply filters
  if (filters.category) baseQuery = baseQuery.eq('category', filters.category)
  if (filters.color) baseQuery = baseQuery.eq('color', filters.color)
  if (filters.size) baseQuery = baseQuery.eq('size', filters.size)
  if (filters.gender) baseQuery = baseQuery.eq('gender', filters.gender)
  if (filters.occasion) baseQuery = baseQuery.eq('occasion', filters.occasion)
  if (filters.season) baseQuery = baseQuery.eq('season', filters.season)
  if (filters.minPrice) baseQuery = baseQuery.gte('price', filters.minPrice)
  if (filters.maxPrice) baseQuery = baseQuery.lte('price', filters.maxPrice)
  if (filters.brands && filters.brands.length > 0) baseQuery = baseQuery.in('brand_name', filters.brands)
  if (filters.fabric) baseQuery = baseQuery.eq('fabric_material', filters.fabric)
  if (filters.fitStyle) baseQuery = baseQuery.eq('fit_style', filters.fitStyle)
  
  const { data, error, count } = await baseQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw new Error(`Search failed: ${error.message}`)
  
  return {
    products: data || [],
    total: count || 0,
    appliedFilters: filters
  }
}

// Main search function
export async function searchProducts(params: SearchParams): Promise<{
  products: SearchResult[]
  total: number
  appliedFilters: SearchFilters
  spellingSuggestion?: string
}> {
  const { query, filters = {}, sortBy = 'relevance', limit = 50, offset = 0 } = params
  
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY environment variable.')
    throw new Error('Database connection not available. Please check server configuration.')
  }
  
  // Tokenize and expand query
  const tokens = tokenizeQuery(query)
  const expandedTokens = expandQuery(tokens)
  
  // Check for spelling suggestions
  let spellingSuggestion: string | undefined
  if (query.trim()) {
    const originalTokens = query.toLowerCase().trim().split(/\s+/)
    const correctedTokens = tokens
    const hasCorrections = originalTokens.some((token, index) => 
      token !== correctedTokens[index]
    )
    
    if (hasCorrections) {
      spellingSuggestion = correctedTokens.join(' ')
    }
  }
  
  // Use PostgreSQL full-text search with database-level ranking
  if (query.trim() && sortBy === 'relevance') {
    return await searchWithFullText(query, tokens, expandedTokens, filters, limit, offset, supabaseAdmin)
  }
  
  // Build base query for non-search or non-relevance sorts
  let baseQuery = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
  
  // Apply enhanced text search if query exists
  if (query.trim()) {
    // Build comprehensive search conditions
    const searchConditions: string[] = []
    
    // For each token, create multiple search patterns
    expandedTokens.forEach(token => {
      // Exact matches (highest priority)
      searchConditions.push(`name.ilike.%${token}%`)
      searchConditions.push(`brand_name.ilike.%${token}%`)
      searchConditions.push(`category.ilike.%${token}%`)
      searchConditions.push(`sub_category.ilike.%${token}%`)
      
      // Partial matches
      searchConditions.push(`description.ilike.%${token}%`)
      searchConditions.push(`color.ilike.%${token}%`)
      searchConditions.push(`fabric_material.ilike.%${token}%`)
      searchConditions.push(`occasion.ilike.%${token}%`)
      searchConditions.push(`season.ilike.%${token}%`)
      searchConditions.push(`gender.ilike.%${token}%`)
      searchConditions.push(`age_group.ilike.%${token}%`)
      searchConditions.push(`fit_style.ilike.%${token}%`)
      searchConditions.push(`pattern_design.ilike.%${token}%`)
      
      // Tag matching
      searchConditions.push(`tags.cs.{${token}}`)
    })
    
    // Join all conditions with OR
    baseQuery = baseQuery.or(searchConditions.join(','))
  }
  
  // Apply filters
  if (filters.category) {
    baseQuery = baseQuery.eq('category', filters.category)
  }
  
  if (filters.color) {
    baseQuery = baseQuery.eq('color', filters.color)
  }
  
  if (filters.size) {
    baseQuery = baseQuery.eq('size', filters.size)
  }
  
  if (filters.gender) {
    baseQuery = baseQuery.eq('gender', filters.gender)
  }
  
  if (filters.occasion) {
    baseQuery = baseQuery.eq('occasion', filters.occasion)
  }
  
  if (filters.season) {
    baseQuery = baseQuery.eq('season', filters.season)
  }
  
  if (filters.minPrice) {
    baseQuery = baseQuery.gte('price', filters.minPrice)
  }
  
  if (filters.maxPrice) {
    baseQuery = baseQuery.lte('price', filters.maxPrice)
  }
  
  if (filters.brands && filters.brands.length > 0) {
    baseQuery = baseQuery.in('brand_name', filters.brands)
  }
  
  if (filters.fabric) {
    baseQuery = baseQuery.eq('fabric_material', filters.fabric)
  }
  
  if (filters.fitStyle) {
    baseQuery = baseQuery.eq('fit_style', filters.fitStyle)
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'price-low':
      baseQuery = baseQuery.order('price', { ascending: true })
      break
    case 'price-high':
      baseQuery = baseQuery.order('price', { ascending: false })
      break
    case 'newest':
      baseQuery = baseQuery.order('created_at', { ascending: false })
      break
    case 'popularity':
      // Note: This would need analytics data, for now we'll use recency
      baseQuery = baseQuery.order('created_at', { ascending: false })
      break
    case 'relevance':
    default:
      // Relevance will be calculated in post-processing
      baseQuery = baseQuery.order('created_at', { ascending: false })
      break
  }
  
  // Execute query
  const { data, error, count } = await baseQuery
    .range(offset, offset + limit - 1)
  
  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }
  
  // Calculate relevance scores if sorting by relevance
  let products = data || []
  let actualCount = count || 0
  
  if (sortBy === 'relevance' && query.trim()) {
    const scored = products.map((product: SearchResult) => ({
      ...product,
      relevance_score: calculateRelevanceScore(product, tokens)
    }))
    
    // Filter out products with very low relevance scores (score < 5)
    // This ensures only relevant products are shown
    const relevantProducts = scored.filter((product: SearchResult) => (product.relevance_score || 0) >= 5)
    
    // Update count to reflect filtered results
    actualCount = relevantProducts.length
    
    // Sort by relevance score descending
    products = relevantProducts.sort((a: SearchResult, b: SearchResult) => (b.relevance_score || 0) - (a.relevance_score || 0))
  }
  
  return {
    products: products as SearchResult[],
    total: actualCount,
    appliedFilters: filters,
    spellingSuggestion
  }
}

// Get search suggestions/autocomplete with types and categories
export async function getSearchSuggestions(query: string, limit: number = 15): Promise<{
  suggestions: SearchSuggestion[]
  trending: string[]
}> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized')
  }
  
  if (!query.trim()) {
    // Return trending/popular search terms when no query
    return {
      suggestions: [],
      trending: [
        'cotton t-shirt',
        'jeans',
        'kurta',
        'shoes',
        'dress',
        'jacket',
        'watch',
        'formal shirt',
        'sneakers',
        'hoodie'
      ]
    }
  }
  
  const tokens = tokenizeQuery(query)
  const expandedTokens = expandQuery(tokens)
  const searchPattern = `${query}%` // Starts with pattern for autocomplete
  
  const suggestions: SearchSuggestion[] = []
  const seenTexts = new Set<string>()
  
  try {
    // Get products matching the query (increased limit for better coverage)
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('name, category, sub_category, brand_name, tags')
      .eq('is_active', true)
      .or(`name.ilike.${searchPattern},brand_name.ilike.${searchPattern},category.ilike.${searchPattern}`)
      .limit(500)
    
    if (error) {
      console.error('Suggestions error:', error)
      return { suggestions: [], trending: [] }
    }
    
    // Priority 1: Exact product name matches (starts with query)
    products?.forEach((product: ProductSuggestion) => {
      const name = product.name.toLowerCase()
      if (name.startsWith(query.toLowerCase()) && !seenTexts.has(product.name)) {
        suggestions.push({
          text: product.name,
          type: 'product',
          category: product.category
        })
        seenTexts.add(product.name)
      }
    })
    
    // Priority 2: Brand matches (starts with query)
    products?.forEach((product: ProductSuggestion) => {
      const brand = product.brand_name?.toLowerCase() || ''
      if (brand.startsWith(query.toLowerCase()) && product.brand_name && !seenTexts.has(product.brand_name)) {
        // Count products for this brand
        const count = products.filter((p: ProductSuggestion) => p.brand_name === product.brand_name).length
        suggestions.push({
          text: product.brand_name,
          type: 'brand',
          count
        })
        seenTexts.add(product.brand_name)
      }
    })
    
    // Priority 3: Category matches (starts with query)
    products?.forEach((product: ProductSuggestion) => {
      const category = product.category?.toLowerCase() || ''
      const subCategory = product.sub_category?.toLowerCase() || ''
      
      if (category.startsWith(query.toLowerCase()) && product.category && !seenTexts.has(product.category)) {
        const count = products.filter((p: ProductSuggestion) => p.category === product.category).length
        suggestions.push({
          text: product.category,
          type: 'category',
          count
        })
        seenTexts.add(product.category)
      }
      if (subCategory.startsWith(query.toLowerCase()) && product.sub_category && !seenTexts.has(product.sub_category)) {
        const count = products.filter((p: ProductSuggestion) => p.sub_category === product.sub_category).length
        suggestions.push({
          text: product.sub_category,
          type: 'category',
          category: product.category,
          count
        })
        seenTexts.add(product.sub_category)
      }
    })
    
    // Priority 4: Product names containing any token
    if (suggestions.length < limit) {
      products?.forEach((product: ProductSuggestion) => {
        const name = product.name.toLowerCase()
        if (expandedTokens.some(token => name.includes(token)) && !seenTexts.has(product.name)) {
          suggestions.push({
            text: product.name,
            type: 'product',
            category: product.category
          })
          seenTexts.add(product.name)
        }
      })
    }
    
    // Priority 5: Tag matches
    if (suggestions.length < limit) {
      products?.forEach((product: ProductSuggestion) => {
        product.tags?.forEach((tag: string) => {
          const tagLower = tag.toLowerCase()
          if (expandedTokens.some(token => tagLower.includes(token)) && !seenTexts.has(tag)) {
            suggestions.push({
              text: tag,
              type: 'tag'
            })
            seenTexts.add(tag)
          }
        })
      })
    }
    
    // Priority 6: Fuzzy matches (contains query anywhere)
    if (suggestions.length < limit) {
      const queryLower = query.toLowerCase()
      products?.forEach((product: ProductSuggestion) => {
        const name = product.name.toLowerCase()
        if (name.includes(queryLower) && !seenTexts.has(product.name)) {
          suggestions.push({
            text: product.name,
            type: 'product',
            category: product.category
          })
          seenTexts.add(product.name)
        }
      })
    }
    
  } catch (err) {
    console.error('Failed to fetch suggestions:', err)
    return { suggestions: [], trending: [] }
  }
  
  // Limit results
  const limitedSuggestions = suggestions.slice(0, limit)
  
  return {
    suggestions: limitedSuggestions,
    trending: []
  }
}

// Get unique values for filters
export async function getFilterOptions(): Promise<{
  colors: string[]
  sizes: string[]
  genders: string[]
  occasions: string[]
  seasons: string[]
  brands: string[]
  fabrics: string[]
  fitStyles: string[]
}> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized')
  }
  
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('color, size, gender, occasion, season, brand_name, fabric_material, fit_style')
    .eq('is_active', true)
  
  if (error) {
    throw new Error(`Failed to fetch filter options: ${error.message}`)
  }
  
  const colors = [...new Set(data?.map((p: any) => p.color).filter(Boolean) || [])] as string[]
  const sizes = [...new Set(data?.map((p: any) => p.size).filter(Boolean) || [])] as string[]
  const genders = [...new Set(data?.map((p: any) => p.gender).filter(Boolean) || [])] as string[]
  const occasions = [...new Set(data?.map((p: any) => p.occasion).filter(Boolean) || [])] as string[]
  const seasons = [...new Set(data?.map((p: any) => p.season).filter(Boolean) || [])] as string[]
  const brands = [...new Set(data?.map((p: any) => p.brand_name).filter(Boolean) || [])] as string[]
  const fabrics = [...new Set(data?.map((p: any) => p.fabric_material).filter(Boolean) || [])] as string[]
  const fitStyles = [...new Set(data?.map((p: any) => p.fit_style).filter(Boolean) || [])] as string[]
  
  return {
    colors: colors.sort(),
    sizes: sizes.sort(),
    genders: genders.sort(),
    occasions: occasions.sort(),
    seasons: seasons.sort(),
    brands: brands.sort(),
    fabrics: fabrics.sort(),
    fitStyles: fitStyles.sort()
  }
}

