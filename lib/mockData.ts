export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    isCreator: boolean;
    isSeller: boolean;
    isVerified: boolean;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    followers: number;
    bio: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    stock: number;
    sellerId: string;
    category: string;
    status: 'active' | 'inactive';
    images?: string[];
    originalPrice?: number;
    discount?: number;
    sizes?: string[];
    rating?: number;
    reviews?: number;
    brand?: string;
    colors?: { name: string; image: string }[];
    features?: string[];
    specifications?: { [key: string]: string };
    isNew?: boolean;
}

export interface Reel {
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar: string;
    views: number;
    likes: number;
    productId?: string;
    product?: Product;
    caption: string;
    createdAt: string;
    duration: string;
}

export interface LiveStream {
    id: string;
    title: string;
    thumbnail: string;
    creatorId: string;
    creatorName: string;
    creatorAvatar: string;
    viewers: number;
    isLive: boolean;
    scheduledAt: string;
    products: Product[];
}

export interface Contract {
    id: string;
    creatorId: string;
    creatorName: string;
    sellerId: string;
    sellerName: string;
    productId: string;
    productName: string;
    commission: number;
    status: 'pending' | 'active' | 'completed';
    createdAt: string;
}

// Mock Data
export const mockUser: User = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isCreator: true,
    isSeller: false,
    isVerified: true,
    verificationStatus: 'verified',
    followers: 125000,
    bio: 'Fashion & Lifestyle Content Creator'
};

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Men Mid-Rise Corduroy Smart Trouser',
        price: 1149,
        originalPrice: 4999,
        discount: 77,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600&h=800&fit=crop'
        ],
        sizes: ['30', '32', '34', '36', '38'],
        rating: 4.6,
        reviews: 22,
        brand: 'Thomas Scott',
        description: 'Premium corduroy smart trouser with mid-rise fit. Perfect for formal and semi-formal occasions.',
        stock: 50,
        sellerId: '1',
        category: 'Fashion',
        status: 'active',
        isNew: true,
        colors: [
            { name: 'Khaki', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100&h=100&fit=crop' },
            { name: 'Brown', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop' },
            { name: 'Navy', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
            { name: 'Charcoal', image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=100&h=100&fit=crop' }
        ],
        features: ['Mid-rise fit', 'Corduroy fabric', 'Smart casual', 'Machine washable'],
        specifications: {
            'Material': '100% Cotton Corduroy',
            'Fit': 'Mid-Rise',
            'Care': 'Machine Wash',
            'Origin': 'India'
        }
    },
    {
        id: '2',
        name: 'Premium Cotton Formal Shirt',
        price: 961,
        originalPrice: 1599,
        discount: 39,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        rating: 4.6,
        reviews: 89,
        brand: 'AD By Arvind',
        description: 'Premium formal shirt with comfortable fit and breathable cotton fabric',
        stock: 75,
        sellerId: '1',
        category: 'Fashion',
        status: 'active',
        colors: [
            { name: 'White', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
            { name: 'Light Blue', image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=100&h=100&fit=crop' },
            { name: 'Pink', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop' }
        ],
        features: ['Wrinkle-free', 'Breathable fabric', 'Regular fit', 'Easy care'],
        specifications: {
            'Material': '100% Cotton',
            'Fit': 'Regular',
            'Collar': 'Spread Collar',
            'Care': 'Machine Wash'
        }
    },
    {
        id: '3',
        name: 'Wireless Bluetooth Headphones',
        price: 2999,
        originalPrice: 4999,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'
        ],
        sizes: ['One Size'],
        rating: 4.8,
        reviews: 234,
        brand: 'AudioTech',
        description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life',
        stock: 45,
        sellerId: '2',
        category: 'Electronics',
        status: 'active',
        colors: [
            { name: 'Black', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
            { name: 'White', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=100&h=100&fit=crop' },
            { name: 'Silver', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop' }
        ],
        features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0', 'Quick charge'],
        specifications: {
            'Battery Life': '30 hours',
            'Connectivity': 'Bluetooth 5.0',
            'Weight': '250g',
            'Warranty': '1 year'
        }
    },
    {
        id: '4',
        name: 'Smart Fitness Watch',
        price: 8999,
        originalPrice: 12999,
        discount: 31,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop'
        ],
        sizes: ['38mm', '42mm', '44mm'],
        rating: 4.7,
        reviews: 156,
        brand: 'FitTech Pro',
        description: 'Advanced fitness tracking smartwatch with heart rate monitoring and GPS',
        stock: 0, // Out of stock for testing
        sellerId: '2',
        category: 'Electronics',
        status: 'active',
        colors: [
            { name: 'Space Gray', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
            { name: 'Silver', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop' },
            { name: 'Gold', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=100&h=100&fit=crop' }
        ],
        features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', '7-day battery'],
        specifications: {
            'Display': '1.4" AMOLED',
            'Battery': '7 days',
            'Water Resistance': '5ATM',
            'Sensors': 'Heart Rate, GPS, Accelerometer'
        }
    },
    {
        id: '5',
        name: 'Designer Sunglasses',
        price: 1599,
        originalPrice: 2999,
        discount: 47,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=600&fit=crop'
        ],
        sizes: ['One Size'],
        rating: 4.5,
        reviews: 67,
        brand: 'StyleVision',
        description: 'Premium designer sunglasses with UV400 protection and polarized lenses',
        stock: 2, // Low stock for testing
        sellerId: '3',
        category: 'Fashion',
        status: 'active',
        colors: [
            { name: 'Black', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop' },
            { name: 'Tortoise', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop' },
            { name: 'Gold', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=100&h=100&fit=crop' }
        ],
        features: ['UV400 Protection', 'Polarized Lenses', 'Lightweight Frame', 'Scratch Resistant'],
        specifications: {
            'Lens Material': 'Polycarbonate',
            'Frame Material': 'Acetate',
            'UV Protection': 'UV400',
            'Lens Type': 'Polarized'
        }
    },
    {
        id: '6',
        name: 'Luxury Skincare Set',
        price: 2499,
        originalPrice: 3999,
        discount: 38,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop'
        ],
        sizes: ['Full Size', 'Travel Size'],
        rating: 4.4,
        reviews: 189,
        brand: 'GlowLux',
        description: 'Complete luxury skincare routine with vitamin C serum, moisturizer, and cleanser',
        stock: 42,
        sellerId: '4',
        category: 'Beauty',
        status: 'active',
        features: ['Vitamin C Serum', 'Hyaluronic Acid', 'Anti-aging', 'Dermatologist Tested'],
        specifications: {
            'Skin Type': 'All Skin Types',
            'Key Ingredients': 'Vitamin C, Hyaluronic Acid',
            'Volume': '50ml each',
            'Shelf Life': '24 months'
        }
    },
    {
        id: '7',
        name: 'Casual Denim Jacket',
        price: 1899,
        originalPrice: 2999,
        discount: 37,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=800&fit=crop'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        rating: 4.3,
        reviews: 78,
        brand: 'UrbanStyle',
        description: 'Classic denim jacket with vintage wash and comfortable fit',
        stock: 35,
        sellerId: '1',
        category: 'Fashion',
        status: 'active',
        colors: [
            { name: 'Light Blue', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop' },
            { name: 'Dark Blue', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100&h=100&fit=crop' },
            { name: 'Black', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop' }
        ],
        features: ['100% Cotton Denim', 'Classic Fit', 'Multiple Pockets', 'Vintage Wash'],
        specifications: {
            'Material': '100% Cotton Denim',
            'Fit': 'Regular',
            'Wash': 'Vintage',
            'Care': 'Machine Wash Cold'
        }
    },
    {
        id: '8',
        name: 'Wireless Earbuds Pro',
        price: 4999,
        originalPrice: 7999,
        discount: 38,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1608156639585-b3a9d7ff8b8e?w=600&h=600&fit=crop'
        ],
        sizes: ['One Size'],
        rating: 4.6,
        reviews: 312,
        brand: 'SoundMax',
        description: 'Premium wireless earbuds with active noise cancellation and premium sound quality',
        stock: 58,
        sellerId: '2',
        category: 'Electronics',
        status: 'active',
        isNew: true,
        colors: [
            { name: 'White', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop' },
            { name: 'Black', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100&h=100&fit=crop' },
            { name: 'Space Gray', image: 'https://images.unsplash.com/photo-1608156639585-b3a9d7ff8b8e?w=100&h=100&fit=crop' }
        ],
        features: ['Active Noise Cancellation', 'Wireless Charging', '6-hour battery', 'Water Resistant'],
        specifications: {
            'Battery Life': '6 hours + 24 hours case',
            'Connectivity': 'Bluetooth 5.2',
            'Water Resistance': 'IPX4',
            'Charging': 'Wireless + USB-C'
        }
    }
];

export const mockReels: Reel[] = [
    {
        id: '1',
        title: 'Unboxing New Headphones',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=400&fit=crop',
        videoUrl: '/videos/reel1.mp4',
        creatorId: '1',
        creatorName: 'Alex Johnson',
        creatorUsername: 'alexjohnson',
        creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        views: 45000,
        likes: 3200,
        productId: '1',
        product: mockProducts[0],
        caption: 'Just got these amazing headphones! Sound quality is incredible 🎧 #tech #headphones',
        createdAt: '2024-01-15T10:30:00Z',
        duration: '1:24'
    },
    {
        id: '2',
        title: 'Morning Skincare Routine',
        thumbnail: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=400&fit=crop',
        videoUrl: '/videos/reel2.mp4',
        creatorId: '2',
        creatorName: 'Sarah Beauty',
        creatorUsername: 'sarahbeauty',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        views: 67000,
        likes: 5400,
        productId: '2',
        product: mockProducts[1],
        caption: 'My daily glow routine ✨ This skincare set changed my life! #skincare #beauty',
        createdAt: '2024-01-14T08:15:00Z',
        duration: '0:45'
    },
    {
        id: '3',
        title: 'Fitness Tracking with Smart Watch',
        thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop',
        videoUrl: '/videos/reel3.mp4',
        creatorId: '1',
        creatorName: 'Alex Johnson',
        creatorUsername: 'alexjohnson',
        creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        views: 32000,
        likes: 2100,
        productId: '3',
        product: mockProducts[2],
        caption: 'Crushing my fitness goals with this smartwatch! 💪 #fitness #tech',
        createdAt: '2024-01-13T16:45:00Z',
        duration: '2:15'
    }
];

export const mockLiveStreams: LiveStream[] = [
    {
        id: '1',
        title: 'Fashion Haul & Try-On Session',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
        creatorId: '2',
        creatorName: 'Sarah Beauty',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        viewers: 1250,
        isLive: true,
        scheduledAt: '2024-01-15T19:00:00Z',
        products: [mockProducts[0]]
    },
    {
        id: '2',
        title: 'Tech Gadgets Unboxing & Review',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
        creatorId: '1',
        creatorName: 'Alex Johnson',
        creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        viewers: 892,
        isLive: true,
        scheduledAt: '2024-01-15T20:30:00Z',
        products: [mockProducts[2], mockProducts[7]]
    },
    {
        id: '3',
        title: 'Skincare Routine & Beauty Tips',
        thumbnail: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
        creatorId: '3',
        creatorName: 'Arlene McCoy',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        viewers: 567,
        isLive: true,
        scheduledAt: '2024-01-15T21:00:00Z',
        products: [mockProducts[5]]
    },
    {
        id: '4',
        title: 'Fitness Gear & Workout Session',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
        creatorId: '4',
        creatorName: 'Jerome Bell',
        creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        viewers: 0,
        isLive: false,
        scheduledAt: '2024-01-16T18:00:00Z',
        products: [mockProducts[3]]
    },
    {
        id: '5',
        title: 'Men\'s Fashion & Style Guide',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
        creatorId: '5',
        creatorName: 'Ralph Edwards',
        creatorAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=50&h=50&fit=crop&crop=face',
        viewers: 0,
        isLive: false,
        scheduledAt: '2024-01-16T19:30:00Z',
        products: [mockProducts[0], mockProducts[6]]
    },
    {
        id: '6',
        title: 'Home Decor & Lifestyle',
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
        creatorId: '6',
        creatorName: 'Savannah',
        creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        viewers: 0,
        isLive: false,
        scheduledAt: '2024-01-17T16:00:00Z',
        products: []
    }
];

export const mockContracts: Contract[] = [
    {
        id: '1',
        creatorId: '1',
        creatorName: 'Alex Johnson',
        sellerId: '1',
        sellerName: 'TechStore',
        productId: '1',
        productName: 'Wireless Headphones',
        commission: 15,
        status: 'active',
        createdAt: '2024-01-10T10:00:00Z'
    },
    {
        id: '2',
        creatorId: '2',
        creatorName: 'Sarah Beauty',
        sellerId: '2',
        sellerName: 'BeautyBrand',
        productId: '2',
        productName: 'Skincare Set',
        commission: 20,
        status: 'active',
        createdAt: '2024-01-08T14:30:00Z'
    }
];

export interface Creator {
    id: string;
    name: string;
    avatar: string;
    isLive?: boolean;
    followers?: number;
    category?: string;
}

export const mockCreators: Creator[] = [
    {
        id: '1',
        name: 'Cody Fisher',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isLive: true,
        followers: 125000,
        category: 'Tech'
    },
    {
        id: '2',
        name: 'Robertson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        followers: 89000,
        category: 'Fashion'
    },
    {
        id: '3',
        name: 'Arlene McCoy',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isLive: true,
        followers: 156000,
        category: 'Beauty'
    },
    {
        id: '4',
        name: 'Jerome Bell',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        followers: 67000,
        category: 'Lifestyle'
    },
    {
        id: '5',
        name: 'Ralph Edwards',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
        followers: 234000,
        category: 'Fitness'
    },
    {
        id: '6',
        name: 'Savannah',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        followers: 178000,
        category: 'Travel'
    },
    {
        id: '7',
        name: 'Jacob Jones',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        followers: 92000,
        category: 'Food'
    },
    {
        id: '8',
        name: 'Bessie Cooper',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        isLive: true,
        followers: 145000,
        category: 'Fashion'
    },
    {
        id: '9',
        name: 'Theresa Webb',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        followers: 203000,
        category: 'Beauty'
    },
    {
        id: '10',
        name: 'Jenny Wilson',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        followers: 87000,
        category: 'Lifestyle'
    }
];
