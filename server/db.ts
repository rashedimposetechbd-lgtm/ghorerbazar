import { eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  User,
  users,
  Product,
  products,
  Category,
  categories,
  Combo,
  combos,
  CartItem,
  cartItems,
  Brand,
  brands,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let isDbChecked = false;
let dbCheckPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;

async function initDb(): Promise<ReturnType<typeof drizzle> | null> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  // Validate that the URL is a MySQL connection string (not HTTP/Supabase/Postgres)
  const isMysql =
    (dbUrl.startsWith("mysql://") || dbUrl.startsWith("mysql2://")) &&
    !dbUrl.includes("supabase.co");

  if (!isMysql) {
    console.log(
      "[Database] DATABASE_URL is not a MySQL connection string (using in-memory store)."
    );
    return null;
  }

  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection({
      uri: dbUrl,
      connectTimeout: 2000,
    });
    await conn.query("SELECT 1");
    await conn.end();
    console.log("[Database] Connected to MySQL database successfully.");
    return drizzle(dbUrl, { mode: "default" });
  } catch (error: any) {
    console.warn(
      "[Database] MySQL connection failed, using in-memory store:",
      error?.message || error
    );
    return null;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb(): Promise<ReturnType<typeof drizzle> | null> {
  if (isDbChecked) return _db;
  if (!dbCheckPromise) {
    dbCheckPromise = initDb().then((db) => {
      _db = db;
      isDbChecked = true;
      return db;
    });
  }
  return dbCheckPromise;
}

// ============================================================================
// IN-MEMORY MOCK CATALOG & STORE
// Provides full e-commerce functionality when no external database is connected
// ============================================================================

const mockCategories: Category[] = [
  { id: 1, name: "Oil & Ghee", slug: "oil-ghee", description: "Pure mustard oil and traditional ghee", imageUrl: null, createdAt: new Date() },
  { id: 2, name: "Honey", slug: "honey", description: "Natural Sundarban and wild flower honey", imageUrl: null, createdAt: new Date() },
  { id: 3, name: "Dates", slug: "dates", description: "Fresh premium dates from Madinah", imageUrl: null, createdAt: new Date() },
  { id: 4, name: "Spices", slug: "spices", description: "Authentic pure spices and ground powders", imageUrl: null, createdAt: new Date() },
  { id: 5, name: "Nuts & Seeds", slug: "nuts-seeds", description: "Crunchy premium nuts and nutrient-rich seeds", imageUrl: null, createdAt: new Date() },
  { id: 6, name: "Beverage", slug: "beverage", description: "Healthy drinks, teas and functional powders", imageUrl: null, createdAt: new Date() },
  { id: 7, name: "Rice", slug: "rice", description: "Aromatic basmati and premium fine rice", imageUrl: null, createdAt: new Date() },
  { id: 8, name: "Flours & Lentils", slug: "flours-lentils", description: "Stone-ground flours and organic lentils", imageUrl: null, createdAt: new Date() },
  { id: 9, name: "Organic", slug: "organic", description: "Certified organic healthy living foods", imageUrl: null, createdAt: new Date() },
  { id: 10, name: "Functional Food", slug: "functional-food", description: "Superfoods and daily health supplements", imageUrl: null, createdAt: new Date() },
];

const mockProducts: Product[] = [
  { id: 1, name: "Black Seed Honey 1kg", categoryId: 2, price: "1600.00", discountPrice: "1500.00", discountPercentage: "6.25", stock: 50, isBestSelling: true, isNewArrival: false, hasLimitedTimeOffer: true, offerEndsAt: new Date(Date.now() + 86400000 * 7), description: "100% natural black seed infused honey with strong therapeutic aroma and taste.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Sundarban Honey 1kg", categoryId: 2, price: "2500.00", discountPrice: null, discountPercentage: null, stock: 30, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Harvested directly from wild beehives in the Sundarban mangrove forest.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Honey Nuts 800gm", categoryId: 2, price: "1200.00", discountPrice: "1056.00", discountPercentage: "12.00", stock: 25, isBestSelling: true, isNewArrival: false, hasLimitedTimeOffer: true, offerEndsAt: new Date(Date.now() + 86400000 * 5), description: "Rich mixture of premium cashew, almond, pistachio soaked in pure organic honey.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: "African Organic Wild Honey 500g", categoryId: 2, price: "1200.00", discountPrice: "1056.00", discountPercentage: "12.00", stock: 20, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Exotic dark wild honey with bold floral notes and unpasteurized raw goodness.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: "Black Seed Honey 500g", categoryId: 2, price: "900.00", discountPrice: "846.00", discountPercentage: "6.00", stock: 40, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Premium kalojira flower honey in a convenient 500g glass jar.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, name: "Natural Honeycomb 1kg", categoryId: 2, price: "3000.00", discountPrice: "2700.00", discountPercentage: "10.00", stock: 15, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Raw honeycomb directly from the hive, fully edible wax loaded with enzymes.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, name: "Lychee Flower Honey 500g", categoryId: 2, price: "1100.00", discountPrice: "1012.00", discountPercentage: "8.00", stock: 35, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Light, sweet, and aromatic honey collected during the lychee blooming season.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, name: "Kashmiri Sidr Honey 800g", categoryId: 2, price: "2200.00", discountPrice: null, discountPercentage: null, stock: 20, isBestSelling: false, isNewArrival: true, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Prestigious Sidr honey sourced from the pristine valleys of Kashmir.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 9, name: "Deshi Mustard Oil 5 liter", categoryId: 1, price: "1700.00", discountPrice: "1650.00", discountPercentage: "2.94", stock: 40, isBestSelling: true, isNewArrival: false, hasLimitedTimeOffer: true, offerEndsAt: new Date(Date.now() + 86400000 * 3), description: "Cold-pressed traditional mustard oil with strong pungency and golden clarity.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 10, name: "Gawa Ghee 1kg", categoryId: 1, price: "1800.00", discountPrice: null, discountPercentage: null, stock: 35, isBestSelling: true, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Crafted from pure cow milk butter using traditional slow-cooking methods.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 11, name: "Gawa Ghee 500gm", categoryId: 1, price: "950.00", discountPrice: null, discountPercentage: null, stock: 50, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Traditional aromatic gawa ghee in a 500g container.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 12, name: "Black Cumin Seed Oil 500ml", categoryId: 1, price: "800.00", discountPrice: null, discountPercentage: null, stock: 30, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Pure cold-pressed black cumin (kalojira) oil known as a universal remedy.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 13, name: "Ajwa Premium Fresh Dates 1kg", categoryId: 3, price: "2500.00", discountPrice: "2000.00", discountPercentage: "20.00", stock: 25, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: true, offerEndsAt: new Date(Date.now() + 86400000 * 4), description: "Authentic Madinah Ajwa dates, soft, dark, and rich in natural nutrients.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 14, name: "Ajwa Premium Fresh Dates 500gm", categoryId: 3, price: "1500.00", discountPrice: "1200.00", discountPercentage: "20.00", stock: 30, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Finest quality Madinah Ajwa dates in a sealed 500g freshness pouch.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 15, name: "Sukkari Mufattal Malaki Dates 1kg", categoryId: 3, price: "2200.00", discountPrice: "1980.00", discountPercentage: "10.00", stock: 20, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Royal golden dates with crisp bite and sweet caramel melt-in-mouth finish.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 16, name: "Egyptian Medjool Large 1kg", categoryId: 3, price: "2800.00", discountPrice: null, discountPercentage: null, stock: 15, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "King of dates, large plump Medjool dates full of natural succulent honey.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 17, name: "Chili (Morich) Powder 500g", categoryId: 4, price: "400.00", discountPrice: null, discountPercentage: null, stock: 60, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Bright red spicy chili powder without artificial color or preservatives.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 18, name: "Turmeric (Holud) Powder 500g", categoryId: 4, price: "350.00", discountPrice: null, discountPercentage: null, stock: 70, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "High curcumin natural turmeric ground from selected whole roots.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 19, name: "Kala Bhuna Masala 500gm", categoryId: 4, price: "500.00", discountPrice: "450.00", discountPercentage: "10.00", stock: 40, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Authentic Chittagong Kala Bhuna blend of fragrant whole spices.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 20, name: "Coriander Powder 500gm", categoryId: 4, price: "300.00", discountPrice: null, discountPercentage: null, stock: 50, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Freshly roasted and stone ground coriander powder.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 21, name: "Mixed Nuts 500g", categoryId: 5, price: "800.00", discountPrice: null, discountPercentage: null, stock: 30, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Premium blend of cashews, almonds, walnuts, and raisins.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 22, name: "Almonds 500g", categoryId: 5, price: "1200.00", discountPrice: null, discountPercentage: null, stock: 25, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "California whole roasted almonds, crunchy and high in healthy fats.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 23, name: "Basmati Rice 5kg", categoryId: 7, price: "800.00", discountPrice: null, discountPercentage: null, stock: 100, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Extra long grain aged basmati rice for fragrant biryani and polao.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 24, name: "Jasmine Rice 5kg", categoryId: 7, price: "700.00", discountPrice: null, discountPercentage: null, stock: 80, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Fragrant aromatic jasmine rice for daily dining.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 25, name: "Rice Flour (Chaler Gura) 2kg", categoryId: 8, price: "250.00", discountPrice: null, discountPercentage: null, stock: 50, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Traditional fine rice flour perfect for seasonal pitha recipes.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 26, name: "Laal Atta 2kg", categoryId: 8, price: "280.00", discountPrice: null, discountPercentage: null, stock: 60, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Whole wheat whole grain red flour rich in bran and fiber.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 27, name: "Mashkalai Dal 1 Kg", categoryId: 8, price: "350.00", discountPrice: null, discountPercentage: null, stock: 40, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Clean split black gram lentil for tasty dal and traditional ruti.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 28, name: "Organic Matcha Green Tea 100gm", categoryId: 6, price: "600.00", discountPrice: null, discountPercentage: null, stock: 20, isBestSelling: false, isNewArrival: false, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Ceremonial grade pure matcha green tea powder packed with antioxidants.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 29, name: "Spirulina Powder 250 gm", categoryId: 6, price: "1500.00", discountPrice: null, discountPercentage: null, stock: 15, isBestSelling: false, isNewArrival: true, hasLimitedTimeOffer: false, offerEndsAt: null, description: "100% pure blue-green algae powder superfood supplement.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 30, name: "Organic Spirulina Powder 250 gm", categoryId: 9, price: "1500.00", discountPrice: null, discountPercentage: null, stock: 15, isBestSelling: false, isNewArrival: true, hasLimitedTimeOffer: false, offerEndsAt: null, description: "Certified organic spirulina powder for daily immunity boosts.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
];

const mockCombos: Combo[] = [
  { id: 1, name: "Ghee (Half Kg) & Lychee Honey Sachet Combo", price: "1000.00", originalPrice: "1123.50", savingsPercentage: "12.30", productIds: [11, 7], stock: 50, description: "Gawa Ghee 500gm + Lychee Flower Honey 500g special bundle.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Ghee (1 Kg) & Lychee Honey Sachet Combo", price: "1800.00", originalPrice: "2048.00", savingsPercentage: "11.80", productIds: [10, 7], stock: 40, description: "Gawa Ghee 1kg + Lychee Flower Honey 500g family saver bundle.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Shahi Masala & Lychee Honey Sachet Combo", price: "1500.00", originalPrice: "1738.00", savingsPercentage: "13.80", productIds: [19, 7], stock: 35, description: "Kala Bhuna Masala 500gm + Lychee Flower Honey 500g combo.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: "Kala Bhuna & Lychee Honey Sachet Combo", price: "1500.00", originalPrice: "1738.00", savingsPercentage: "13.80", productIds: [19, 7], stock: 30, description: "Chittagong style Kala Bhuna Masala paired with organic honey.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: "Mustard Oil & Lychee Honey Sachet Combo", price: "1750.00", originalPrice: "1937.50", savingsPercentage: "9.80", productIds: [9, 7], stock: 25, description: "Deshi Mustard Oil 5L + Lychee Honey 500g breakfast & kitchen pack.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, name: "Black Cumin Seed Oil & Lychee Honey Sachet Combo", price: "2500.00", originalPrice: "2700.00", savingsPercentage: "8.80", productIds: [12, 7], stock: 20, description: "Cold-pressed black cumin oil paired with floral raw honey.", imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
];

const mockBrands: Brand[] = [
  { id: 1, name: "Ghorerbazar", logoUrl: null, createdAt: new Date() },
  { id: 2, name: "Glarvest", logoUrl: null, createdAt: new Date() },
  { id: 3, name: "Khejuri", logoUrl: null, createdAt: new Date() },
  { id: 4, name: "Shosti food", logoUrl: null, createdAt: new Date() },
  { id: 5, name: "Honeyraj", logoUrl: null, createdAt: new Date() },
];

let inMemoryUsers: User[] = [
  {
    id: 1,
    openId: "demo-user-1",
    name: "Guest Shopper",
    email: "guest@ghorerbazar.com",
    loginMethod: "guest",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
];

let inMemoryCartItems: CartItem[] = [];
let nextCartItemId = 1;

// ============================================================================
// DATABASE OPERATIONS (WITH DUAL-MODE SUPPORT)
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    const existingIndex = inMemoryUsers.findIndex((u) => u.openId === user.openId);
    const now = new Date();
    if (existingIndex >= 0) {
      inMemoryUsers[existingIndex] = {
        ...inMemoryUsers[existingIndex],
        name: user.name ?? inMemoryUsers[existingIndex].name,
        email: user.email ?? inMemoryUsers[existingIndex].email,
        loginMethod: user.loginMethod ?? inMemoryUsers[existingIndex].loginMethod,
        role: user.role ?? inMemoryUsers[existingIndex].role,
        lastSignedIn: user.lastSignedIn ?? now,
        updatedAt: now,
      };
    } else {
      const newUser: User = {
        id: inMemoryUsers.length + 1,
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      inMemoryUsers.push(newUser);
    }
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return inMemoryUsers.find((u) => u.openId === openId);
  }
  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.warn("[Database] getUserByOpenId failed, falling back to in-memory users:", error);
    return inMemoryUsers.find((u) => u.openId === openId);
  }
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return mockProducts;
  try {
    return await db.select().from(products);
  } catch (error) {
    console.warn("[Database] getAllProducts failed, falling back to mock catalog:", error);
    return mockProducts;
  }
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return mockProducts.filter((p) => p.categoryId === categoryId);
  try {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  } catch (error) {
    console.warn("[Database] getProductsByCategory failed, falling back to mock catalog:", error);
    return mockProducts.filter((p) => p.categoryId === categoryId);
  }
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) {
    return mockProducts.find((p) => p.id === productId) || null;
  }
  try {
    const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.warn("[Database] getProductById failed, falling back to mock catalog:", error);
    return mockProducts.find((p) => p.id === productId) || null;
  }
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) {
    const q = query.toLowerCase();
    return mockProducts.filter((p) => p.name.toLowerCase().includes(q));
  }
  try {
    return await db.select().from(products).where(like(products.name, `%${query}%`));
  } catch (error) {
    console.warn("[Database] searchProducts failed, falling back to mock catalog:", error);
    const q = query.toLowerCase();
    return mockProducts.filter((p) => p.name.toLowerCase().includes(q));
  }
}

export async function getTopSellingProducts(limit: number = 8) {
  const db = await getDb();
  if (!db) {
    return mockProducts.filter((p) => p.isBestSelling).slice(0, limit);
  }
  try {
    return await db.select().from(products).where(eq(products.isBestSelling, true)).limit(limit);
  } catch (error) {
    console.warn("[Database] getTopSellingProducts failed, falling back to mock catalog:", error);
    return mockProducts.filter((p) => p.isBestSelling).slice(0, limit);
  }
}

export async function getNewArrivalProducts(limit: number = 8) {
  const db = await getDb();
  if (!db) {
    return mockProducts.filter((p) => p.isNewArrival).slice(0, limit);
  }
  try {
    return await db.select().from(products).where(eq(products.isNewArrival, true)).limit(limit);
  } catch (error) {
    console.warn("[Database] getNewArrivalProducts failed, falling back to mock catalog:", error);
    return mockProducts.filter((p) => p.isNewArrival).slice(0, limit);
  }
}

// Category queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return mockCategories;
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.warn("[Database] getAllCategories failed, falling back to mock catalog:", error);
    return mockCategories;
  }
}

export async function getCategoryById(categoryId: number) {
  const db = await getDb();
  if (!db) {
    return mockCategories.find((c) => c.id === categoryId) || null;
  }
  try {
    const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.warn("[Database] getCategoryById failed, falling back to mock catalog:", error);
    return mockCategories.find((c) => c.id === categoryId) || null;
  }
}

// Combo queries
export async function getAllCombos() {
  const db = await getDb();
  if (!db) return mockCombos;
  try {
    return await db.select().from(combos);
  } catch (error) {
    console.warn("[Database] getAllCombos failed, falling back to mock catalog:", error);
    return mockCombos;
  }
}

export async function getComboById(comboId: number) {
  const db = await getDb();
  if (!db) {
    return mockCombos.find((c) => c.id === comboId) || null;
  }
  try {
    const result = await db.select().from(combos).where(eq(combos.id, comboId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.warn("[Database] getComboById failed, falling back to mock catalog:", error);
    return mockCombos.find((c) => c.id === comboId) || null;
  }
}

// Brand queries
export async function getAllBrands() {
  const db = await getDb();
  if (!db) return mockBrands;
  try {
    return await db.select().from(brands);
  } catch (error) {
    console.warn("[Database] getAllBrands failed, falling back to mock catalog:", error);
    return mockBrands;
  }
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) {
    return inMemoryCartItems.filter((item) => item.userId === userId);
  }
  try {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  } catch (error) {
    console.warn("[Database] getCartItems failed, falling back to in-memory store:", error);
    return inMemoryCartItems.filter((item) => item.userId === userId);
  }
}

export async function addToCart(
  userId: number,
  productId: number | null,
  comboId: number | null,
  quantity: number,
  price: number
) {
  const db = await getDb();
  const fallback = () => {
    const existing = inMemoryCartItems.find(
      (item) => item.userId === userId && item.productId === (productId ?? null) && item.comboId === (comboId ?? null)
    );
    if (existing) {
      existing.quantity += quantity;
      existing.updatedAt = new Date();
      return existing;
    }

    const newItem: CartItem = {
      id: nextCartItemId++,
      userId,
      productId: productId ?? null,
      comboId: comboId ?? null,
      quantity,
      price: price.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryCartItems.push(newItem);
    return newItem;
  };

  if (!db) {
    return fallback();
  }

  try {
    const result = await db.insert(cartItems).values({
      userId,
      productId,
      comboId,
      quantity,
      price: price.toString(),
    });
    return result;
  } catch (error) {
    console.warn("[Database] addToCart failed, falling back to in-memory store:", error);
    return fallback();
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const db = await getDb();
  const fallback = () => {
    const item = inMemoryCartItems.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity = quantity;
      item.updatedAt = new Date();
    }
    return item;
  };

  if (!db) {
    return fallback();
  }

  try {
    return await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  } catch (error) {
    console.warn("[Database] updateCartItemQuantity failed, falling back to in-memory store:", error);
    return fallback();
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  const fallback = () => {
    inMemoryCartItems = inMemoryCartItems.filter((i) => i.id !== cartItemId);
    return true;
  };

  if (!db) {
    return fallback();
  }

  try {
    return await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } catch (error) {
    console.warn("[Database] removeFromCart failed, falling back to in-memory store:", error);
    return fallback();
  }
}

export async function clearCart(userId: number) {
  const db = await getDb();
  const fallback = () => {
    inMemoryCartItems = inMemoryCartItems.filter((i) => i.userId !== userId);
    return true;
  };

  if (!db) {
    return fallback();
  }

  try {
    return await db.delete(cartItems).where(eq(cartItems.userId, userId));
  } catch (error) {
    console.warn("[Database] clearCart failed, falling back to in-memory store:", error);
    return fallback();
  }
}
