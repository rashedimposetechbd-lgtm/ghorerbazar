import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { cmsDataStore, type ProductItem } from "./dataStore";

export const adminRouter = router({
  // 1. Admin Authentication
  auth: router({
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(({ input }) => {
        const user = cmsDataStore.authenticateAdmin(input.email, input.password);
        if (!user) {
          throw new Error("Invalid email or password. You can use admin@ghorerbazar.com / admin123456");
        }
        return {
          success: true,
          user,
          token: `admin-token-${user.id}-${Date.now()}`,
        };
      }),

    demoLogin: publicProcedure
      .input(
        z.object({
          role: z.enum([
            "super_admin",
            "admin",
            "manager",
            "product_manager",
            "order_manager",
            "content_manager",
            "marketing_manager",
          ]),
        })
      )
      .mutation(({ input }) => {
        const allUsers = cmsDataStore.getAdminUsers();
        let target = allUsers.find((u) => u.role === input.role) || allUsers[0];
        return {
          success: true,
          user: target,
          token: `admin-token-${target.id}-${Date.now()}`,
        };
      }),
  }),

  // 2. Dashboard Analytics & Reports
  dashboard: router({
    stats: publicProcedure.query(() => {
      return cmsDataStore.getDashboardStats();
    }),
  }),

  // 3. Products Management
  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            categoryId: z.number().optional(),
            brandId: z.number().optional(),
            status: z.enum(["all", "active", "draft", "inactive"]).optional(),
            stockStatus: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).optional(),
            flag: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        let list = cmsDataStore.getProducts();

        if (input?.search) {
          const q = input.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              (p.barcode && p.barcode.toLowerCase().includes(q))
          );
        }

        if (input?.categoryId) {
          list = list.filter((p) => p.categoryId === input.categoryId);
        }

        if (input?.brandId) {
          list = list.filter((p) => p.brandId === input.brandId);
        }

        if (input?.status && input.status !== "all") {
          list = list.filter((p) => p.status === input.status);
        }

        if (input?.stockStatus && input.stockStatus !== "all") {
          if (input.stockStatus === "out_of_stock") {
            list = list.filter((p) => p.stock === 0);
          } else if (input.stockStatus === "low_stock") {
            list = list.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
          } else if (input.stockStatus === "in_stock") {
            list = list.filter((p) => p.stock > p.lowStockThreshold);
          }
        }

        if (input?.flag) {
          const flagKey = input.flag as keyof ProductItem;
          list = list.filter((p) => Boolean(p[flagKey]));
        }

        return list;
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const prod = cmsDataStore.getProductById(input.id);
        if (!prod) throw new Error("Product not found");
        return prod;
      }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(2),
          slug: z.string().optional(),
          sku: z.string().optional(),
          barcode: z.string().optional(),
          brandId: z.number().optional(),
          categoryId: z.number(),
          subcategoryId: z.number().optional(),
          shortDescription: z.string().optional(),
          fullDescription: z.string().optional(),
          price: z.number().min(0),
          discountPrice: z.number().nullable().optional(),
          discountPercentage: z.number().nullable().optional(),
          costPrice: z.number().optional(),
          stock: z.number().min(0),
          lowStockThreshold: z.number().optional(),
          weight: z.string().optional(),
          unit: z.string().default("kg"),
          videoUrl: z.string().optional(),
          imageUrl: z.string().min(1),
          galleryImages: z.array(z.string()).default([]),
          variants: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                sku: z.string(),
                price: z.number(),
                salePrice: z.number().optional(),
                stock: z.number(),
                weight: z.string().optional(),
              })
            )
            .default([]),
          isNewArrival: z.boolean().default(false),
          isBestSelling: z.boolean().default(false),
          isTrending: z.boolean().default(false),
          isFeatured: z.boolean().default(true),
          isBestCollection: z.boolean().default(false),
          isOffered: z.boolean().default(false),
          isFreeDelivery: z.boolean().default(false),
          isPreOrder: z.boolean().default(false),
          isOrganic: z.boolean().default(true),
          isFlashSale: z.boolean().default(false),
          hasLimitedTimeOffer: z.boolean().default(false),
          offerEndsAt: z.string().nullable().optional(),
          status: z.enum(["active", "draft", "inactive"]).default("active"),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveProduct(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteProduct(input.id) };
      }),

    bulkUpdate: publicProcedure
      .input(
        z.object({
          ids: z.array(z.number()),
          status: z.enum(["active", "draft", "inactive"]).optional(),
          priceModifierPercentage: z.number().optional(),
          discountPercentage: z.number().optional(),
          categoryId: z.number().optional(),
          brandId: z.number().optional(),
          delete: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.bulkUpdateProducts(input.ids, input);
      }),
  }),

  // 4. Categories & Subcategories
  categories: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getCategories();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const cat = cmsDataStore.getCategoryById(input.id);
        if (!cat) throw new Error("Category not found");
        return cat;
      }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(2),
          slug: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          icon: z.string().optional(),
          bannerUrl: z.string().optional(),
          sortOrder: z.number().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          subcategories: z
            .array(
              z.object({
                id: z.number(),
                categoryId: z.number(),
                name: z.string(),
                slug: z.string(),
                description: z.string(),
                sortOrder: z.number(),
                isActive: z.boolean(),
              })
            )
            .optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveCategory(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteCategory(input.id) };
      }),
  }),

  // 5. Brands
  brands: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getBrands();
    }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(2),
          slug: z.string().optional(),
          logoUrl: z.string().nullable().optional(),
          bannerUrl: z.string().optional(),
          description: z.string().optional(),
          websiteUrl: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveBrand(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteBrand(input.id) };
      }),
  }),

  // 6. Sliders & Hero Banners
  sliders: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getSliders();
    }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(2),
          subtitle: z.string().optional(),
          buttonText: z.string().optional(),
          buttonUrl: z.string().optional(),
          desktopImageUrl: z.string().min(1),
          mobileImageUrl: z.string().optional(),
          categoryId: z.number().optional(),
          productId: z.number().optional(),
          priority: z.number().optional(),
          isActive: z.boolean().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveSlider(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteSlider(input.id) };
      }),
  }),

  // 7. Homepage Layout Builder
  homepage: router({
    getSections: publicProcedure.query(() => {
      return cmsDataStore.getHomepageSections();
    }),

    updateSections: publicProcedure
      .input(
        z.array(
          z.object({
            id: z.string(),
            sectionKey: z.string(),
            title: z.string(),
            subtitle: z.string().optional(),
            isEnabled: z.boolean(),
            sortOrder: z.number(),
            productLimit: z.number(),
            categoryId: z.number().optional(),
            background: z.string().optional(),
          })
        )
      )
      .mutation(({ input }) => {
        return cmsDataStore.updateHomepageSections(input);
      }),
  }),

  // 8. Flash Sale
  flashSale: router({
    get: publicProcedure.query(() => {
      return cmsDataStore.getFlashSale();
    }),

    update: publicProcedure
      .input(
        z.object({
          name: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          productIds: z.array(z.number()).optional(),
          discountPercentage: z.number().optional(),
          quantityLimit: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.updateFlashSale(input);
      }),
  }),

  // 9. Coupons & Discounts
  coupons: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getCoupons();
    }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          code: z.string().min(2),
          discountType: z.enum(["percentage", "fixed"]),
          discountValue: z.number().min(1),
          minOrderAmount: z.number().default(0),
          maxDiscount: z.number().optional(),
          usageLimit: z.number().default(100),
          perCustomerLimit: z.number().default(1),
          expiryDate: z.string(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveCoupon(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteCoupon(input.id) };
      }),

    validate: publicProcedure
      .input(z.object({ code: z.string(), cartSubtotal: z.number() }))
      .mutation(({ input }) => {
        const coupons = cmsDataStore.getCoupons();
        const code = input.code.toUpperCase().trim();
        const coupon = coupons.find((c) => c.code === code && c.isActive);

        if (!coupon) {
          return { valid: false, message: "Invalid coupon code." };
        }

        if (new Date(coupon.expiryDate).getTime() < Date.now()) {
          return { valid: false, message: "This coupon code has expired." };
        }

        if (input.cartSubtotal < coupon.minOrderAmount) {
          return {
            valid: false,
            message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}.`,
          };
        }

        let discount =
          coupon.discountType === "percentage"
            ? Math.round((input.cartSubtotal * coupon.discountValue) / 100)
            : coupon.discountValue;

        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }

        return {
          valid: true,
          coupon,
          discountAmount: discount,
          message: `Coupon applied! You save ৳${discount}.`,
        };
      }),
  }),

  // 10. Orders & Invoices
  orders: router({
    list: publicProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            status: z.string().optional(),
            paymentStatus: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        let orders = cmsDataStore.getOrders();

        if (input?.search) {
          const q = input.search.toLowerCase();
          orders = orders.filter(
            (o) =>
              o.orderNumber.toLowerCase().includes(q) ||
              o.customerName.toLowerCase().includes(q) ||
              o.customerPhone.includes(q)
          );
        }

        if (input?.status && input.status !== "all") {
          orders = orders.filter((o) => o.orderStatus === input.status);
        }

        if (input?.paymentStatus && input.paymentStatus !== "all") {
          orders = orders.filter((o) => o.paymentStatus === input.paymentStatus);
        }

        return orders;
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const order = cmsDataStore.getOrderById(input.id);
        if (!order) throw new Error("Order not found");
        return order;
      }),

    updateStatus: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          orderStatus: z.enum([
            "pending",
            "confirmed",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "returned",
            "refunded",
          ]),
          paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const order = cmsDataStore.updateOrderStatus(
          input.orderId,
          input.orderStatus,
          input.paymentStatus,
          input.notes
        );
        if (!order) throw new Error("Order not found");
        return order;
      }),

    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(2),
          customerPhone: z.string().min(10),
          customerEmail: z.string().optional(),
          shippingAddress: z.string().min(5),
          division: z.string().default("Dhaka"),
          district: z.string().default("Dhaka"),
          upazila: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              productImage: z.string(),
              price: z.number(),
              quantity: z.number().min(1),
              variantName: z.string().optional(),
              total: z.number(),
            })
          ),
          subtotal: z.number(),
          discount: z.number().default(0),
          couponCode: z.string().optional(),
          couponDiscount: z.number().default(0),
          shippingFee: z.number(),
          tax: z.number().default(0),
          total: z.number(),
          paymentMethod: z.enum(["cod", "bkash", "nagad", "sslcommerz", "card"]),
          paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
          orderStatus: z
            .enum([
              "pending",
              "confirmed",
              "processing",
              "packed",
              "shipped",
              "out_for_delivery",
              "delivered",
              "cancelled",
              "returned",
              "refunded",
            ])
            .default("pending"),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.createOrder(input);
      }),
  }),

  // 11. Customers
  customers: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(({ input }) => {
        let list = cmsDataStore.getCustomers();
        if (input?.search) {
          const q = input.search.toLowerCase();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.phone.includes(q) ||
              c.email.toLowerCase().includes(q)
          );
        }
        return list;
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["active", "disabled"]).optional(),
          notes: z.string().optional(),
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        const res = cmsDataStore.updateCustomer(id, data);
        if (!res) throw new Error("Customer not found");
        return res;
      }),
  }),

  // 12. Website Settings
  settings: router({
    get: publicProcedure.query(() => {
      return cmsDataStore.getSettings();
    }),

    update: publicProcedure
      .input(
        z.object({
          siteName: z.string().optional(),
          siteTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          siteLogo: z.string().optional(),
          darkLogo: z.string().optional(),
          siteFavicon: z.string().optional(),
          siteEmail: z.string().optional(),
          sitePhone: z.string().optional(),
          siteWhatsApp: z.string().optional(),
          siteAddress: z.string().optional(),
          businessHours: z.string().optional(),
          googleMapsUrl: z.string().optional(),
          facebookUrl: z.string().optional(),
          instagramUrl: z.string().optional(),
          youtubeUrl: z.string().optional(),
          tiktokUrl: z.string().optional(),
          messengerUrl: z.string().optional(),
          shippingInsideDhaka: z.number().optional(),
          shippingOutsideDhaka: z.number().optional(),
          freeShippingThreshold: z.number().optional(),
          currency: z.string().optional(),
          currencySymbol: z.string().optional(),
          taxPercentage: z.number().optional(),
          maintenanceMode: z.boolean().optional(),
          defaultLanguage: z.string().optional(),
          announcementText: z.string().optional(),
          announcementEnabled: z.boolean().optional(),
          headerHotlineEnabled: z.boolean().optional(),
          headerWhatsAppEnabled: z.boolean().optional(),
          headerWishlistEnabled: z.boolean().optional(),
          headerCartEnabled: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.updateSettings(input);
      }),
  }),

  // 13. Navigation Menu Items
  navMenu: router({
    get: publicProcedure.query(() => {
      return cmsDataStore.getNavMenuItems();
    }),

    update: publicProcedure
      .input(
        z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            url: z.string(),
            type: z.enum(["category", "page", "custom"]),
            targetId: z.union([z.number(), z.string()]).optional(),
            order: z.number(),
            isEnabled: z.boolean(),
          })
        )
      )
      .mutation(({ input }) => {
        return cmsDataStore.updateNavMenuItems(input);
      }),
  }),

  // 14. Shipping & Payment
  shippingPayment: router({
    getShippingZones: publicProcedure.query(() => {
      return cmsDataStore.getShippingZones();
    }),

    updateShippingZones: publicProcedure
      .input(
        z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            deliveryCharge: z.number(),
            deliveryTime: z.string(),
            freeDeliveryThreshold: z.number(),
            isActive: z.boolean(),
          })
        )
      )
      .mutation(({ input }) => {
        return cmsDataStore.updateShippingZones(input);
      }),

    getPaymentGateways: publicProcedure.query(() => {
      return cmsDataStore.getPaymentGateways();
    }),

    updatePaymentGateways: publicProcedure
      .input(
        z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            isEnabled: z.boolean(),
            instructions: z.string().optional(),
            mode: z.enum(["test", "live"]),
            merchantNumber: z.string().optional(),
          })
        )
      )
      .mutation(({ input }) => {
        return cmsDataStore.updatePaymentGateways(input);
      }),
  }),

  // 15. CMS Pages
  pages: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getPages();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => {
        const page = cmsDataStore.getPageBySlug(input.slug);
        if (!page) throw new Error("Page not found");
        return page;
      }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(2),
          slug: z.string().optional(),
          content: z.string(),
          isPublished: z.boolean().default(true),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.savePage(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deletePage(input.id) };
      }),
  }),

  // 16. Media Library
  media: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getMediaFiles();
    }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteMediaFile(input.id) };
      }),
  }),

  // 17. Admin Users & RBAC
  users: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getAdminUsers();
    }),

    save: publicProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().optional(),
          role: z.enum([
            "super_admin",
            "admin",
            "manager",
            "product_manager",
            "order_manager",
            "content_manager",
            "marketing_manager",
          ]),
          permissions: z.array(z.string()).default([]),
          isActive: z.boolean().default(true),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return cmsDataStore.saveAdminUser(input);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return { success: cmsDataStore.deleteAdminUser(input.id) };
      }),
  }),

  // 18. Activity Logs
  activityLogs: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getActivityLogs();
    }),
  }),

  // 19. Admin Notifications
  notifications: router({
    list: publicProcedure.query(() => {
      return cmsDataStore.getNotifications();
    }),

    markRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        cmsDataStore.markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: publicProcedure.mutation(() => {
      cmsDataStore.markAllNotificationsRead();
      return { success: true };
    }),
  }),
});
