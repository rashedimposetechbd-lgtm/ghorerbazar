import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft, ShoppingCart } from 'lucide-react';

export default function ComboDetailPage() {
  const [, params] = useRoute('/combo/:id');
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const comboId = params?.id ? parseInt(params.id) : 1;

  // Fetch data
  const { data: combo } = trpc.combos.byId.useQuery({ id: comboId });
  const { data: cartItems } = trpc.cart.list.useQuery();

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success('Combo added to cart!');
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({ comboId, quantity: 1 });
  };

  if (!combo) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation cartItemCount={cartItemCount} />
        <div className="container flex items-center justify-center py-16">
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const displayPrice = parseFloat(String(combo.price));
  const originalPrice = parseFloat(String(combo.originalPrice));
  const isOutOfStock = combo.stock === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />

      {/* Breadcrumb */}
      <div className="container py-6">
        <button
          onClick={() => navigate('/combos')}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <ChevronLeft size={18} />
          Back to Combos
        </button>
      </div>

      {/* Combo Details */}
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Combo Image */}
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              aspectRatio: '1',
              backgroundColor: 'hsl(var(--muted))',
              backgroundImage: 'linear-gradient(to bottom right, rgb(243, 244, 246), rgb(249, 250, 251))',
            }}
          >
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Combo Image</span>
          </div>

          {/* Combo Info */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {combo.name}
              </h1>
              {combo.description && (
                <p className="mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {combo.description}
                </p>
              )}
            </div>

            {/* Pricing & Savings */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  ৳{displayPrice.toFixed(0)}
                </span>
                <span className="text-lg line-through" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  ৳{originalPrice.toFixed(0)}
                </span>
                <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: 'rgb(254, 226, 226)', color: 'rgb(220, 38, 38)' }}>
                  Save {parseFloat(String(combo.savingsPercentage)).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <span className="inline-block rounded-lg px-4 py-2 font-semibold" style={{ backgroundColor: 'rgb(254, 226, 226)', color: 'rgb(220, 38, 38)' }}>
                  Out of Stock
                </span>
              ) : (
                <span className="inline-block rounded-lg px-4 py-2 font-semibold" style={{ backgroundColor: 'rgb(220, 252, 231)', color: 'rgb(22, 163, 74)' }}>
                  In Stock ({combo.stock} available)
                </span>
              )}
            </div>

            {/* What's Included */}
            <div className="border-t pt-6" style={{ borderColor: 'hsl(var(--border))' }}>
              <h3 className="mb-3 font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                What's Included:
              </h3>
              <ul className="space-y-2">
                {combo.productIds && combo.productIds.length > 0 ? (
                  combo.productIds.map((id, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span style={{ color: 'hsl(var(--accent))' }}>•</span>
                      <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Product #{id}
                      </span>
                    </li>
                  ))
                ) : (
                  <li style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Premium bundle of selected items
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCartMutation.isPending}
                className="gap-2 flex-1"
                size="lg"
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                disabled={isOutOfStock}
                className="flex-1"
                size="lg"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
