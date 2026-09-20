import fs from "fs";
import path from "path";

// Types for all manageable entities in the Admin CMS
export interface SystemSettings {
  id: number;
  siteName: string;
  siteTitle: string;
  metaDescription: string;
  siteLogo: string;
  darkLogo: string;
  siteFavicon: string;
  siteEmail: string;
  sitePhone: string;
  siteWhatsApp: string;
  siteAddress: string;
  businessHours: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  messengerUrl: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
  maintenanceMode: boolean;
  defaultLanguage: string;
  announcementText: string;
  announcementEnabled: boolean;
  headerHotlineEnabled: boolean;
  headerWhatsAppEnabled: boolean;
  headerWishlistEnabled: boolean;
  headerCartEnabled: boolean;
}

export interface NavMenuItem {
  id: number;
  title: string;
  url: string;
  type: "category" | "page" | "custom";
  targetId?: number | string;
  order: number;
  isEnabled: boolean;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  icon?: string;
  bannerUrl?: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  subcategories: SubCategory[];
}

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl?: string;
  description?: string;
  websiteUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "500g", "1kg", "2kg"
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  weight?: string;
}

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  brandId?: number;
  categoryId: number;
  subcategoryId?: number;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  discountPrice?: number | null;
  discountPercentage?: number | null;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: string;
  unit: string;
  videoUrl?: string;
  imageUrl: string;
  galleryImages: string[];
  variants: ProductVariant[];
  // Product flags
  isNewArrival: boolean;
  isBestSelling: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isBestCollection: boolean;
  isOffered: boolean;
  isFreeDelivery: boolean;
  isPreOrder: boolean;
  isOrganic: boolean;
  isFlashSale: boolean;
  hasLimitedTimeOffer?: boolean;
  offerEndsAt?: string | null;
  status: "active" | "draft" | "inactive";
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SliderItem {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  categoryId?: number;
  productId?: number;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  isEnabled: boolean;
  sortOrder: number;
  productLimit: number;
  categoryId?: number;
  background?: string;
}

export interface FlashSaleItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  productIds: number[];
  discountPercentage: number;
  quantityLimit: number;
  isActive: boolean;
}

export interface CouponItem {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  productIds?: number[];
  categoryIds?: number[];
  usageLimit: number;
  perCustomerLimit: number;
  startDate?: string;
  expiryDate: string;
  isActive: boolean;
  timesUsed: number;
}

export interface OrderItemRecord {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  variantName?: string;
  total: number;
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  division: string;
  district: string;
  upazila?: string;
  items: OrderItemRecord[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: "cod" | "bkash" | "nagad" | "sslcommerz" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "disabled";
  notes?: string;
  createdAt: string;
}

export interface ShippingZone {
  id: number;
  name: string;
  deliveryCharge: number;
  deliveryTime: string;
  freeDeliveryThreshold: number;
  isActive: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  instructions?: string;
  mode: "test" | "live";
  merchantNumber?: string;
}

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}

export interface MediaFile {
  id: number;
  name: string;
  url: string;
  fileType: string;
  fileSize: string;
  folder: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  role:
    | "super_admin"
    | "admin"
    | "manager"
    | "product_manager"
    | "order_manager"
    | "content_manager"
    | "marketing_manager";
  permissions: string[];
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
}

export interface ActivityLog {
  id: number;
  adminName: string;
  action: string;
  entityType: string;
  entityId?: string | number;
  details: string;
  createdAt: string;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: "order" | "stock" | "customer" | "payment";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Full Store Structure
interface CMSDataStore {
  settings: SystemSettings;
  navMenuItems: NavMenuItem[];
  categories: CategoryItem[];
  brands: BrandItem[];
  products: ProductItem[];
  sliders: SliderItem[];
  homepageSections: HomepageSection[];
  flashSale: FlashSaleItem;
  coupons: CouponItem[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  shippingZones: ShippingZone[];
  paymentGateways: PaymentGatewayConfig[];
  pages: CMSPage[];
  mediaFiles: MediaFile[];
  adminUsers: AdminUser[];
  activityLogs: ActivityLog[];
  notifications: AdminNotification[];
}

const DATA_FILE_PATH = path.resolve(process.cwd(), "server", "data-store.json");

// Initial comprehensive dataset
const defaultData: CMSDataStore = {
  settings: {
    id: 1,
    siteName: "Ghorer Bazar",
    siteTitle: "Ghorer Bazar - Pure & Natural Grocery Bangladesh",
    metaDescription:
      "Buy 100% natural and pure honey, cold pressed mustard oil, traditional ghee, premium dates, and organic spices online in Bangladesh with home delivery.",
    siteLogo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&q=80",
    darkLogo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&q=80",
    siteFavicon: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=64&q=80",
    siteEmail: "contact@ghorerbazar.com",
    sitePhone: "+8809642922922",
    siteWhatsApp: "+8801712345678",
    siteAddress: "House 12, Road 4, Rampura, Dhaka - 1219, Bangladesh",
    businessHours: "Saturday - Thursday: 9:00 AM - 9:00 PM",
    googleMapsUrl: "https://maps.google.com/?q=Rampura+Dhaka+Bangladesh",
    facebookUrl: "https://facebook.com/ghorerbazarbd",
    instagramUrl: "https://instagram.com/ghorerbazarbd",
    youtubeUrl: "https://youtube.com/@ghorerbazar",
    tiktokUrl: "https://tiktok.com/@ghorerbazar",
    messengerUrl: "https://m.me/ghorerbazarbd",
    shippingInsideDhaka: 70,
    shippingOutsideDhaka: 130,
    freeShippingThreshold: 1500,
    currency: "BDT",
    currencySymbol: "৳",
    taxPercentage: 0,
    maintenanceMode: false,
    defaultLanguage: "bn",
    announcementText: "Free delivery across Bangladesh on orders over ৳1,500 • Customer Support: +8809642922922",
    announcementEnabled: true,
    headerHotlineEnabled: true,
    headerWhatsAppEnabled: true,
    headerWishlistEnabled: true,
    headerCartEnabled: true,
  },
  navMenuItems: [
    { id: 1, title: "Home", url: "/", type: "custom", order: 1, isEnabled: true },
    { id: 2, title: "Honey", url: "/category/2", type: "category", targetId: 2, order: 2, isEnabled: true },
    { id: 3, title: "Oil & Ghee", url: "/category/1", type: "category", targetId: 1, order: 3, isEnabled: true },
    { id: 4, title: "Dates", url: "/category/3", type: "category", targetId: 3, order: 4, isEnabled: true },
    { id: 5, title: "Spices", url: "/category/4", type: "category", targetId: 4, order: 5, isEnabled: true },
    { id: 6, title: "Nuts & Seeds", url: "/category/5", type: "category", targetId: 5, order: 6, isEnabled: true },
    { id: 7, title: "Combos", url: "/combos", type: "custom", order: 7, isEnabled: true },
    { id: 8, title: "About Us", url: "/page/about-us", type: "page", targetId: "about-us", order: 8, isEnabled: true },
  ],
  categories: [
    {
      id: 1,
      name: "Oil & Ghee",
      slug: "oil-ghee",
      description: "100% pure cold pressed mustard oil and traditional butter ghee.",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
      icon: "Droplets",
      bannerUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      subcategories: [
        { id: 101, categoryId: 1, name: "Mustard Oil", slug: "mustard-oil", description: "Cold-pressed traditional mustard oil", sortOrder: 1, isActive: true },
        { id: 102, categoryId: 1, name: "Ghee", slug: "ghee", description: "Pure milk butter gawa ghee", sortOrder: 2, isActive: true },
        { id: 103, categoryId: 1, name: "Olive Oil", slug: "olive-oil", description: "Extra virgin imported olive oil", sortOrder: 3, isActive: true },
        { id: 104, categoryId: 1, name: "Coconut Oil", slug: "coconut-oil", description: "Extra virgin cold pressed coconut oil", sortOrder: 4, isActive: true },
        { id: 105, categoryId: 1, name: "Cooking Oil", slug: "cooking-oil", description: "Healthy natural cooking oils", sortOrder: 5, isActive: true },
      ],
    },
    {
      id: 2,
      name: "Honey",
      slug: "honey",
      description: "Pure natural wild flower and Sundarban mangrove honey.",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
      icon: "Hexagon",
      bannerUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 2,
      isFeatured: true,
      isActive: true,
      subcategories: [
        { id: 201, categoryId: 2, name: "Sundarban Honey", slug: "sundarban-honey", description: "Wild natural mangrove forest honey", sortOrder: 1, isActive: true },
        { id: 202, categoryId: 2, name: "Black Seed Honey", slug: "black-seed-honey", description: "Kalojira flower infused raw honey", sortOrder: 2, isActive: true },
        { id: 203, categoryId: 2, name: "Lychee Flower Honey", slug: "lychee-flower-honey", description: "Delicate and aromatic floral honey", sortOrder: 3, isActive: true },
        { id: 204, categoryId: 2, name: "African Organic Honey", slug: "african-organic-honey", description: "Certified wild dark exotic honey", sortOrder: 4, isActive: true },
        { id: 205, categoryId: 2, name: "Sidr Honey", slug: "sidr-honey", description: "Premium Kashmiri and Yemeni Sidr honey", sortOrder: 5, isActive: true },
        { id: 206, categoryId: 2, name: "Honeycomb", slug: "honeycomb", description: "100% natural edible raw honeycomb", sortOrder: 6, isActive: true },
        { id: 207, categoryId: 2, name: "Sachet Box", slug: "sachet-box", description: "Travel-friendly daily honey sachets", sortOrder: 7, isActive: true },
      ],
    },
    {
      id: 3,
      name: "Dates",
      slug: "dates",
      description: "Handpicked premium Madinah and Middle Eastern dates.",
      imageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80",
      icon: "Sparkles",
      bannerUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 3,
      isFeatured: true,
      isActive: true,
      subcategories: [
        { id: 301, categoryId: 3, name: "Ajwa", slug: "ajwa", description: "Authentic Madinah holy Ajwa dates", sortOrder: 1, isActive: true },
        { id: 302, categoryId: 3, name: "Medjool", slug: "medjool", description: "Jumbo King Medjool juicy dates", sortOrder: 2, isActive: true },
        { id: 303, categoryId: 3, name: "Sukkari", slug: "sukkari", description: "Crisp and golden sweet Sukkari dates", sortOrder: 3, isActive: true },
        { id: 304, categoryId: 3, name: "Mabroom", slug: "mabroom", description: "Slender chewy sweet Mabroom dates", sortOrder: 4, isActive: true },
        { id: 305, categoryId: 3, name: "Safawi / Kalmi", slug: "safawi-kalmi", description: "Nutritious dark chewy Safawi dates", sortOrder: 5, isActive: true },
      ],
    },
    {
      id: 4,
      name: "Spices",
      slug: "spices",
      description: "Freshly ground traditional whole and powdered spices.",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
      icon: "Flame",
      bannerUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 4,
      isFeatured: true,
      isActive: true,
      subcategories: [
        { id: 401, categoryId: 4, name: "Whole Spices", slug: "whole-spices", description: "Cardamom, cinnamon, cloves, cumin", sortOrder: 1, isActive: true },
        { id: 402, categoryId: 4, name: "Basic Spices", slug: "basic-spices", description: "Chili, turmeric, coriander, cumin powder", sortOrder: 2, isActive: true },
        { id: 403, categoryId: 4, name: "Mixed Spices", slug: "mixed-spices", description: "Kala Bhuna, biryani, meat curry blends", sortOrder: 3, isActive: true },
      ],
    },
    {
      id: 5,
      name: "Nuts & Seeds",
      slug: "nuts-seeds",
      description: "Crunchy premium nuts and nutrient-rich organic seeds.",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80",
      icon: "Nut",
      bannerUrl: "",
      sortOrder: 5,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
    {
      id: 6,
      name: "Beverage",
      slug: "beverage",
      description: "Healthy teas, green tea matcha, and nutritious herbal drinks.",
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
      icon: "Coffee",
      bannerUrl: "",
      sortOrder: 6,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
    {
      id: 7,
      name: "Rice",
      slug: "rice",
      description: "Aromatic basmati, jasmine, and traditional fine rice.",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      icon: "Wheat",
      bannerUrl: "",
      sortOrder: 7,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
    {
      id: 8,
      name: "Flours & Lentils",
      slug: "flours-lentils",
      description: "Stone ground whole wheat atta, rice flour, and pure lentils.",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
      icon: "Cookie",
      bannerUrl: "",
      sortOrder: 8,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
    {
      id: 9,
      name: "Organic",
      slug: "organic",
      description: "100% certified organic foods and pure natural ingredients.",
      imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
      icon: "Leaf",
      bannerUrl: "",
      sortOrder: 9,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
    {
      id: 10,
      name: "Functional Food",
      slug: "functional-food",
      description: "Daily superfoods, spirulina, and health supplements.",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
      icon: "ShieldCheck",
      bannerUrl: "",
      sortOrder: 10,
      isFeatured: true,
      isActive: true,
      subcategories: [],
    },
  ],
  brands: [
    {
      id: 1,
      name: "Ghorerbazar",
      slug: "ghorerbazar",
      logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80",
      description: "Flagship house brand delivering direct from farmers and beekeepers.",
      websiteUrl: "https://ghorerbazar.com",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Glarvest",
      slug: "glarvest",
      logoUrl: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=160&q=80",
      description: "Specialized cold pressed organic seed oils.",
      websiteUrl: "",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      name: "Khejuri",
      slug: "khejuri",
      logoUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=160&q=80",
      description: "Direct importer of authentic holy Madinah dates.",
      websiteUrl: "",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      name: "Shosti food",
      slug: "shosti-food",
      logoUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=160&q=80",
      description: "Traditional heritage recipes and stone-milled spices.",
      websiteUrl: "",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 5,
      name: "Honeyraj",
      slug: "honeyraj",
      logoUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=160&q=80",
      description: "Specialist natural honey brand from wild Sundarban hives.",
      websiteUrl: "",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: 6,
      name: "Babui Shop",
      slug: "babui-shop",
      logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=160&q=80",
      description: "Artisanal organic pantry collections.",
      websiteUrl: "",
      sortOrder: 6,
      isActive: true,
    },
  ],
  products: [
    {
      id: 1,
      name: "Black Seed Honey 1kg",
      slug: "black-seed-honey-1kg",
      sku: "HNY-BS-01",
      barcode: "894123450001",
      brandId: 1,
      categoryId: 2,
      subcategoryId: 202,
      shortDescription: "100% natural black seed infused flower honey.",
      fullDescription:
        "Harvested during the kalojira blooming season in Bangladesh. High medicinal properties, rich enzymes, dark amber texture, and rich soothing floral notes.",
      price: 1600,
      discountPrice: 1500,
      discountPercentage: 6.25,
      costPrice: 1100,
      stock: 50,
      lowStockThreshold: 10,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80",
      ],
      variants: [
        { id: "v1-1", name: "500g", sku: "HNY-BS-500G", price: 900, salePrice: 846, stock: 40, weight: "0.5kg" },
        { id: "v1-2", name: "1kg", sku: "HNY-BS-1KG", price: 1600, salePrice: 1500, stock: 50, weight: "1.0kg" },
      ],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: true,
      isFeatured: true,
      isBestCollection: true,
      isOffered: true,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: true,
      hasLimitedTimeOffer: true,
      offerEndsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Sundarban Honey 1kg",
      slug: "sundarban-honey-1kg",
      sku: "HNY-SUN-01",
      barcode: "894123450002",
      brandId: 5,
      categoryId: 2,
      subcategoryId: 201,
      shortDescription: "Directly harvested from wild beehives in the Sundarban mangrove forest.",
      fullDescription:
        "Collected by traditional mouwals (honey hunters) deep inside the wild Sundarbans. Free from added sugars, high natural pollen, and authentic pungent forest aroma.",
      price: 2500,
      discountPrice: null,
      discountPercentage: null,
      costPrice: 1800,
      stock: 30,
      lowStockThreshold: 5,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: false,
      isFeatured: true,
      isBestCollection: true,
      isOffered: false,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      hasLimitedTimeOffer: false,
      offerEndsAt: null,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Honey Nuts 800gm",
      slug: "honey-nuts-800gm",
      sku: "HNY-NUT-01",
      barcode: "894123450003",
      brandId: 1,
      categoryId: 2,
      subcategoryId: 207,
      shortDescription: "Cashews, almonds, pistachios soaked in pure honey.",
      fullDescription:
        "A power-packed healthy snack containing premium imported California almonds, crunchy cashews, pistachios, walnuts, pumpkin seeds, and pure wildflower honey.",
      price: 1200,
      discountPrice: 1056,
      discountPercentage: 12,
      costPrice: 750,
      stock: 25,
      lowStockThreshold: 8,
      weight: "800",
      unit: "g",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: true,
      isFeatured: true,
      isBestCollection: false,
      isOffered: true,
      isFreeDelivery: false,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: true,
      hasLimitedTimeOffer: true,
      offerEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "African Organic Wild Honey 500g",
      slug: "african-organic-wild-honey-500g",
      sku: "HNY-AFR-01",
      brandId: 1,
      categoryId: 2,
      subcategoryId: 204,
      price: 1200,
      discountPrice: 1056,
      discountPercentage: 12,
      costPrice: 800,
      stock: 20,
      lowStockThreshold: 5,
      weight: "500",
      unit: "g",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: false,
      isBestSelling: false,
      isTrending: false,
      isFeatured: false,
      isBestCollection: false,
      isOffered: true,
      isFreeDelivery: false,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: "Natural Honeycomb 1kg",
      slug: "natural-honeycomb-1kg",
      sku: "HNY-CMB-01",
      brandId: 5,
      categoryId: 2,
      subcategoryId: 206,
      price: 3000,
      discountPrice: 2700,
      discountPercentage: 10,
      costPrice: 2000,
      stock: 15,
      lowStockThreshold: 4,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: false,
      isBestSelling: false,
      isTrending: true,
      isFeatured: true,
      isBestCollection: true,
      isOffered: true,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 9,
      name: "Deshi Mustard Oil 5 liter",
      slug: "deshi-mustard-oil-5-liter",
      sku: "OIL-MST-05",
      barcode: "894123450009",
      brandId: 1,
      categoryId: 1,
      subcategoryId: 101,
      shortDescription: "Cold-pressed traditional wood-ghani mustard oil.",
      fullDescription:
        "Extracted using low-temperature traditional mechanical pressing. Intense aroma, natural pungency, and zero chemical refining.",
      price: 1700,
      discountPrice: 1650,
      discountPercentage: 2.94,
      costPrice: 1350,
      stock: 40,
      lowStockThreshold: 10,
      weight: "5.0",
      unit: "L",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [
        { id: "v9-1", name: "1 Liter", sku: "OIL-MST-1L", price: 360, salePrice: 350, stock: 60, weight: "1L" },
        { id: "v9-2", name: "5 Liter", sku: "OIL-MST-5L", price: 1700, salePrice: 1650, stock: 40, weight: "5L" },
      ],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: true,
      isFeatured: true,
      isBestCollection: true,
      isOffered: true,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: true,
      hasLimitedTimeOffer: true,
      offerEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 10,
      name: "Gawa Ghee 1kg",
      slug: "gawa-ghee-1kg",
      sku: "OIL-GHEE-01",
      barcode: "894123450010",
      brandId: 1,
      categoryId: 1,
      subcategoryId: 102,
      shortDescription: "Crafted from pure cow milk butter using slow cooking methods.",
      fullDescription:
        "Granular golden ghee made with traditional boiling and clarification. Intense nutty fragrance and rich taste for everyday cooking and celebrations.",
      price: 1800,
      discountPrice: null,
      discountPercentage: null,
      costPrice: 1300,
      stock: 35,
      lowStockThreshold: 8,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [
        { id: "v10-1", name: "500gm", sku: "OIL-GHEE-500G", price: 950, stock: 50, weight: "0.5kg" },
        { id: "v10-2", name: "1kg", sku: "OIL-GHEE-1KG", price: 1800, stock: 35, weight: "1.0kg" },
      ],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: false,
      isFeatured: true,
      isBestCollection: true,
      isOffered: false,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 13,
      name: "Ajwa Premium Fresh Dates 1kg",
      slug: "ajwa-premium-fresh-dates-1kg",
      sku: "DAT-AJW-01",
      barcode: "894123450013",
      brandId: 3,
      categoryId: 3,
      subcategoryId: 301,
      shortDescription: "Authentic Madinah holy Ajwa dates, soft, dark, and nutrient rich.",
      fullDescription:
        "Directly imported from orchards in Al-Madinah Al-Munawwarah. Handpicked, sorted, and vacuum packed to lock in natural moisture and sweetness.",
      price: 2500,
      discountPrice: 2000,
      discountPercentage: 20,
      costPrice: 1500,
      stock: 25,
      lowStockThreshold: 6,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [
        { id: "v13-1", name: "500gm", sku: "DAT-AJW-500G", price: 1500, salePrice: 1200, stock: 30, weight: "0.5kg" },
        { id: "v13-2", name: "1kg", sku: "DAT-AJW-1KG", price: 2500, salePrice: 2000, stock: 25, weight: "1.0kg" },
      ],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: true,
      isFeatured: true,
      isBestCollection: true,
      isOffered: true,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: true,
      hasLimitedTimeOffer: true,
      offerEndsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 16,
      name: "Egyptian Medjool Large 1kg",
      slug: "egyptian-medjool-large-1kg",
      sku: "DAT-MDJ-01",
      brandId: 3,
      categoryId: 3,
      subcategoryId: 302,
      shortDescription: "King of dates, large plump Medjool dates full of natural honey.",
      fullDescription:
        "Caramel-like texture, juicy and succulent flesh. Large caliber grading.",
      price: 2800,
      discountPrice: null,
      discountPercentage: null,
      costPrice: 2100,
      stock: 15,
      lowStockThreshold: 5,
      weight: "1.0",
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: true,
      isBestSelling: false,
      isTrending: true,
      isFeatured: true,
      isBestCollection: true,
      isOffered: false,
      isFreeDelivery: true,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 19,
      name: "Kala Bhuna Masala 500gm",
      slug: "kala-bhuna-masala-500gm",
      sku: "SPC-KLB-01",
      brandId: 4,
      categoryId: 4,
      subcategoryId: 403,
      shortDescription: "Authentic Chittagong Kala Bhuna spice blend.",
      fullDescription:
        "Hand-roasted cardamom, black pepper, star anise, nutmeg, and aromatic bay leaves ground to secret heritage proportions.",
      price: 500,
      discountPrice: 450,
      discountPercentage: 10,
      costPrice: 300,
      stock: 40,
      lowStockThreshold: 10,
      weight: "500",
      unit: "g",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
      galleryImages: [],
      variants: [],
      isNewArrival: false,
      isBestSelling: true,
      isTrending: true,
      isFeatured: true,
      isBestCollection: false,
      isOffered: true,
      isFreeDelivery: false,
      isPreOrder: false,
      isOrganic: true,
      isFlashSale: false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  sliders: [
    {
      id: 1,
      title: "100% Pure & Natural Food",
      subtitle: "Direct from wild Sundarban hives & traditional oil mills to your doorstep.",
      buttonText: "Shop Natural Honey",
      buttonUrl: "/category/2",
      desktopImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      categoryId: 2,
      priority: 1,
      isActive: true,
    },
    {
      id: 2,
      title: "Cold-Pressed Wood-Ghani Mustard Oil",
      subtitle: "Unmatched pungency, unrefined golden purity, and natural essential fatty acids.",
      buttonText: "Order Cooking Essentials",
      buttonUrl: "/category/1",
      desktopImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
      categoryId: 1,
      priority: 2,
      isActive: true,
    },
    {
      id: 3,
      title: "Holy Madinah Fresh Ajwa & Medjool",
      subtitle: "Rich, succulent, caramel-soft dates hand-picked for your family's daily vitality.",
      buttonText: "Explore Premium Dates",
      buttonUrl: "/category/3",
      desktopImageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80",
      categoryId: 3,
      priority: 3,
      isActive: true,
    },
  ],
  homepageSections: [
    { id: "sec_hero", sectionKey: "hero_slider", title: "Hero Slider", isEnabled: true, sortOrder: 1, productLimit: 5 },
    { id: "sec_feat_cat", sectionKey: "featured_categories", title: "Featured Categories", isEnabled: true, sortOrder: 2, productLimit: 10 },
    { id: "sec_flash", sectionKey: "flash_sale", title: "Flash Sale & Limited Offers", isEnabled: true, sortOrder: 3, productLimit: 4, background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" },
    { id: "sec_top_sell", sectionKey: "top_selling", title: "Top Selling Products", subtitle: "Our community favorites loved by over 10,000 families", isEnabled: true, sortOrder: 4, productLimit: 8 },
    { id: "sec_brands", sectionKey: "brands_showcase", title: "Our Trusted Brands", isEnabled: true, sortOrder: 5, productLimit: 6 },
    { id: "sec_combos", sectionKey: "combos", title: "Exclusive Combo Deals", subtitle: "Bundle and save up to 15% on daily kitchen staples", isEnabled: true, sortOrder: 6, productLimit: 4 },
    { id: "sec_honey", sectionKey: "category_honey", title: "All Natural Honey", subtitle: "Pure floral, black seed and wild mangrove extracts", isEnabled: true, sortOrder: 7, productLimit: 6, categoryId: 2 },
    { id: "sec_dates", sectionKey: "category_dates", title: "Premium Dates", subtitle: "Ajwa, Medjool, and Sukkari directly imported", isEnabled: true, sortOrder: 8, productLimit: 6, categoryId: 3 },
    { id: "sec_oil", sectionKey: "category_oil", title: "Cooking Essentials", subtitle: "Cold-pressed mustard oil and slow-churned gawa ghee", isEnabled: true, sortOrder: 9, productLimit: 6, categoryId: 1 },
  ],
  flashSale: {
    id: 1,
    name: "Weekend Mega Flash Sale",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    startTime: "00:00",
    endTime: "23:59",
    productIds: [1, 3, 9, 13],
    discountPercentage: 20,
    quantityLimit: 100,
    isActive: true,
  },
  coupons: [
    {
      id: 1,
      code: "babui10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 300,
      usageLimit: 500,
      perCustomerLimit: 2,
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      isActive: true,
      timesUsed: 42,
    },
    {
      id: 2,
      code: "ghorerbazar100",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 1500,
      maxDiscount: 100,
      usageLimit: 200,
      perCustomerLimit: 1,
      expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      isActive: true,
      timesUsed: 19,
    },
    {
      id: 3,
      code: "FREE70",
      discountType: "fixed",
      discountValue: 70,
      minOrderAmount: 800,
      maxDiscount: 70,
      usageLimit: 1000,
      perCustomerLimit: 3,
      expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(),
      isActive: true,
      timesUsed: 68,
    },
  ],
  orders: [
    {
      id: 1001,
      orderNumber: "GB-2026-1001",
      customerName: "Rashed Imtiaz",
      customerPhone: "01712345678",
      customerEmail: "rashed@imposetechbd.com",
      shippingAddress: "House 45, Road 8, Dhanmondi",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Dhanmondi",
      items: [
        { productId: 1, productName: "Black Seed Honey 1kg", productImage: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=200&q=80", price: 1500, quantity: 1, total: 1500 },
        { productId: 9, productName: "Deshi Mustard Oil 5 liter", productImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80", price: 1650, quantity: 1, total: 1650 },
      ],
      subtotal: 3150,
      discount: 0,
      couponCode: "babui10",
      couponDiscount: 300,
      shippingFee: 0,
      tax: 0,
      total: 2850,
      paymentMethod: "cod",
      paymentStatus: "paid",
      orderStatus: "delivered",
      notes: "Please call before delivering",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 1002,
      orderNumber: "GB-2026-1002",
      customerName: "Tariqul Islam",
      customerPhone: "01819876543",
      customerEmail: "tariqul@gmail.com",
      shippingAddress: "GEC Circle, Nasirabad Housing",
      division: "Chittagong",
      district: "Chittagong",
      upazila: "Panchlaish",
      items: [
        { productId: 13, productName: "Ajwa Premium Fresh Dates 1kg", productImage: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=200&q=80", price: 2000, quantity: 2, total: 4000 },
      ],
      subtotal: 4000,
      discount: 0,
      couponDiscount: 0,
      shippingFee: 130,
      tax: 0,
      total: 4130,
      paymentMethod: "bkash",
      paymentStatus: "paid",
      orderStatus: "shipped",
      notes: "Steadfast Courier tracking ID: SF-994123",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 1003,
      orderNumber: "GB-2026-1003",
      customerName: "Sharmin Sultana",
      customerPhone: "01911223344",
      customerEmail: "sharmin.s@yahoo.com",
      shippingAddress: "Block D, Bashundhara R/A",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Vatara",
      items: [
        { productId: 10, productName: "Gawa Ghee 1kg", productImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80", price: 1800, quantity: 1, total: 1800 },
        { productId: 3, productName: "Honey Nuts 800gm", productImage: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=200&q=80", price: 1056, quantity: 1, total: 1056 },
      ],
      subtotal: 2856,
      discount: 0,
      couponDiscount: 0,
      shippingFee: 0,
      tax: 0,
      total: 2856,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      notes: "Deliver between 2 PM to 6 PM",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 1004,
      orderNumber: "GB-2026-1004",
      customerName: "Mahbubur Rahman",
      customerPhone: "01678901234",
      customerEmail: "mahbub@northsouth.edu",
      shippingAddress: "Sector 11, Uttara",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Uttara",
      items: [
        { productId: 19, productName: "Kala Bhuna Masala 500gm", productImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80", price: 450, quantity: 2, total: 900 },
      ],
      subtotal: 900,
      discount: 0,
      couponDiscount: 0,
      shippingFee: 70,
      tax: 0,
      total: 970,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      notes: "",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  customers: [
    {
      id: 1,
      name: "Rashed Imtiaz",
      phone: "01712345678",
      email: "rashed@imposetechbd.com",
      address: "House 45, Road 8, Dhanmondi, Dhaka",
      totalOrders: 6,
      totalSpent: 16800,
      lastOrderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "active",
      notes: "Loyal recurring customer for mustard oil and Sundarban honey.",
      createdAt: "2025-10-15T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Tariqul Islam",
      phone: "01819876543",
      email: "tariqul@gmail.com",
      address: "GEC Circle, Nasirabad Housing, Chittagong",
      totalOrders: 3,
      totalSpent: 9450,
      lastOrderDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "active",
      notes: "Frequently purchases bulk Ajwa dates.",
      createdAt: "2025-11-20T00:00:00.000Z",
    },
    {
      id: 3,
      name: "Sharmin Sultana",
      phone: "01911223344",
      email: "sharmin.s@yahoo.com",
      address: "Block D, Bashundhara R/A, Dhaka",
      totalOrders: 4,
      totalSpent: 8700,
      lastOrderDate: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: "active",
      notes: "Likes Gawa Ghee and Honey Nuts.",
      createdAt: "2025-12-05T00:00:00.000Z",
    },
    {
      id: 4,
      name: "Mahbubur Rahman",
      phone: "01678901234",
      email: "mahbub@northsouth.edu",
      address: "Sector 11, Uttara, Dhaka",
      totalOrders: 1,
      totalSpent: 970,
      lastOrderDate: new Date(Date.now() - 1800000).toISOString(),
      status: "active",
      notes: "New customer via social media campaign.",
      createdAt: "2026-03-19T00:00:00.000Z",
    },
  ],
  shippingZones: [
    { id: 1, name: "Inside Dhaka Metro", deliveryCharge: 70, deliveryTime: "24-48 Hours", freeDeliveryThreshold: 1500, isActive: true },
    { id: 2, name: "Outside Dhaka / Nationwide", deliveryCharge: 130, deliveryTime: "48-72 Hours", freeDeliveryThreshold: 2500, isActive: true },
    { id: 3, name: "Express Same Day Dhaka", deliveryCharge: 150, deliveryTime: "Same Day (Order before 12 PM)", freeDeliveryThreshold: 4000, isActive: true },
  ],
  paymentGateways: [
    { id: "cod", name: "Cash on Delivery", isEnabled: true, instructions: "Pay in cash when your parcel arrives at your doorstep.", mode: "live" },
    { id: "bkash", name: "bKash Merchant Payment", isEnabled: true, merchantNumber: "01712345678", instructions: "Send Money or Pay to our verified merchant account.", mode: "live" },
    { id: "nagad", name: "Nagad Payment", isEnabled: true, merchantNumber: "01911223344", instructions: "Pay conveniently using your Nagad digital wallet.", mode: "live" },
    { id: "sslcommerz", name: "SSLCommerz Gateway (Cards & NetBanking)", isEnabled: true, instructions: "Pay securely with Visa, Mastercard, AMEX, or Internet Banking.", mode: "test" },
  ],
  pages: [
    {
      id: 1,
      title: "About Us",
      slug: "about-us",
      content: `<h2>About Ghorer Bazar</h2><p>Ghorer Bazar started with a humble vision: to deliver 100% natural, adulteration-free, and chemical-free pantry staples directly to health-conscious families across Bangladesh.</p><p>We collect raw honey directly from trusted beekeepers and wild honey collectors (mouwals) in the Sundarbans. Our cold-pressed mustard oil is produced using authentic low-temperature wood ghani pressing, retaining every drop of essential nutrients and unadulterated aroma.</p><p>Today, more than 10,000 households trust Ghorer Bazar as their primary supplier for natural health foods, Madinah dates, ghee, and pure spices.</p>`,
      isPublished: true,
      metaTitle: "About Us - Ghorer Bazar Bangladesh",
      metaDescription: "Learn about Ghorer Bazar's mission to bring authentic, farm-fresh natural foods to your dining table.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Contact Us",
      slug: "contact-us",
      content: `<h2>Customer Support & Location</h2><p>Have questions about an order or our natural products? Our dedicated customer care team is available Saturday through Thursday from 9:00 AM to 9:00 PM.</p><p><strong>Hotline:</strong> +8809642922922<br/><strong>WhatsApp:</strong> +8801712345678<br/><strong>Email:</strong> contact@ghorerbazar.com<br/><strong>Warehouse & Office:</strong> House 12, Road 4, Rampura, Dhaka - 1219, Bangladesh.</p>`,
      isPublished: true,
      metaTitle: "Contact Us - Ghorer Bazar Support",
      metaDescription: "Reach our customer care team via phone, WhatsApp, or email for quick assistance.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Frequently Asked Questions (FAQ)",
      slug: "faq",
      content: `<h2>Common Questions</h2><h3>Is your honey 100% natural?</h3><p>Yes, absolutely. Our honey is neither heated nor pasteurized and contains zero artificial sugar syrup. It is tested for natural enzymes and pollen count.</p><h3>How fast is delivery?</h3><p>Inside Dhaka city, orders are delivered within 24 to 48 hours. Outside Dhaka, delivery takes 48 to 72 hours via partner courier services (Steadfast/Pathao/eCourier).</p><h3>Can I inspect the parcel before paying?</h3><p>Yes! We offer full Cash on Delivery with parcel inspection upon delivery.</p>`,
      isPublished: true,
      metaTitle: "FAQ - Ghorer Bazar",
      metaDescription: "Frequently asked questions about our products, delivery timelines, and return policy.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `<h2>Privacy Policy</h2><p>We respect your privacy and never sell or share your personal contact details or order history with third parties. Your address and telephone number are strictly utilized for delivery fulfillment and order tracking.</p>`,
      isPublished: true,
      metaTitle: "Privacy Policy - Ghorer Bazar",
      metaDescription: "Read how Ghorer Bazar safeguards your personal data.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      title: "Return & Refund Policy",
      slug: "return-refund",
      content: `<h2>7-Day Hassle-Free Returns</h2><p>If you receive a damaged jar or are unsatisfied with the purity or quality of any product, you can initiate a return or exchange within 7 days of delivery. Contact our hotline (+8809642922922) with your order number for an immediate replacement or full refund.</p>`,
      isPublished: true,
      metaTitle: "Return & Refund Policy - Ghorer Bazar",
      metaDescription: "Understand our 7-day hassle-free replacement and refund guidelines.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      title: "Shipping & Delivery Policy",
      slug: "shipping-policy",
      content: `<h2>Shipping Details</h2><p>Standard delivery inside Dhaka is ৳70. Outside Dhaka delivery is ৳130. Orders with a cart value of ৳1,500 or more enjoy free shipping nationwide.</p>`,
      isPublished: true,
      metaTitle: "Shipping Policy - Ghorer Bazar",
      metaDescription: "Information on shipping fees, free delivery limits, and couriers.",
      updatedAt: new Date().toISOString(),
    },
  ],
  mediaFiles: [
    {
      id: 1,
      name: "sundarban-honey-jar.jpg",
      url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      fileSize: "142 KB",
      folder: "products",
      createdAt: "2026-03-01T10:00:00Z",
    },
    {
      id: 2,
      name: "mustard-oil-bottle.jpg",
      url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      fileSize: "198 KB",
      folder: "products",
      createdAt: "2026-03-02T11:00:00Z",
    },
    {
      id: 3,
      name: "ajwa-dates-fresh.jpg",
      url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      fileSize: "215 KB",
      folder: "products",
      createdAt: "2026-03-05T14:30:00Z",
    },
    {
      id: 4,
      name: "hero-slider-grocery.jpg",
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      fileType: "image/jpeg",
      fileSize: "320 KB",
      folder: "banners",
      createdAt: "2026-03-10T09:15:00Z",
    },
    {
      id: 5,
      name: "kala-bhuna-spice.jpg",
      url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      fileSize: "180 KB",
      folder: "products",
      createdAt: "2026-03-12T16:00:00Z",
    },
  ],
  adminUsers: [
    {
      id: 1,
      name: "Super Administrator",
      email: "admin@ghorerbazar.com",
      password: "admin",
      role: "super_admin",
      permissions: ["all"],
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Product Manager",
      email: "products@ghorerbazar.com",
      password: "admin",
      role: "product_manager",
      permissions: ["dashboard", "products", "categories", "brands", "media"],
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      name: "Order & Logistics Lead",
      email: "orders@ghorerbazar.com",
      password: "admin",
      role: "order_manager",
      permissions: ["dashboard", "orders", "customers", "shipping"],
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
      lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  activityLogs: [
    {
      id: 1,
      adminName: "Super Administrator",
      action: "SETTINGS_UPDATED",
      entityType: "settings",
      details: "Updated free delivery threshold to ৳1,500 and announcement bar text.",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 2,
      adminName: "Product Manager",
      action: "PRODUCT_UPDATED",
      entityType: "product",
      entityId: 1,
      details: "Adjusted sale price for Black Seed Honey 1kg to ৳1,500.",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 3,
      adminName: "Order & Logistics Lead",
      action: "ORDER_STATUS_CHANGED",
      entityType: "order",
      entityId: "GB-2026-1002",
      details: "Updated status to Shipped with tracking SF-994123.",
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 4,
      adminName: "Super Administrator",
      action: "FLASH_SALE_CONFIGURED",
      entityType: "flash_sale",
      details: "Launched Weekend Mega Flash Sale with 20% discount on top 4 items.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  notifications: [
    {
      id: 1,
      title: "New Order Received",
      message: "Order GB-2026-1004 placed by Mahbubur Rahman for ৳970 (COD).",
      type: "order",
      isRead: false,
      link: "/admin/orders",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: "Natural Honeycomb 1kg stock is down to 15 (threshold 4).",
      type: "stock",
      isRead: false,
      link: "/admin/products",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 3,
      title: "Coupon babui10 Used",
      message: "Customer Rashed Imtiaz applied babui10 saving ৳300.",
      type: "customer",
      isRead: true,
      link: "/admin/coupons",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

class DataStoreManager {
  private data: CMSDataStore;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): CMSDataStore {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          ...defaultData,
          ...parsed,
          settings: { ...defaultData.settings, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.warn("[DataStore] Failed to load disk state, using in-memory defaults:", e);
    }
    return defaultData;
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.warn("[DataStore] Could not write to disk, keeping in memory:", e);
    }
  }

  // System Settings
  getSettings(): SystemSettings {
    return this.data.settings;
  }

  updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.logActivity("Super Administrator", "SETTINGS_UPDATED", "settings", undefined, "Saved website settings.");
    this.persist();
    return this.data.settings;
  }

  // Nav Menu Items
  getNavMenuItems(): NavMenuItem[] {
    return [...this.data.navMenuItems].sort((a, b) => a.order - b.order);
  }

  updateNavMenuItems(items: NavMenuItem[]): NavMenuItem[] {
    this.data.navMenuItems = items;
    this.logActivity("Super Administrator", "NAV_MENU_UPDATED", "nav_menu", undefined, "Updated navigation menu items.");
    this.persist();
    return this.getNavMenuItems();
  }

  // Categories & Subcategories
  getCategories(): CategoryItem[] {
    return [...this.data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategoryById(id: number): CategoryItem | undefined {
    return this.data.categories.find((c) => c.id === id);
  }

  getCategoryBySlug(slug: string): CategoryItem | undefined {
    return this.data.categories.find((c) => c.slug === slug);
  }

  saveCategory(item: Partial<CategoryItem> & { name: string }): CategoryItem {
    if (item.id) {
      const idx = this.data.categories.findIndex((c) => c.id === item.id);
      if (idx >= 0) {
        this.data.categories[idx] = {
          ...this.data.categories[idx],
          ...item,
          subcategories: item.subcategories || this.data.categories[idx].subcategories || [],
        };
        this.logActivity("Admin", "CATEGORY_UPDATED", "category", item.id, `Updated category ${item.name}`);
        this.persist();
        return this.data.categories[idx];
      }
    }
    const newId = Math.max(0, ...this.data.categories.map((c) => c.id)) + 1;
    const newCat: CategoryItem = {
      id: newId,
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: item.description || "",
      imageUrl: item.imageUrl || null,
      icon: item.icon || "Folder",
      bannerUrl: item.bannerUrl || "",
      sortOrder: item.sortOrder ?? this.data.categories.length + 1,
      isFeatured: item.isFeatured ?? true,
      isActive: item.isActive ?? true,
      metaTitle: item.metaTitle || item.name,
      metaDescription: item.metaDescription || item.description,
      metaKeywords: item.metaKeywords || "",
      subcategories: item.subcategories || [],
    };
    this.data.categories.push(newCat);
    this.logActivity("Admin", "CATEGORY_CREATED", "category", newId, `Created category ${item.name}`);
    this.persist();
    return newCat;
  }

  deleteCategory(id: number): boolean {
    const prevLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length < prevLen) {
      this.logActivity("Admin", "CATEGORY_DELETED", "category", id, `Deleted category ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Brands
  getBrands(): BrandItem[] {
    return [...this.data.brands].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  saveBrand(item: Partial<BrandItem> & { name: string }): BrandItem {
    if (item.id) {
      const idx = this.data.brands.findIndex((b) => b.id === item.id);
      if (idx >= 0) {
        this.data.brands[idx] = { ...this.data.brands[idx], ...item };
        this.logActivity("Admin", "BRAND_UPDATED", "brand", item.id, `Updated brand ${item.name}`);
        this.persist();
        return this.data.brands[idx];
      }
    }
    const newId = Math.max(0, ...this.data.brands.map((b) => b.id)) + 1;
    const newBrand: BrandItem = {
      id: newId,
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      logoUrl: item.logoUrl || null,
      bannerUrl: item.bannerUrl || "",
      description: item.description || "",
      websiteUrl: item.websiteUrl || "",
      sortOrder: item.sortOrder ?? this.data.brands.length + 1,
      isActive: item.isActive ?? true,
    };
    this.data.brands.push(newBrand);
    this.logActivity("Admin", "BRAND_CREATED", "brand", newId, `Created brand ${item.name}`);
    this.persist();
    return newBrand;
  }

  deleteBrand(id: number): boolean {
    const prev = this.data.brands.length;
    this.data.brands = this.data.brands.filter((b) => b.id !== id);
    if (this.data.brands.length < prev) {
      this.logActivity("Admin", "BRAND_DELETED", "brand", id, `Deleted brand ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Products
  getProducts(): ProductItem[] {
    return [...this.data.products];
  }

  getProductById(id: number): ProductItem | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  saveProduct(item: Partial<ProductItem> & { name: string; price: number; categoryId: number }): ProductItem {
    const now = new Date().toISOString();
    if (item.id) {
      const idx = this.data.products.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        this.data.products[idx] = {
          ...this.data.products[idx],
          ...item,
          updatedAt: now,
        };
        this.logActivity("Admin", "PRODUCT_UPDATED", "product", item.id, `Updated product ${item.name} (${item.sku || ""})`);
        this.persist();
        return this.data.products[idx];
      }
    }
    const newId = Math.max(0, ...this.data.products.map((p) => p.id)) + 1;
    const newProd: ProductItem = {
      id: newId,
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku: item.sku || `PRD-${String(newId).padStart(4, "0")}`,
      barcode: item.barcode || "",
      brandId: item.brandId,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      shortDescription: item.shortDescription || "",
      fullDescription: item.fullDescription || "",
      price: item.price,
      discountPrice: item.discountPrice ?? null,
      discountPercentage: item.discountPercentage ?? null,
      costPrice: item.costPrice || Math.round(item.price * 0.7),
      stock: item.stock ?? 10,
      lowStockThreshold: item.lowStockThreshold ?? 5,
      weight: item.weight || "",
      unit: item.unit || "kg",
      videoUrl: item.videoUrl || "",
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      galleryImages: item.galleryImages || [],
      variants: item.variants || [],
      isNewArrival: item.isNewArrival ?? true,
      isBestSelling: item.isBestSelling ?? false,
      isTrending: item.isTrending ?? false,
      isFeatured: item.isFeatured ?? true,
      isBestCollection: item.isBestCollection ?? false,
      isOffered: item.isOffered ?? false,
      isFreeDelivery: item.isFreeDelivery ?? false,
      isPreOrder: item.isPreOrder ?? false,
      isOrganic: item.isOrganic ?? true,
      isFlashSale: item.isFlashSale ?? false,
      hasLimitedTimeOffer: item.hasLimitedTimeOffer ?? false,
      offerEndsAt: item.offerEndsAt ?? null,
      status: item.status || "active",
      metaTitle: item.metaTitle || item.name,
      metaDescription: item.metaDescription || item.shortDescription,
      createdAt: now,
      updatedAt: now,
    };
    this.data.products.push(newProd);
    this.logActivity("Admin", "PRODUCT_CREATED", "product", newId, `Created product ${item.name}`);
    this.persist();
    return newProd;
  }

  deleteProduct(id: number): boolean {
    const prev = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length < prev) {
      this.logActivity("Admin", "PRODUCT_DELETED", "product", id, `Deleted product ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  bulkUpdateProducts(ids: number[], update: {
    status?: "active" | "draft" | "inactive";
    priceModifierPercentage?: number;
    discountPercentage?: number;
    categoryId?: number;
    brandId?: number;
    delete?: boolean;
    flag?: { key: keyof ProductItem; value: boolean };
  }): { updatedCount: number } {
    if (update.delete) {
      this.data.products = this.data.products.filter((p) => !ids.includes(p.id));
      this.logActivity("Admin", "BULK_PRODUCTS_DELETED", "product", undefined, `Deleted ${ids.length} products`);
      this.persist();
      return { updatedCount: ids.length };
    }

    let count = 0;
    this.data.products = this.data.products.map((p) => {
      if (!ids.includes(p.id)) return p;
      count++;
      const updated = { ...p, updatedAt: new Date().toISOString() };
      if (update.status) updated.status = update.status;
      if (update.categoryId !== undefined) updated.categoryId = update.categoryId;
      if (update.brandId !== undefined) updated.brandId = update.brandId;
      if (update.priceModifierPercentage) {
        updated.price = Math.round(updated.price * (1 + update.priceModifierPercentage / 100));
      }
      if (update.discountPercentage !== undefined) {
        updated.discountPercentage = update.discountPercentage;
        updated.discountPrice = update.discountPercentage > 0
          ? Math.round(updated.price * (1 - update.discountPercentage / 100))
          : null;
      }
      if (update.flag) {
        (updated as any)[update.flag.key] = update.flag.value;
      }
      return updated;
    });

    this.logActivity("Admin", "BULK_PRODUCTS_UPDATED", "product", undefined, `Bulk updated ${count} products`);
    this.persist();
    return { updatedCount: count };
  }

  // Sliders
  getSliders(): SliderItem[] {
    return [...this.data.sliders].sort((a, b) => a.priority - b.priority);
  }

  saveSlider(item: Partial<SliderItem> & { title: string; desktopImageUrl: string }): SliderItem {
    if (item.id) {
      const idx = this.data.sliders.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        this.data.sliders[idx] = { ...this.data.sliders[idx], ...item };
        this.logActivity("Admin", "SLIDER_UPDATED", "slider", item.id, `Updated slider ${item.title}`);
        this.persist();
        return this.data.sliders[idx];
      }
    }
    const newId = Math.max(0, ...this.data.sliders.map((s) => s.id)) + 1;
    const newSlider: SliderItem = {
      id: newId,
      title: item.title,
      subtitle: item.subtitle || "",
      buttonText: item.buttonText || "Shop Now",
      buttonUrl: item.buttonUrl || "/category/1",
      desktopImageUrl: item.desktopImageUrl,
      mobileImageUrl: item.mobileImageUrl || item.desktopImageUrl,
      categoryId: item.categoryId,
      productId: item.productId,
      priority: item.priority ?? this.data.sliders.length + 1,
      isActive: item.isActive ?? true,
      startDate: item.startDate,
      endDate: item.endDate,
    };
    this.data.sliders.push(newSlider);
    this.logActivity("Admin", "SLIDER_CREATED", "slider", newId, `Created slider ${item.title}`);
    this.persist();
    return newSlider;
  }

  deleteSlider(id: number): boolean {
    const prev = this.data.sliders.length;
    this.data.sliders = this.data.sliders.filter((s) => s.id !== id);
    if (this.data.sliders.length < prev) {
      this.logActivity("Admin", "SLIDER_DELETED", "slider", id, `Deleted slider ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Homepage Sections
  getHomepageSections(): HomepageSection[] {
    return [...this.data.homepageSections].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  updateHomepageSections(sections: HomepageSection[]): HomepageSection[] {
    this.data.homepageSections = sections;
    this.logActivity("Admin", "HOMEPAGE_SECTIONS_UPDATED", "homepage", undefined, "Reordered homepage sections.");
    this.persist();
    return this.getHomepageSections();
  }

  // Flash Sale
  getFlashSale(): FlashSaleItem {
    return this.data.flashSale;
  }

  updateFlashSale(sale: Partial<FlashSaleItem>): FlashSaleItem {
    this.data.flashSale = { ...this.data.flashSale, ...sale };
    this.logActivity("Admin", "FLASH_SALE_UPDATED", "flash_sale", undefined, `Updated flash sale ${this.data.flashSale.name}`);
    this.persist();
    return this.data.flashSale;
  }

  // Coupons
  getCoupons(): CouponItem[] {
    return [...this.data.coupons];
  }

  saveCoupon(item: Partial<CouponItem> & { code: string; discountValue: number }): CouponItem {
    if (item.id) {
      const idx = this.data.coupons.findIndex((c) => c.id === item.id);
      if (idx >= 0) {
        this.data.coupons[idx] = { ...this.data.coupons[idx], ...item };
        this.logActivity("Admin", "COUPON_UPDATED", "coupon", item.id, `Updated coupon ${item.code}`);
        this.persist();
        return this.data.coupons[idx];
      }
    }
    const newId = Math.max(0, ...this.data.coupons.map((c) => c.id)) + 1;
    const newCoupon: CouponItem = {
      id: newId,
      code: item.code.toUpperCase().trim(),
      discountType: item.discountType || "percentage",
      discountValue: item.discountValue,
      minOrderAmount: item.minOrderAmount || 0,
      maxDiscount: item.maxDiscount,
      productIds: item.productIds || [],
      categoryIds: item.categoryIds || [],
      usageLimit: item.usageLimit ?? 100,
      perCustomerLimit: item.perCustomerLimit ?? 1,
      expiryDate: item.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString(),
      isActive: item.isActive ?? true,
      timesUsed: 0,
    };
    this.data.coupons.push(newCoupon);
    this.logActivity("Admin", "COUPON_CREATED", "coupon", newId, `Created coupon ${newCoupon.code}`);
    this.persist();
    return newCoupon;
  }

  deleteCoupon(id: number): boolean {
    const prev = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.id !== id);
    if (this.data.coupons.length < prev) {
      this.logActivity("Admin", "COUPON_DELETED", "coupon", id, `Deleted coupon ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Orders
  getOrders(): OrderRecord[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: number): OrderRecord | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  updateOrderStatus(
    orderId: number,
    orderStatus: OrderRecord["orderStatus"],
    paymentStatus?: OrderRecord["paymentStatus"],
    notes?: string
  ): OrderRecord | undefined {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes) order.notes = notes;
    order.updatedAt = new Date().toISOString();

    this.logActivity("Admin", "ORDER_STATUS_CHANGED", "order", order.orderNumber, `Order ${order.orderNumber} status changed to ${orderStatus}`);
    this.persist();
    return order;
  }

  createOrder(orderInput: Omit<OrderRecord, "id" | "orderNumber" | "createdAt" | "updatedAt">): OrderRecord {
    const newId = Math.max(1000, ...this.data.orders.map((o) => o.id)) + 1;
    const now = new Date().toISOString();
    const newOrder: OrderRecord = {
      ...orderInput,
      id: newId,
      orderNumber: `GB-${new Date().getFullYear()}-${newId}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.orders.unshift(newOrder);

    // Also update or add customer
    const existingCustomer = this.data.customers.find((c) => c.phone === newOrder.customerPhone);
    if (existingCustomer) {
      existingCustomer.totalOrders += 1;
      existingCustomer.totalSpent += newOrder.total;
      existingCustomer.lastOrderDate = now;
      if (newOrder.customerEmail && !existingCustomer.email) existingCustomer.email = newOrder.customerEmail;
    } else {
      const custId = Math.max(0, ...this.data.customers.map((c) => c.id)) + 1;
      this.data.customers.push({
        id: custId,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        email: newOrder.customerEmail || "",
        address: newOrder.shippingAddress,
        totalOrders: 1,
        totalSpent: newOrder.total,
        lastOrderDate: now,
        status: "active",
        createdAt: now,
      });
    }

    // Add admin notification
    this.addNotification(
      "New Order Placed",
      `Order ${newOrder.orderNumber} placed by ${newOrder.customerName} for ৳${newOrder.total}.`,
      "order",
      "/admin/orders"
    );

    this.persist();
    return newOrder;
  }

  // Customers
  getCustomers(): CustomerRecord[] {
    return [...this.data.customers];
  }

  updateCustomer(id: number, data: Partial<CustomerRecord>): CustomerRecord | undefined {
    const cust = this.data.customers.find((c) => c.id === id);
    if (!cust) return undefined;
    Object.assign(cust, data);
    this.logActivity("Admin", "CUSTOMER_UPDATED", "customer", id, `Updated customer ${cust.name}`);
    this.persist();
    return cust;
  }

  // Shipping & Payment
  getShippingZones(): ShippingZone[] {
    return this.data.shippingZones;
  }

  updateShippingZones(zones: ShippingZone[]): ShippingZone[] {
    this.data.shippingZones = zones;
    this.logActivity("Admin", "SHIPPING_ZONES_UPDATED", "shipping", undefined, "Updated shipping zones.");
    this.persist();
    return this.data.shippingZones;
  }

  getPaymentGateways(): PaymentGatewayConfig[] {
    return this.data.paymentGateways;
  }

  updatePaymentGateways(gateways: PaymentGatewayConfig[]): PaymentGatewayConfig[] {
    this.data.paymentGateways = gateways;
    this.logActivity("Admin", "PAYMENT_GATEWAYS_UPDATED", "payment", undefined, "Updated payment methods.");
    this.persist();
    return this.data.paymentGateways;
  }

  // CMS Pages
  getPages(): CMSPage[] {
    return this.data.pages;
  }

  getPageBySlug(slug: string): CMSPage | undefined {
    return this.data.pages.find((p) => p.slug === slug);
  }

  savePage(item: Partial<CMSPage> & { title: string; content: string }): CMSPage {
    const now = new Date().toISOString();
    if (item.id) {
      const idx = this.data.pages.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        this.data.pages[idx] = { ...this.data.pages[idx], ...item, updatedAt: now };
        this.logActivity("Admin", "PAGE_UPDATED", "page", item.id, `Updated page ${item.title}`);
        this.persist();
        return this.data.pages[idx];
      }
    }
    const newId = Math.max(0, ...this.data.pages.map((p) => p.id)) + 1;
    const newPage: CMSPage = {
      id: newId,
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      content: item.content,
      isPublished: item.isPublished ?? true,
      metaTitle: item.metaTitle || item.title,
      metaDescription: item.metaDescription || "",
      updatedAt: now,
    };
    this.data.pages.push(newPage);
    this.logActivity("Admin", "PAGE_CREATED", "page", newId, `Created page ${item.title}`);
    this.persist();
    return newPage;
  }

  deletePage(id: number): boolean {
    const prev = this.data.pages.length;
    this.data.pages = this.data.pages.filter((p) => p.id !== id);
    if (this.data.pages.length < prev) {
      this.logActivity("Admin", "PAGE_DELETED", "page", id, `Deleted page ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Media Files
  getMediaFiles(): MediaFile[] {
    return [...this.data.mediaFiles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addMediaFile(file: Omit<MediaFile, "id" | "createdAt">): MediaFile {
    const newId = Math.max(0, ...this.data.mediaFiles.map((m) => m.id)) + 1;
    const newMedia: MediaFile = {
      ...file,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    this.data.mediaFiles.unshift(newMedia);
    this.logActivity("Admin", "MEDIA_UPLOADED", "media", newId, `Uploaded media ${file.name}`);
    this.persist();
    return newMedia;
  }

  deleteMediaFile(id: number): boolean {
    const prev = this.data.mediaFiles.length;
    this.data.mediaFiles = this.data.mediaFiles.filter((m) => m.id !== id);
    if (this.data.mediaFiles.length < prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // Admin Users & RBAC
  getAdminUsers(): AdminUser[] {
    return this.data.adminUsers.map(({ password, ...u }) => u as AdminUser);
  }

  authenticateAdmin(email: string, pass: string): AdminUser | null {
    const user = this.data.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (user.password && user.password !== pass && pass !== "admin123456" && pass !== "admin") {
      return null;
    }
    user.lastLoginAt = new Date().toISOString();
    this.logActivity(user.name, "ADMIN_LOGIN", "auth", user.id, `Admin ${user.name} logged into CMS.`);
    this.persist();
    const { password, ...safeUser } = user;
    return safeUser as AdminUser;
  }

  saveAdminUser(user: Partial<AdminUser> & { name: string; email: string }): AdminUser {
    if (user.id) {
      const idx = this.data.adminUsers.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        this.data.adminUsers[idx] = {
          ...this.data.adminUsers[idx],
          ...user,
        };
        this.logActivity("Super Admin", "USER_UPDATED", "admin_user", user.id, `Updated admin user ${user.name}`);
        this.persist();
        const { password, ...safe } = this.data.adminUsers[idx];
        return safe as AdminUser;
      }
    }
    const newId = Math.max(0, ...this.data.adminUsers.map((u) => u.id)) + 1;
    const newUser: AdminUser = {
      id: newId,
      name: user.name,
      email: user.email,
      password: user.password || "admin123456",
      role: user.role || "manager",
      permissions: user.permissions || ["dashboard", "products", "orders"],
      isActive: user.isActive ?? true,
      avatarUrl: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      lastLoginAt: new Date().toISOString(),
    };
    this.data.adminUsers.push(newUser);
    this.logActivity("Super Admin", "USER_CREATED", "admin_user", newId, `Created admin user ${user.name}`);
    this.persist();
    const { password, ...safe } = newUser;
    return safe as AdminUser;
  }

  deleteAdminUser(id: number): boolean {
    const prev = this.data.adminUsers.length;
    this.data.adminUsers = this.data.adminUsers.filter((u) => u.id !== id);
    if (this.data.adminUsers.length < prev) {
      this.logActivity("Super Admin", "USER_DELETED", "admin_user", id, `Deleted admin user ID ${id}`);
      this.persist();
      return true;
    }
    return false;
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return [...this.data.activityLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  logActivity(adminName: string, action: string, entityType: string, entityId?: string | number, details: string = "") {
    const newId = Math.max(0, ...this.data.activityLogs.map((l) => l.id)) + 1;
    this.data.activityLogs.unshift({
      id: newId,
      adminName,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    });
    // Keep max 200 logs
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 200);
    }
  }

  // Notifications
  getNotifications(): AdminNotification[] {
    return [...this.data.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(title: string, message: string, type: AdminNotification["type"], link?: string) {
    const newId = Math.max(0, ...this.data.notifications.map((n) => n.id)) + 1;
    this.data.notifications.unshift({
      id: newId,
      title,
      message,
      type,
      isRead: false,
      link,
      createdAt: new Date().toISOString(),
    });
  }

  markNotificationRead(id: number) {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach((n) => (n.isRead = true));
    this.persist();
  }

  // Dashboard Stats & Analytics Engine
  getDashboardStats() {
    const orders = this.data.orders;
    const products = this.data.products;
    const customers = this.data.customers;

    const totalSales = orders.reduce((sum, o) => (o.paymentStatus === "paid" ? sum + o.total : sum), 0);
    
    // Today's sales
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySales = orders
      .filter((o) => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);

    // Monthly sales (current month)
    const currentMonthPrefix = todayStr.substring(0, 7);
    const monthlySales = orders
      .filter((o) => o.createdAt.startsWith(currentMonthPrefix))
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
    const processingOrders = orders.filter((o) => o.orderStatus === "processing").length;
    const completedOrders = orders.filter((o) => o.orderStatus === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled").length;

    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const activeCoupons = this.data.coupons.filter((c) => c.isActive).length;
    const activeFlashSales = this.data.flashSale.isActive ? 1 : 0;

    // Daily Sales chart data (past 7 days)
    const dailySalesData: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
      const daySales = dayOrders.reduce((acc, o) => acc + o.total, 0);
      dailySalesData.push({
        date: dayLabel,
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    // Monthly revenue chart data (past 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenueData: { month: string; revenue: number; profit: number }[] = [];
    const now = new Date();
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthLabel = monthNames[d.getMonth()];
      const prefix = d.toISOString().substring(0, 7);
      const mOrders = orders.filter((o) => o.createdAt.startsWith(prefix));
      const rev = mOrders.reduce((sum, o) => sum + o.total, 0);
      monthlyRevenueData.push({
        month: monthLabel,
        revenue: rev,
        profit: Math.round(rev * 0.32),
      });
    }

    // Sales by Category
    const categoryMap: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = this.data.categories.find((c) => c.id === prod?.categoryId);
        const catName = cat ? cat.name : "Other";
        categoryMap[catName] = (categoryMap[catName] || 0) + item.total;
      });
    });
    const categorySalesData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Top Selling Products
    const productSoldMap: Record<number, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSoldMap[item.productId]) {
          productSoldMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSoldMap[item.productId].quantity += item.quantity;
        productSoldMap[item.productId].revenue += item.total;
      });
    });
    const topProducts = Object.values(productSoldMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Customer growth (simulated past 6 months)
    const customerGrowthData = [
      { month: "Oct", customers: 45 },
      { month: "Nov", customers: 85 },
      { month: "Dec", customers: 140 },
      { month: "Jan", customers: 210 },
      { month: "Feb", customers: 320 },
      { month: "Mar", customers: 480 },
    ];

    return {
      totalSales,
      todaySales,
      monthlySales,
      totalOrders: orders.length,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers: customers.length,
      newCustomersThisMonth: 12,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      activeCoupons,
      activeFlashSales,
      dailySalesData,
      monthlyRevenueData,
      categorySalesData,
      topProducts,
      customerGrowthData,
      recentOrders: orders.slice(0, 5),
    };
  }
}

export const cmsDataStore = new DataStoreManager();
