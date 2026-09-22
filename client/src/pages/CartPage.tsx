import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { Trash2, Plus, Minus, ChevronLeft, CheckCircle2, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function CartPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Checkout form state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingZone, setShippingZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Fetch cart items
  const { data: cartItems, refetch } = trpc.cart.list.useQuery();

  // Mutations
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update quantity');
    },
  });

  const removeFromCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success('Item removed from cart');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove item');
    },
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });

  const createOrderMutation = (trpc as any).orders?.create?.useMutation({
    onSuccess: (newOrder: any) => {
      setPlacedOrder(newOrder);
      clearCartMutation.mutate();
      toast.success('Order placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to place order. Please try again.');
    },
  });

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

  const items = (Array.isArray(cartItems) ? cartItems : []) as any[];
  const subtotal = items.reduce((sum: number, item: any) => {
    const p = parseFloat(String(item.price || item.product?.discountPrice || item.product?.price || 0));
    return sum + p * item.quantity;
  }, 0);

  const shippingCost = items.length === 0 ? 0 : shippingZone === 'inside_dhaka' ? 70 : 130;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      toast.error('Please enter a valid mobile phone number');
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    createOrderMutation.mutate({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: user?.email || `${customerPhone.trim()}@babuishop.com`,
      shippingAddress: shippingAddress.trim(),
      city: shippingZone === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
      zone: shippingZone,
      paymentMethod,
      shippingCost,
      subtotal,
      total,
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId || item.product?.id,
        comboId: item.comboId || item.combo?.id,
        name: item.product?.name || item.combo?.name || 'Product',
        price: parseFloat(String(item.price || item.product?.price || 0)),
        quantity: item.quantity,
      })),
    });
  };

  // If order was placed, show celebratory receipt
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Navigation cartItemCount={0} />
        <div className="container max-w-xl py-12 px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Order Placed Successfully!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for shopping with Babui Shop. We have received your order and our team will contact you shortly to confirm delivery.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-left space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-bold text-foreground">{placedOrder.orderNumber || `GB-${placedOrder.id}`}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="font-medium text-foreground">{placedOrder.customerName || customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{placedOrder.customerPhone || customerPhone}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Delivery Address</span>
                <span className="font-medium text-foreground text-right max-w-[200px] truncate">{placedOrder.shippingAddress || shippingAddress}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground uppercase">{placedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-base">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-emerald-600">৳{placedOrder.total || total}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setPlacedOrder(null);
                  setIsCheckingOut(false);
                  navigate('/');
                }}
                className="flex-1 min-h-[44px]"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation cartItemCount={cartItemCount} />

      {/* Breadcrumb */}
      <div className="container py-4 sm:py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <ChevronLeft size={18} />
          Continue Shopping
        </button>
      </div>

      {/* Cart Content */}
      <div className="container py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
            Shopping Cart {items.length > 0 && `(${items.length} items)`}
          </h1>
          {items.length > 0 && !isCheckingOut && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your cart?')) {
                  clearCartMutation.mutate();
                }
              }}
              disabled={clearCartMutation.isPending}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-card p-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <Trash2 size={28} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-sm">
              Explore our selection of pure honey, natural oils, organic spices, and premium dates.
            </p>
            <Button onClick={() => navigate('/')} size="lg" className="min-h-[44px]">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item: any) => {
                const itemPrice = parseFloat(String(item.price || item.product?.discountPrice || item.product?.price || 0));
                const itemImage = item.product?.imageUrl || item.combo?.imageUrl;
                const itemName = item.product?.name || item.combo?.name || 'Product';

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden border border-border/80 bg-muted flex items-center justify-center">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Item</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate text-foreground">
                        {itemName}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                        ৳{itemPrice.toFixed(0)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          className="p-1 rounded-md border border-border bg-background hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-xs sm:text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                          className="p-1 rounded-md border border-border bg-background hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="font-bold text-sm sm:text-base text-foreground">
                        ৳{(itemPrice * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => removeFromCartMutation.mutate({ cartItemId: item.id })}
                        className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                <span>100% Satisfaction Guarantee: Fresh, natural & authentic products with cash on delivery assurance.</span>
              </div>
            </div>

            {/* Order Summary & Delivery Form */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg sm:text-xl font-bold text-foreground flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-muted-foreground">BDT Currency</span>
                </h2>

                <div className="space-y-3 border-b border-border pb-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">৳{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} />
                      Shipping ({shippingZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                    </span>
                    <span className="font-semibold text-foreground">৳{shippingCost}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-baseline">
                  <span className="text-base sm:text-lg font-bold text-foreground">
                    Total Payable
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                    ৳{total.toFixed(0)}
                  </span>
                </div>

                {!isCheckingOut ? (
                  <Button
                    className="mt-6 w-full min-h-[46px] font-semibold text-base"
                    size="lg"
                    onClick={() => setIsCheckingOut(true)}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="mt-6 pt-5 border-t border-border space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <CreditCard size={16} className="text-emerald-600" />
                      Delivery & Contact Details
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mohammad Rahim"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="017XXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Full Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House / Road / Area / District"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Delivery Zone
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShippingZone('inside_dhaka')}
                          className={`rounded-lg border p-2 text-xs font-medium text-left transition-all ${
                            shippingZone === 'inside_dhaka'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <div className="font-semibold">Inside Dhaka</div>
                          <div className="text-[11px] opacity-80">৳70 (24-48 hrs)</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShippingZone('outside_dhaka')}
                          className={`rounded-lg border p-2 text-xs font-medium text-left transition-all ${
                            shippingZone === 'outside_dhaka'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <div className="font-semibold">Outside Dhaka</div>
                          <div className="text-[11px] opacity-80">৳130 (2-4 days)</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`rounded-lg border p-2 text-xs font-medium text-left transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <div className="font-semibold">Cash On Delivery</div>
                          <div className="text-[11px] opacity-80">Pay upon receipt</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bkash')}
                          className={`rounded-lg border p-2 text-xs font-medium text-left transition-all ${
                            paymentMethod === 'bkash'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <div className="font-semibold">bKash / Nagad</div>
                          <div className="text-[11px] opacity-80">Mobile payment</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="w-full min-h-[46px] font-semibold text-base bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
                      size="lg"
                    >
                      {createOrderMutation.isPending ? 'Processing Order...' : `Confirm Order (৳${total.toFixed(0)})`}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full text-center text-xs text-muted-foreground hover:underline pt-1"
                    >
                      Back to Cart Summary
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
