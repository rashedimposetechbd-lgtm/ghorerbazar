import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { cmsDataStore } from "./dataStore";
import { adminRouter } from "./adminRouter";

export const appRouter = router({
  system: systemRouter,

  // Mounted Admin Panel Router
  admin: adminRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Storefront Public Dynamic Settings & Content
  storefront: router({
    settings: publicProcedure.query(() => {
      return cmsDataStore.getSettings();
    }),
    sliders: publicProcedure.query(() => {
      return cmsDataStore.getSliders().filter((s) => s.isActive);
    }),
    sections: publicProcedure.query(() => {
      return cmsDataStore.getHomepageSections().filter((s) => s.isEnabled);
    }),
    flashSale: publicProcedure.query(() => {
      return cmsDataStore.getFlashSale();
    }),
    navMenu: publicProcedure.query(() => {
      return cmsDataStore.getNavMenuItems().filter((m) => m.isEnabled);
    }),
    shippingZones: publicProcedure.query(() => {
      return cmsDataStore.getShippingZones().filter((z) => z.isActive);
    }),
    paymentGateways: publicProcedure.query(() => {
      return cmsDataStore.getPaymentGateways().filter((p) => p.isEnabled);
    }),
    pageBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => {
        return cmsDataStore.getPageBySlug(input.slug) || null;
      }),
  }),

  // Product procedures (connected to live CMS data store with fallback)
  products: router({
    list: publicProcedure.query(async () => {
      const liveProducts = cmsDataStore.getProducts().filter((p) => p.status === "active");
      if (liveProducts.length > 0) {
        return liveProducts.map((p) => ({
          ...p,
          price: String(p.price),
          discountPrice: p.discountPrice ? String(p.discountPrice) : null,
          discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
          description: p.shortDescription || p.fullDescription || "",
        }));
      }
      return db.getAllProducts();
    }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        const liveProducts = cmsDataStore
          .getProducts()
          .filter((p) => p.categoryId === input.categoryId && p.status === "active");
        if (liveProducts.length > 0) {
          return liveProducts.map((p) => ({
            ...p,
            price: String(p.price),
            discountPrice: p.discountPrice ? String(p.discountPrice) : null,
            discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
            description: p.shortDescription || p.fullDescription || "",
          }));
        }
        return db.getProductsByCategory(input.categoryId);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const p = cmsDataStore.getProductById(input.id);
        if (p) {
          return {
            ...p,
            price: String(p.price),
            discountPrice: p.discountPrice ? String(p.discountPrice) : null,
            discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
            description: p.shortDescription || p.fullDescription || "",
          };
        }
        return db.getProductById(input.id);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const q = input.query.toLowerCase();
        const live = cmsDataStore
          .getProducts()
          .filter((p) => p.status === "active" && p.name.toLowerCase().includes(q));
        if (live.length > 0) {
          return live.map((p) => ({
            ...p,
            price: String(p.price),
            discountPrice: p.discountPrice ? String(p.discountPrice) : null,
            discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
            description: p.shortDescription || p.fullDescription || "",
          }));
        }
        return db.searchProducts(input.query);
      }),

    topSelling: publicProcedure
      .input(z.object({ limit: z.number().default(8) }))
      .query(async ({ input }) => {
        const live = cmsDataStore
          .getProducts()
          .filter((p) => p.status === "active" && p.isBestSelling)
          .slice(0, input.limit);
        if (live.length > 0) {
          return live.map((p) => ({
            ...p,
            price: String(p.price),
            discountPrice: p.discountPrice ? String(p.discountPrice) : null,
            discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
            description: p.shortDescription || p.fullDescription || "",
          }));
        }
        return db.getTopSellingProducts(input.limit);
      }),

    newArrivals: publicProcedure
      .input(z.object({ limit: z.number().default(8) }))
      .query(async ({ input }) => {
        const live = cmsDataStore
          .getProducts()
          .filter((p) => p.status === "active" && p.isNewArrival)
          .slice(0, input.limit);
        if (live.length > 0) {
          return live.map((p) => ({
            ...p,
            price: String(p.price),
            discountPrice: p.discountPrice ? String(p.discountPrice) : null,
            discountPercentage: p.discountPercentage ? String(p.discountPercentage) : null,
            description: p.shortDescription || p.fullDescription || "",
          }));
        }
        return db.getNewArrivalProducts(input.limit);
      }),
  }),

  // Category procedures
  categories: router({
    list: publicProcedure.query(async () => {
      const liveCats = cmsDataStore.getCategories().filter((c) => c.isActive);
      if (liveCats.length > 0) {
        return liveCats;
      }
      return db.getAllCategories();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const cat = cmsDataStore.getCategoryById(input.id);
        if (cat) return cat;
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
      const liveBrands = cmsDataStore.getBrands().filter((b) => b.isActive);
      if (liveBrands.length > 0) {
        return liveBrands;
      }
      return db.getAllBrands();
    }),
  }),

  // Cart procedures
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);

      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          if (item.productId) {
            const product =
              cmsDataStore.getProductById(item.productId) || (await db.getProductById(item.productId));
            return {
              ...item,
              product: product
                ? {
                    ...product,
                    price: String(product.price),
                    discountPrice: (product as any).discountPrice
                      ? String((product as any).discountPrice)
                      : null,
                    description: (product as any).shortDescription || (product as any).description || "",
                  }
                : null,
              combo: null,
            };
          } else if (item.comboId) {
            const combo = await db.getComboById(item.comboId);
            return { ...item, combo, product: null };
          }
          return item;
        })
      );

      return enrichedItems;
    }),

    add: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          comboId: z.number().optional(),
          quantity: z.number().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let price = 0;

        if (input.productId) {
          const product =
            cmsDataStore.getProductById(input.productId) || (await db.getProductById(input.productId));
          if (!product) throw new Error("Product not found");
          price = parseFloat(String((product as any).discountPrice || product.price));
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
      .input(
        z.object({
          cartItemId: z.number(),
          quantity: z.number().min(1),
        })
      )
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
