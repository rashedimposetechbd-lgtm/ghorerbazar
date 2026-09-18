import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product procedures
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.categoryId);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchProducts(input.query);
      }),

    topSelling: publicProcedure
      .input(z.object({ limit: z.number().default(8) }))
      .query(async ({ input }) => {
        return db.getTopSellingProducts(input.limit);
      }),

    newArrivals: publicProcedure
      .input(z.object({ limit: z.number().default(8) }))
      .query(async ({ input }) => {
        return db.getNewArrivalProducts(input.limit);
      }),
  }),

  // Category procedures
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCategoryById(input.id);
      }),
  }),

  // Combo procedures
  combos: router({
    list: publicProcedure.query(async () => {
      return db.getAllCombos();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getComboById(input.id);
      }),
  }),

  // Brand procedures
  brands: router({
    list: publicProcedure.query(async () => {
      return db.getAllBrands();
    }),
  }),

  // Cart procedures
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      
      // Enrich cart items with product/combo details
      const enrichedItems = await Promise.all(items.map(async (item) => {
        if (item.productId) {
          const product = await db.getProductById(item.productId);
          return { ...item, product, combo: null };
        } else if (item.comboId) {
          const combo = await db.getComboById(item.comboId);
          return { ...item, combo, product: null };
        }
        return item;
      }));
      
      return enrichedItems;
    }),

    add: protectedProcedure
      .input(z.object({
        productId: z.number().optional(),
        comboId: z.number().optional(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        let price = 0;
        
        if (input.productId) {
          const product = await db.getProductById(input.productId);
          if (!product) throw new Error("Product not found");
          price = parseFloat(product.discountPrice || product.price);
        } else if (input.comboId) {
          const combo = await db.getComboById(input.comboId);
          if (!combo) throw new Error("Combo not found");
          price = parseFloat(combo.price);
        } else {
          throw new Error("Either productId or comboId must be provided");
        }

        return db.addToCart(
          ctx.user.id,
          input.productId || null,
          input.comboId || null,
          input.quantity,
          price
        );
      }),

    updateQuantity: protectedProcedure
      .input(z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input }) => {
        return db.updateCartItemQuantity(input.cartItemId, input.quantity);
      }),

    remove: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        return db.removeFromCart(input.cartItemId);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return db.clearCart(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
