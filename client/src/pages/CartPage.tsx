import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { Trash2, Plus, Minus, ChevronLeft } from 'lucide-react';

export default function CartPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

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
      toast.success('Cart cleared');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation cartItemCount={0} />
        <div className="container flex flex-col items-center justify-center py-16">
          <p className="mb-4 text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Please log in to view your cart
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const items = cartItems || [];
  const subtotal = items.reduce((sum, item) => sum + parseFloat(String(item.price)) * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />

      {/* Breadcrumb */}
      <div className="container py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <ChevronLeft size={18} />
          Continue Shopping
        </button>
      </div>

      {/* Cart Content */}
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Your cart is empty
            </p>
            <Button onClick={() => navigate('/')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border p-4"
                    style={{ borderColor: 'hsl(var(--border))' }}
                  >
                    {/* Product Image Placeholder */}
                    <div
                      className="h-24 w-24 flex-shrink-0 rounded-lg"
                      style={{
                        backgroundColor: 'hsl(var(--muted))',
                        backgroundImage: 'linear-gradient(to bottom right, rgb(243, 244, 246), rgb(249, 250, 251))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                        Image
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                        {(item as any).product?.name || (item as any).combo?.name || 'Product'}
                      </h3>
                      <p className="mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        ৳{parseFloat(String(item.price)).toFixed(0)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          className="p-1 rounded hover:bg-muted"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                        ৳{(parseFloat(String(item.price)) * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => removeFromCartMutation.mutate({ cartItemId: item.id })}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCartMutation.mutate();
                      }
                    }}
                    disabled={clearCartMutation.isPending}
                  >
                    Clear Cart
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                height: 'fit-content',
              }}
            >
              <h2 className="mb-4 text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Order Summary
              </h2>

              <div className="space-y-3 border-b pb-4" style={{ borderColor: 'hsl(var(--border))' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                    ৳{subtotal.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Tax (5%)</span>
                  <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                    ৳{tax.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Total
                </span>
                <span className="text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>
                  ৳{total.toFixed(0)}
                </span>
              </div>

              <Button className="mt-6 w-full" size="lg">
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
