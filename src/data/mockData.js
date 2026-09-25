// Sweet Haven - Smart Confectionery Management System
// Comprehensive Mock Data for Development & Demonstration

export const CATEGORIES = [
  {
    id: 1,
    name: 'Cakes',
    slug: 'cakes',
    description: 'Handcrafted royal artisan cakes made with rich Belgian chocolate & fresh cream',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    itemCount: 14
  },
  {
    id: 2,
    name: 'Chocolates',
    slug: 'chocolates',
    description: 'Luxury handcrafted cocoa truffles & dark chocolate gift blocks',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',
    itemCount: 10
  },
  {
    id: 3,
    name: 'Cupcakes',
    slug: 'cupcakes',
    description: 'Fluffy gourmet cupcakes topped with velvet buttercream frosting',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80',
    itemCount: 12
  },
  {
    id: 4,
    name: 'Brownies',
    slug: 'brownies',
    description: 'Decadent fudge brownies loaded with roasted walnuts & dark chocolate',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    itemCount: 8
  },
  {
    id: 5,
    name: 'Cookies',
    slug: 'cookies',
    description: 'Freshly baked melt-in-the-mouth butter & choc-chip cookies',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
    itemCount: 9
  },
  {
    id: 6,
    name: 'Pastries',
    slug: 'pastries',
    description: 'Layered French pastries & delicate fresh fruit tarts',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    itemCount: 11
  },
  {
    id: 7,
    name: 'Donuts',
    slug: 'donuts',
    description: 'Glazed & chocolate filled artisan donuts with sprinkles',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80',
    itemCount: 8
  },
  {
    id: 8,
    name: 'Gift Boxes',
    slug: 'gift-boxes',
    description: 'Curated royal confectionery assortments in velvet gold hampers',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
    itemCount: 6
  }
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Belgian Dark Truffle Cake',
    category: 'Cakes',
    categoryId: 1,
    description: 'Signature 70% dark Belgian chocolate ganache layered with moist cocoa sponge cake and topped with handmade cocoa truffles.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80',
    price: 899,
    discount: 10,
    stockQuantity: 25,
    weightSize: '1 Kg',
    ingredients: 'Belgian Dark Chocolate, Dutch Cocoa Powder, Pure Butter, Wheat Flour, Eggs, Organic Sugar, Madagascar Vanilla',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: 2,
    name: 'Royal Red Velvet Cake',
    category: 'Cakes',
    categoryId: 1,
    description: 'Authentic crimson red velvet cake crafted with smooth cream cheese frosting, cocoa nuances, and gold edible flake garnishes.',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=700&q=80',
    price: 799,
    discount: 5,
    stockQuantity: 18,
    weightSize: '1 Kg',
    ingredients: 'Dutch Cocoa, Fresh Cream Cheese, Pure Vanilla Extract, Buttermilk, Wheat Flour, Beetroot Extract',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 4.8,
    reviewsCount: 98
  },
  {
    id: 3,
    name: 'Classic Black Forest Cake',
    category: 'Cakes',
    categoryId: 1,
    description: 'Traditional German layered chocolate sponge cake filled with dark sour cherries, kirsch whipped cream, and chocolate shavings.',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=700&q=80',
    price: 699,
    discount: 0,
    stockQuantity: 30,
    weightSize: '1 Kg',
    ingredients: 'Dark Cherries, Whipped Cream, Chocolate Shavings, Cocoa Sponge, Vanilla, Cane Sugar',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.7,
    reviewsCount: 86
  },
  {
    id: 4,
    name: 'Fresh Strawberry Cream Cake',
    category: 'Cakes',
    categoryId: 1,
    description: 'Light vanilla sponge cake layered with fresh garden strawberries and delicate sweet vanilla whipped cream.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700&q=80',
    price: 749,
    discount: 15,
    stockQuantity: 12,
    weightSize: '1 Kg',
    ingredients: 'Fresh Strawberries, Strawberry Puree, Fresh Dairy Cream, Vanilla Sponge, Organic Sugar',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 64
  },
  {
    id: 5,
    name: 'Salted Caramel Walnut Fudge Brownie',
    category: 'Brownies',
    categoryId: 4,
    description: 'Gooey dark chocolate brownies infused with sea salt caramel drizzle and toasted California walnut chunks.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&q=80',
    price: 399,
    discount: 0,
    stockQuantity: 40,
    weightSize: '6 Pieces (350g)',
    ingredients: '70% Dark Chocolate, Salted Caramel Drizzle, California Walnuts, Butter, Wheat Flour, Cocoa',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 112
  },
  {
    id: 6,
    name: 'Luxury Hazelnut Praline Truffles Box',
    category: 'Chocolates',
    categoryId: 2,
    description: 'Exquisite box of 16 handcrafted cocoa truffles filled with roasted Italian hazelnuts and smooth milk chocolate ganache.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&q=80',
    price: 549,
    discount: 10,
    stockQuantity: 50,
    weightSize: '300g Box',
    ingredients: 'Roasted Piedmont Hazelnuts, Cocoa Butter, Whole Milk Solids, Pure Cane Sugar, Vanilla',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 156
  },
  {
    id: 7,
    name: 'Assorted Gourmet Cupcake Box',
    category: 'Cupcakes',
    categoryId: 3,
    description: 'Box of 6 signature cupcakes: 2 Red Velvet, 2 Dark Chocolate Truffle, and 2 Vanilla Salted Caramel Buttercream.',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=700&q=80',
    price: 449,
    discount: 10,
    stockQuantity: 35,
    weightSize: '6 Pack',
    ingredients: 'Buttercream Frosting, Belgian Cocoa, Madagascar Vanilla Bean, Wheat Flour, Fresh Eggs',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: false,
    rating: 4.7,
    reviewsCount: 79
  },
  {
    id: 8,
    name: 'Choco Chunk Butter Cookies',
    category: 'Cookies',
    categoryId: 5,
    description: 'Golden baked French butter cookies generously studded with premium dark chocolate chunks and sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&q=80',
    price: 299,
    discount: 5,
    stockQuantity: 60,
    weightSize: '400g Tiffin',
    ingredients: 'Pure French Butter, Dark Choco Chunks, Brown Sugar, Wheat Flour, Sea Salt',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: true,
    rating: 4.6,
    reviewsCount: 94
  },
  {
    id: 9,
    name: 'Royal Celebration Hamper Box',
    category: 'Gift Boxes',
    categoryId: 8,
    description: 'Velvet gold gift hamper featuring Belgian Dark Truffle Cake, Assorted Pralines Box, Macarons, and Choco Chunk Cookies.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=80',
    price: 1499,
    discount: 20,
    stockQuantity: 15,
    weightSize: '1.5 Kg Hamper',
    ingredients: 'Assorted Premium Bakery & Confectionery Specialties',
    isAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 47
  },
  {
    id: 10,
    name: 'Glazed Chocolate Glaze Donut Pack',
    category: 'Donuts',
    categoryId: 7,
    description: 'Fluffy yeast-risen donuts dipped in glossy dark chocolate glaze and finished with colorful sprinkles.',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=700&q=80',
    price: 349,
    discount: 0,
    stockQuantity: 20,
    weightSize: '4 Pack',
    ingredients: 'Yeast Dough, Cocoa Glaze, Sugar Sprinkles, Vanilla Extract, Dairy Milk',
    isAvailable: true,
    isFeatured: false,
    isBestSeller: false,
    rating: 4.5,
    reviewsCount: 38
  }
];

export const OFFERS = [
  {
    id: 1,
    code: 'ROYAL15',
    title: 'Royal Celebration Discount',
    description: 'Get 15% OFF on orders above ₹799. Valid on all Cakes & Gift Boxes.',
    discountText: '15% OFF',
    minOrder: 799,
    bgGradient: 'linear-gradient(135deg, #5C1329 0%, #2A1710 100%)',
    badge: 'Limited Time'
  },
  {
    code: 'WELCOME100',
    id: 2,
    title: 'First Sweet Order',
    description: 'Flat ₹100 Instant Off on your very first order at Sweet Haven bakery.',
    discountText: '₹100 OFF',
    minOrder: 499,
    bgGradient: 'linear-gradient(135deg, #2A1710 0%, #D4AF37 100%)',
    badge: 'New Customer'
  },
  {
    code: 'CHOCOLOVE',
    id: 3,
    title: 'Chocolate Lovers Combo',
    description: 'Buy Belgian Truffle Cake & get 20% OFF on Hazelnut Pralines Box.',
    discountText: '20% OFF Combo',
    minOrder: 999,
    bgGradient: 'linear-gradient(135deg, #801C3A 0%, #5C1329 100%)',
    badge: 'Special Combo'
  }
];

export const SAMPLE_LOYALTY_PROFILE = {
  customerName: 'Priyanga M.',
  loyaltyId: 'SH-ROYAL-9842-2026',
  currentPoints: 480,
  currentTier: 'Silver',
  nextTier: 'Gold',
  pointsToNextTier: 520,
  tierProgressPercent: 48,
  totalEarned: 750,
  totalRedeemed: 270,
  availableRewards: [
    { id: 1, title: 'Free 250g Pralines Box', pointsRequired: 300, isUnlocked: true },
    { id: 2, title: '₹200 Discount Voucher', pointsRequired: 500, isUnlocked: false },
    { id: 3, title: 'Royal Custom Cake Upgrade', pointsRequired: 800, isUnlocked: false }
  ]
};

export const TRACKING_STAGES = [
  { stage: 1, title: 'Order Placed', time: '10:30 AM', icon: 'FileText', desc: 'Order received and registered by Sweet Haven.' },
  { stage: 2, title: 'Order Confirmed', time: '10:32 AM', icon: 'CheckCircle', desc: 'Payment verified & kitchen team notified.' },
  { stage: 3, title: 'Preparing Ingredients', time: '10:40 AM', icon: 'ChefHat', desc: 'Fresh Belgian cocoa & ingredients weighed.' },
  { stage: 4, title: 'Baking in Oven', time: '11:05 AM', icon: 'Flame', desc: 'Fresh cake layers baking at optimal temperature.' },
  { stage: 5, title: 'Quality Check & Frosting', time: '11:35 AM', icon: 'Sparkles', desc: 'Chef icing red velvet cream & quality approval.' },
  { stage: 6, title: 'Packed in Gold Box', time: '11:50 AM', icon: 'Box', desc: 'Hygienically packaged with temperature control.' },
  { stage: 7, title: 'Out for Delivery', time: '12:10 PM', icon: 'Truck', desc: 'Delivery partner assigned and en route to address.' },
  { stage: 8, title: 'Delivered', time: '12:30 PM (Est.)', icon: 'Gift', desc: 'Enjoy your fresh Sweet Haven confectionery!' }
];
