import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });

const categories = [
  { name: 'Oil & Ghee', slug: 'oil-ghee' },
  { name: 'Honey', slug: 'honey' },
  { name: 'Dates', slug: 'dates' },
  { name: 'Spices', slug: 'spices' },
  { name: 'Nuts & Seeds', slug: 'nuts-seeds' },
  { name: 'Beverage', slug: 'beverage' },
  { name: 'Rice', slug: 'rice' },
  { name: 'Flours & Lentils', slug: 'flours-lentils' },
  { name: 'Organic', slug: 'organic' },
  { name: 'Functional Food', slug: 'functional-food' },
];

const products = [
  { name: 'Black Seed Honey 1kg', categoryName: 'Honey', price: 1600, discountPrice: 1500, stock: 50, isBestSelling: true },
  { name: 'Sundarban Honey 1kg', categoryName: 'Honey', price: 2500, discountPrice: null, stock: 30, isBestSelling: false },
  { name: 'Honey Nuts 800gm', categoryName: 'Honey', price: 1200, discountPrice: 1056, stock: 25, isBestSelling: true },
  { name: 'African Organic Wild Honey 500g', categoryName: 'Honey', price: 1200, discountPrice: 1056, stock: 20, isBestSelling: false },
  { name: 'Black Seed Honey 500g', categoryName: 'Honey', price: 900, discountPrice: 846, stock: 40, isBestSelling: false },
  { name: 'Natural Honeycomb 1kg', categoryName: 'Honey', price: 3000, discountPrice: 2700, stock: 15, isBestSelling: false },
  { name: 'Lychee Flower Honey 500g', categoryName: 'Honey', price: 1100, discountPrice: 1012, stock: 35, isBestSelling: false },
  { name: 'Kashmiri Sidr Honey 800g', categoryName: 'Honey', price: 2200, discountPrice: null, stock: 20, isNewArrival: true },
  { name: 'Deshi Mustard Oil 5 liter', categoryName: 'Oil & Ghee', price: 1700, discountPrice: 1650, stock: 40, isBestSelling: true },
  { name: 'Gawa Ghee 1kg', categoryName: 'Oil & Ghee', price: 1800, discountPrice: null, stock: 35, isBestSelling: true },
  { name: 'Gawa Ghee 500gm', categoryName: 'Oil & Ghee', price: 950, discountPrice: null, stock: 50, isBestSelling: false },
  { name: 'Black Cumin Seed Oil 500ml', categoryName: 'Oil & Ghee', price: 800, discountPrice: null, stock: 30, isBestSelling: false },
  { name: 'Ajwa Premium Fresh Dates 1kg', categoryName: 'Dates', price: 2500, discountPrice: 2000, stock: 25, isBestSelling: false },
  { name: 'Ajwa Premium Fresh Dates 500gm', categoryName: 'Dates', price: 1500, discountPrice: 1200, stock: 30, isBestSelling: false },
  { name: 'Sukkari Mufattal Malaki Dates 1kg', categoryName: 'Dates', price: 2200, discountPrice: 1980, stock: 20, isBestSelling: false },
  { name: 'Egyptian Medjool Large 1kg', categoryName: 'Dates', price: 2800, discountPrice: null, stock: 15, isBestSelling: false },
  { name: 'Chili (Morich) Powder 500g', categoryName: 'Spices', price: 400, discountPrice: null, stock: 60, isBestSelling: false },
  { name: 'Turmeric (Holud) Powder 500g', categoryName: 'Spices', price: 350, discountPrice: null, stock: 70, isBestSelling: false },
  { name: 'Kala Bhuna Masala 500gm', categoryName: 'Spices', price: 500, discountPrice: 450, stock: 40, isBestSelling: false },
  { name: 'Coriander Powder 500gm', categoryName: 'Spices', price: 300, discountPrice: null, stock: 50, isBestSelling: false },
  { name: 'Mixed Nuts 500g', categoryName: 'Nuts & Seeds', price: 800, discountPrice: null, stock: 30, isBestSelling: false },
  { name: 'Almonds 500g', categoryName: 'Nuts & Seeds', price: 1200, discountPrice: null, stock: 25, isBestSelling: false },
  { name: 'Basmati Rice 5kg', categoryName: 'Rice', price: 800, discountPrice: null, stock: 100, isBestSelling: false },
  { name: 'Jasmine Rice 5kg', categoryName: 'Rice', price: 700, discountPrice: null, stock: 80, isBestSelling: false },
  { name: 'Rice Flour (Chaler Gura) 2kg', categoryName: 'Flours & Lentils', price: 250, discountPrice: null, stock: 50, isBestSelling: false },
  { name: 'Laal Atta 2kg', categoryName: 'Flours & Lentils', price: 280, discountPrice: null, stock: 60, isBestSelling: false },
  { name: 'Mashkalai Dal 1 Kg', categoryName: 'Flours & Lentils', price: 350, discountPrice: null, stock: 40, isBestSelling: false },
  { name: 'Organic Matcha Green Tea 100gm', categoryName: 'Beverage', price: 600, discountPrice: null, stock: 20, isBestSelling: false },
  { name: 'Spirulina Powder 250 gm', categoryName: 'Beverage', price: 1500, discountPrice: null, stock: 15, isNewArrival: true },
  { name: 'Organic Spirulina Powder 250 gm', categoryName: 'Organic', price: 1500, discountPrice: null, stock: 15, isNewArrival: true },
];

const combos = [
  { name: 'Ghee (Half Kg) & Lychee Honey Sachet Combo', price: 1000, originalPrice: 1123.5, savingsPercentage: 12.3, productNames: ['Gawa Ghee 500gm', 'Lychee Flower Honey 500g'], stock: 50 },
  { name: 'Ghee (1 Kg) & Lychee Honey Sachet Combo', price: 1800, originalPrice: 2048, savingsPercentage: 11.8, productNames: ['Gawa Ghee 1kg', 'Lychee Flower Honey 500g'], stock: 40 },
  { name: 'Shahi Masala & Lychee Honey Sachet Combo', price: 1500, originalPrice: 1738, savingsPercentage: 13.8, productNames: ['Kala Bhuna Masala 500gm', 'Lychee Flower Honey 500g'], stock: 35 },
  { name: 'Kala Bhuna & Lychee Honey Sachet Combo', price: 1500, originalPrice: 1738, savingsPercentage: 13.8, productNames: ['Kala Bhuna Masala 500gm', 'Lychee Flower Honey 500g'], stock: 30 },
  { name: 'Mustard Oil & Lychee Honey Sachet Combo', price: 1750, originalPrice: 1937.5, savingsPercentage: 9.8, productNames: ['Deshi Mustard Oil 5 liter', 'Lychee Flower Honey 500g'], stock: 25 },
  { name: 'Black Cumin Seed Oil & Lychee Honey Sachet Combo', price: 2500, originalPrice: 2700, savingsPercentage: 8.8, productNames: ['Black Cumin Seed Oil 500ml', 'Lychee Flower Honey 500g'], stock: 20 },
];

async function seed() {
  try {
    console.log('Inserting categories...');
    for (const cat of categories) {
      await db.insert(schema.categories).values(cat).onDuplicateKeyUpdate({ set: cat });
    }

    const allCategories = await db.select().from(schema.categories);
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('Inserting products...');
    const productMap = {};
    for (const prod of products) {
      const categoryId = categoryMap[prod.categoryName];
      const discountPercentage = prod.discountPrice 
        ? ((prod.price - prod.discountPrice) / prod.price * 100).toFixed(2)
        : null;

      const [result] = await db.insert(schema.products).values({
        name: prod.name,
        categoryId,
        price: prod.price.toString(),
        discountPrice: prod.discountPrice ? prod.discountPrice.toString() : null,
        discountPercentage: discountPercentage ? discountPercentage.toString() : null,
        stock: prod.stock,
        isBestSelling: prod.isBestSelling,
        isNewArrival: prod.isNewArrival,
      });
      
      const inserted = await db.select().from(schema.products).where(eq(schema.products.name, prod.name)).limit(1);
      if (inserted.length > 0) {
        productMap[prod.name] = inserted[0].id;
      }
    }

    console.log('Inserting combos...');
    for (const combo of combos) {
      const productIds = combo.productNames.map(name => productMap[name]).filter(id => id);
      
      await db.insert(schema.combos).values({
        name: combo.name,
        price: combo.price.toString(),
        originalPrice: combo.originalPrice.toString(),
        savingsPercentage: combo.savingsPercentage.toString(),
        productIds,
        stock: combo.stock,
      });
    }

    console.log('Inserting brands...');
    const brands = [
      { name: 'Ghorerbazar' },
      { name: 'Glarvest' },
      { name: 'Khejuri' },
      { name: 'Shosti food' },
      { name: 'Honeyraj' },
    ];
    for (const brand of brands) {
      await db.insert(schema.brands).values(brand).onDuplicateKeyUpdate({ set: brand });
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
