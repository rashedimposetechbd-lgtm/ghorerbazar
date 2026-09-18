import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Product Queries', () => {
  it('should retrieve all products', async () => {
    const products = await db.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('should retrieve products by category', async () => {
    const products = await db.getProductsByCategory(1);
    expect(Array.isArray(products)).toBe(true);
  });

  it('should retrieve a product by ID', async () => {
    const product = await db.getProductById(1);
    if (product) {
      expect(product.id).toBe(1);
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
    }
  });

  it('should search products by name', async () => {
    const results = await db.searchProducts('Honey');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should retrieve top selling products', async () => {
    const products = await db.getTopSellingProducts(5);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeLessThanOrEqual(5);
  });

  it('should retrieve new arrival products', async () => {
    const products = await db.getNewArrivalProducts(5);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeLessThanOrEqual(5);
  });
});

describe('Category Queries', () => {
  it('should retrieve all categories', async () => {
    const categories = await db.getAllCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should retrieve a category by ID', async () => {
    const category = await db.getCategoryById(1);
    if (category) {
      expect(category.id).toBe(1);
      expect(category.name).toBeDefined();
    }
  });
});

describe('Combo Queries', () => {
  it('should retrieve all combos', async () => {
    const combos = await db.getAllCombos();
    expect(Array.isArray(combos)).toBe(true);
  });

  it('should retrieve a combo by ID', async () => {
    const combo = await db.getComboById(1);
    if (combo) {
      expect(combo.id).toBe(1);
      expect(combo.name).toBeDefined();
      expect(combo.price).toBeDefined();
    }
  });
});

describe('Brand Queries', () => {
  it('should retrieve all brands', async () => {
    const brands = await db.getAllBrands();
    expect(Array.isArray(brands)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });
});
