import initialDataRaw from "../data/initialStoreData";

const STORAGE_KEY = "gb_store_data_v2";

interface FullStoreData {
  settings: any;
  navMenuItems: any[];
  categories: any[];
  brands: any[];
  products: any[];
  sliders: any[];
  homepageSections: any[];
  flashSale: any;
  coupons: any[];
  orders: any[];
  customers: any[];
  shippingZones: any[];
  paymentGateways: any[];
  pages: any[];
  mediaFiles: any[];
  adminUsers: any[];
  activityLogs: any[];
  notifications: any[];
}

function getStoreData(): FullStoreData {
  if (typeof window === "undefined") {
    return (initialDataRaw as unknown) as FullStoreData;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load local store data, using default", e);
  }
  return (initialDataRaw as unknown) as FullStoreData;
}

function saveStoreData(data: FullStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to persist store data to localStorage", e);
  }
}

export function executeProcedure(procName: string, input: any): any {
  const store = getStoreData();

  switch (procName) {
    // -------------------------------------------------------------
    // System & Auth
    // -------------------------------------------------------------
    case "system.health":
      return { status: "ok", mode: "client-fallback" };

    case "auth.me": {
      const admin = typeof window !== "undefined" ? localStorage.getItem("gb_admin_user") : null;
      if (admin) {
        try {
          return JSON.parse(admin);
        } catch {}
      }
      return null;
    }

    case "auth.logout":
      return { success: true };

    case "admin.auth.login":
    case "admin.auth.demoLogin": {
      const fallbackUser = {
        id: 1,
        name: "Super Administrator",
        email: input?.email || "admin@ghorerbazar.com",
        role: input?.role || "super_admin",
        permissions: ["all"],
        isActive: true,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        lastLoginAt: new Date().toISOString(),
      };
      return {
        success: true,
        user: fallbackUser,
        token: `admin-token-standalone-${Date.now()}`,
      };
    }

    // -------------------------------------------------------------
    // Dashboard Stats
    // -------------------------------------------------------------
    case "admin.dashboard.stats": {
      const orders = store.orders || [];
      const products = store.products || [];
      const customers = store.customers || [];

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
      const lowStockProducts = products.filter((p) => p.stock <= (p.lowStockThreshold || 5));

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        recentOrders: orders.slice(0, 10),
        lowStockProducts: lowStockProducts.slice(0, 6),
        salesChart: [
          { date: "Sat", revenue: 24500, orders: 12 },
          { date: "Sun", revenue: 38200, orders: 19 },
          { date: "Mon", revenue: 31000, orders: 15 },
          { date: "Tue", revenue: 45600, orders: 22 },
          { date: "Wed", revenue: 52000, orders: 26 },
          { date: "Thu", revenue: 49800, orders: 24 },
          { date: "Fri", revenue: 64200, orders: 32 },
        ],
        ordersByStatus: [
          { status: "Pending", count: orders.filter((o) => o.orderStatus === "pending").length, fill: "#F59E0B" },
          { status: "Processing", count: orders.filter((o) => o.orderStatus === "processing").length, fill: "#3B82F6" },
          { status: "Delivered", count: orders.filter((o) => o.orderStatus === "delivered").length, fill: "#10B981" },
          { status: "Cancelled", count: orders.filter((o) => o.orderStatus === "cancelled").length, fill: "#EF4444" },
        ],
      };
    }

    // -------------------------------------------------------------
    // Settings
    // -------------------------------------------------------------
    case "storefront.settings":
    case "admin.settings.get":
      return store.settings;

    case "admin.settings.update": {
      store.settings = {
        ...store.settings,
        ...input,
      };
      saveStoreData(store);
      return store.settings;
    }

    // -------------------------------------------------------------
    // Products
    // -------------------------------------------------------------
    case "admin.products.list":
    case "products.list":
      return store.products || [];

    case "admin.products.get":
    case "products.byId": {
      const id = typeof input === "object" ? input?.id : input;
      return store.products.find((p) => p.id === Number(id)) || null;
    }

    case "products.bySlug": {
      const slug = typeof input === "object" ? input?.slug : input;
      return store.products.find((p) => p.slug === slug) || null;
    }

    case "products.byCategory": {
      const categoryId = typeof input === "object" ? input?.categoryId : input;
      return store.products.filter((p) => p.categoryId === Number(categoryId));
    }

    case "products.featured":
      return (store.products || []).filter((p) => p.isFeatured);

    case "products.search": {
      const query = (input?.query || "").toLowerCase();
      return (store.products || []).filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
      );
    }

    case "admin.products.save": {
      let savedProduct: any;
      if (input.id) {
        const index = store.products.findIndex((p) => p.id === Number(input.id));
        if (index >= 0) {
          store.products[index] = {
            ...store.products[index],
            ...input,
            updatedAt: new Date().toISOString(),
          };
          savedProduct = store.products[index];
        } else {
          savedProduct = {
            ...input,
            id: Number(input.id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          store.products.push(savedProduct);
        }
      } else {
        const nextId = store.products.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
        savedProduct = {
          ...input,
          id: nextId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.products.push(savedProduct);
      }
      saveStoreData(store);
      return savedProduct;
    }

    case "admin.products.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.products = (store.products || []).filter((p) => p.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    case "admin.products.bulkUpdate": {
      const { ids, update } = input || {};
      if (Array.isArray(ids) && update) {
        store.products = store.products.map((p) => {
          if (ids.includes(p.id)) {
            return { ...p, ...update, updatedAt: new Date().toISOString() };
          }
          return p;
        });
        saveStoreData(store);
      }
      return { success: true };
    }

    // -------------------------------------------------------------
    // Categories & Brands
    // -------------------------------------------------------------
    case "storefront.categories":
    case "categories.list":
    case "admin.categories.list":
      return store.categories || [];

    case "admin.categories.get":
    case "categories.bySlug": {
      const idOrSlug = typeof input === "object" ? input?.id || input?.slug : input;
      return (
        store.categories.find(
          (c) => c.id === Number(idOrSlug) || c.slug === String(idOrSlug)
        ) || null
      );
    }

    case "admin.categories.save": {
      let savedCat: any;
      if (input.id) {
        const index = store.categories.findIndex((c) => c.id === Number(input.id));
        if (index >= 0) {
          store.categories[index] = { ...store.categories[index], ...input };
          savedCat = store.categories[index];
        } else {
          savedCat = { ...input, id: Number(input.id) };
          store.categories.push(savedCat);
        }
      } else {
        const nextId = store.categories.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
        savedCat = { ...input, id: nextId, subcategories: input.subcategories || [] };
        store.categories.push(savedCat);
      }
      saveStoreData(store);
      return savedCat;
    }

    case "admin.categories.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.categories = store.categories.filter((c) => c.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    case "admin.brands.list":
      return store.brands || [];

    case "admin.brands.save": {
      let savedBrand: any;
      if (input.id) {
        const idx = store.brands.findIndex((b) => b.id === Number(input.id));
        if (idx >= 0) {
          store.brands[idx] = { ...store.brands[idx], ...input };
          savedBrand = store.brands[idx];
        } else {
          savedBrand = { ...input, id: Number(input.id) };
          store.brands.push(savedBrand);
        }
      } else {
        const nextId = store.brands.reduce((max, b) => Math.max(max, b.id || 0), 0) + 1;
        savedBrand = { ...input, id: nextId };
        store.brands.push(savedBrand);
      }
      saveStoreData(store);
      return savedBrand;
    }

    case "admin.brands.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.brands = store.brands.filter((b) => b.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    // -------------------------------------------------------------
    // Sliders & Sections & Flash Sale
    // -------------------------------------------------------------
    case "storefront.sliders":
    case "admin.sliders.list":
      return store.sliders || [];

    case "admin.sliders.save": {
      let savedSlider: any;
      if (input.id) {
        const idx = store.sliders.findIndex((s) => s.id === Number(input.id));
        if (idx >= 0) {
          store.sliders[idx] = { ...store.sliders[idx], ...input };
          savedSlider = store.sliders[idx];
        } else {
          savedSlider = { ...input, id: Number(input.id) };
          store.sliders.push(savedSlider);
        }
      } else {
        const nextId = store.sliders.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
        savedSlider = { ...input, id: nextId };
        store.sliders.push(savedSlider);
      }
      saveStoreData(store);
      return savedSlider;
    }

    case "admin.sliders.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.sliders = store.sliders.filter((s) => s.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    case "storefront.sections":
    case "admin.homepage.getSections":
      return store.homepageSections || [];

    case "admin.homepage.updateSections": {
      store.homepageSections = input.sections || input;
      saveStoreData(store);
      return store.homepageSections;
    }

    case "storefront.flashSale":
    case "admin.flashSale.get":
      return store.flashSale || {};

    case "admin.flashSale.update": {
      store.flashSale = { ...store.flashSale, ...input };
      saveStoreData(store);
      return store.flashSale;
    }

    // -------------------------------------------------------------
    // Navigation Menu & Pages
    // -------------------------------------------------------------
    case "storefront.navMenu":
    case "admin.navMenu.get":
      return store.navMenuItems || [];

    case "admin.navMenu.update": {
      store.navMenuItems = input.items || input;
      saveStoreData(store);
      return store.navMenuItems;
    }

    case "admin.pages.list":
      return store.pages || [];

    case "storefront.pageBySlug":
    case "admin.pages.getBySlug": {
      const slug = typeof input === "object" ? input?.slug : input;
      return store.pages.find((p) => p.slug === slug) || null;
    }

    case "admin.pages.save": {
      let savedPage: any;
      if (input.id) {
        const idx = store.pages.findIndex((p) => p.id === Number(input.id));
        if (idx >= 0) {
          store.pages[idx] = { ...store.pages[idx], ...input, updatedAt: new Date().toISOString() };
          savedPage = store.pages[idx];
        } else {
          savedPage = { ...input, id: Number(input.id), updatedAt: new Date().toISOString() };
          store.pages.push(savedPage);
        }
      } else {
        const nextId = store.pages.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
        savedPage = { ...input, id: nextId, updatedAt: new Date().toISOString() };
        store.pages.push(savedPage);
      }
      saveStoreData(store);
      return savedPage;
    }

    case "admin.pages.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.pages = store.pages.filter((p) => p.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    // -------------------------------------------------------------
    // Shipping Zones & Payment Gateways
    // -------------------------------------------------------------
    case "storefront.shippingZones":
    case "admin.shippingPayment.getShippingZones":
      return store.shippingZones || [];

    case "admin.shippingPayment.updateShippingZones": {
      store.shippingZones = input.zones || input;
      saveStoreData(store);
      return store.shippingZones;
    }

    case "storefront.paymentGateways":
    case "admin.shippingPayment.getPaymentGateways":
      return store.paymentGateways || [];

    case "admin.shippingPayment.updatePaymentGateways": {
      store.paymentGateways = input.gateways || input;
      saveStoreData(store);
      return store.paymentGateways;
    }

    // -------------------------------------------------------------
    // Coupons
    // -------------------------------------------------------------
    case "admin.coupons.list":
      return store.coupons || [];

    case "coupons.validate":
    case "admin.coupons.validate": {
      const code = (input?.code || "").toUpperCase();
      const orderTotal = Number(input?.orderTotal || 0);
      const coupon = (store.coupons || []).find((c) => c.code.toUpperCase() === code && c.isActive);
      if (!coupon) {
        return { valid: false, message: "Invalid or expired coupon code" };
      }
      if (orderTotal < (coupon.minOrderAmount || 0)) {
        return {
          valid: false,
          message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
        };
      }
      const discount =
        coupon.discountType === "percentage"
          ? Math.min((orderTotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;

      return {
        valid: true,
        discount,
        coupon,
      };
    }

    case "admin.coupons.save": {
      let savedCoupon: any;
      if (input.id) {
        const idx = store.coupons.findIndex((c) => c.id === Number(input.id));
        if (idx >= 0) {
          store.coupons[idx] = { ...store.coupons[idx], ...input };
          savedCoupon = store.coupons[idx];
        } else {
          savedCoupon = { ...input, id: Number(input.id) };
          store.coupons.push(savedCoupon);
        }
      } else {
        const nextId = store.coupons.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
        savedCoupon = { ...input, id: nextId, timesUsed: 0 };
        store.coupons.push(savedCoupon);
      }
      saveStoreData(store);
      return savedCoupon;
    }

    case "admin.coupons.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.coupons = store.coupons.filter((c) => c.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    // -------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------
    case "admin.orders.list":
      return store.orders || [];

    case "orders.myOrders":
      return (store.orders || []).slice(0, 10);

    case "orders.get":
    case "admin.orders.get": {
      const idOrNum = typeof input === "object" ? input?.id || input?.orderNumber : input;
      return (
        store.orders.find(
          (o) => o.id === Number(idOrNum) || o.orderNumber === String(idOrNum)
        ) || null
      );
    }

    case "orders.create":
    case "admin.orders.create": {
      const nextId = store.orders.reduce((max, o) => Math.max(max, o.id || 0), 0) + 1;
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        ...input,
        id: nextId,
        orderNumber: `GB-${randomSuffix}`,
        orderStatus: input?.orderStatus || "pending",
        paymentStatus: input?.paymentStatus || (input?.paymentMethod === "cod" ? "pending" : "paid"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.orders.unshift(newOrder);

      // Add activity log
      store.activityLogs = store.activityLogs || [];
      store.activityLogs.unshift({
        id: Date.now(),
        adminName: "Customer / Storefront",
        action: "Create Order",
        entityType: "order",
        entityId: newOrder.orderNumber,
        details: `New order placed: ${newOrder.orderNumber} (৳${newOrder.total})`,
        createdAt: new Date().toISOString(),
      });

      // Add notification
      store.notifications = store.notifications || [];
      store.notifications.unshift({
        id: Date.now(),
        title: "New Order Placed",
        message: `Order #${newOrder.orderNumber} received for ৳${newOrder.total}`,
        type: "order",
        isRead: false,
        link: `/admin/orders`,
        createdAt: new Date().toISOString(),
      });

      saveStoreData(store);
      return newOrder;
    }

    case "admin.orders.updateStatus": {
      const { id, status } = input || {};
      const order = store.orders.find((o) => o.id === Number(id));
      if (order) {
        order.orderStatus = status;
        order.updatedAt = new Date().toISOString();
        if (status === "delivered" && order.paymentMethod === "cod") {
          order.paymentStatus = "paid";
        }
        saveStoreData(store);
        return order;
      }
      return { success: false };
    }

    // -------------------------------------------------------------
    // Customers
    // -------------------------------------------------------------
    case "admin.customers.list":
      return store.customers || [];

    case "admin.customers.update": {
      const idx = store.customers.findIndex((c) => c.id === Number(input.id));
      if (idx >= 0) {
        store.customers[idx] = { ...store.customers[idx], ...input };
        saveStoreData(store);
        return store.customers[idx];
      }
      return null;
    }

    // -------------------------------------------------------------
    // Media, Users, Activity Logs, Notifications
    // -------------------------------------------------------------
    case "admin.media.list":
      return store.mediaFiles || [];

    case "admin.media.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.mediaFiles = (store.mediaFiles || []).filter((m) => m.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    case "admin.users.list":
      return store.adminUsers || [];

    case "admin.users.save": {
      let user: any;
      if (input.id) {
        const idx = store.adminUsers.findIndex((u) => u.id === Number(input.id));
        if (idx >= 0) {
          store.adminUsers[idx] = { ...store.adminUsers[idx], ...input };
          user = store.adminUsers[idx];
        }
      } else {
        const nextId = store.adminUsers.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
        user = { ...input, id: nextId, isActive: true, permissions: input.permissions || ["all"] };
        store.adminUsers.push(user);
      }
      saveStoreData(store);
      return user || { success: true };
    }

    case "admin.users.delete": {
      const id = typeof input === "object" ? input?.id : input;
      store.adminUsers = (store.adminUsers || []).filter((u) => u.id !== Number(id));
      saveStoreData(store);
      return { success: true };
    }

    case "admin.activityLogs.list":
      return store.activityLogs || [];

    case "admin.notifications.list":
      return store.notifications || [];

    case "admin.notifications.markRead": {
      const id = typeof input === "object" ? input?.id : input;
      const n = (store.notifications || []).find((item) => item.id === Number(id));
      if (n) n.isRead = true;
      saveStoreData(store);
      return { success: true };
    }

    case "admin.notifications.markAllRead": {
      (store.notifications || []).forEach((item) => (item.isRead = true));
      saveStoreData(store);
      return { success: true };
    }

    // Default fallback
    default:
      console.warn(`[ClientFallbackStore] Unhandled procedure: ${procName}`, input);
      return { success: true, fallback: true, procName };
  }
}

/**
 * Intercepts tRPC batch requests and returns a valid Response object
 * containing properly formatted JSON for all batched procedure calls.
 */
export function handleClientTrpcFallback(
  inputUrl: string | Request | URL,
  init?: RequestInit
): Response {
  const urlStr =
    typeof inputUrl === "string"
      ? inputUrl
      : inputUrl instanceof URL
      ? inputUrl.toString()
      : inputUrl.url;

  const urlObj = new URL(urlStr, "http://localhost");
  const pathname = urlObj.pathname;

  // Extract procedure names from path (e.g. /api/trpc/proc1,proc2)
  const match = pathname.match(/\/api\/trpc\/(.+)$/);
  const rawProcs = match ? match[1] : "";
  const procNames = rawProcs ? rawProcs.split(",") : [];

  // Parse batch inputs
  let inputsObj: Record<string, { json: any }> = {};

  if (init?.body && typeof init.body === "string") {
    try {
      inputsObj = JSON.parse(init.body);
    } catch {}
  } else if (urlObj.searchParams.has("input")) {
    try {
      inputsObj = JSON.parse(urlObj.searchParams.get("input")!);
    } catch {}
  }

  // Generate response array for each procedure in batch
  const results = procNames.map((procName, index) => {
    const procInput =
      inputsObj[String(index)]?.json ??
      inputsObj[index]?.json ??
      null;

    try {
      const data = executeProcedure(procName, procInput);
      return {
        result: {
          data: {
            json: data,
          },
        },
      };
    } catch (err: any) {
      console.error(`[ClientFallbackStore] Error in procedure ${procName}:`, err);
      return {
        error: {
          json: {
            message: err?.message || "Execution error",
            code: -32603,
          },
        },
      };
    }
  });

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
