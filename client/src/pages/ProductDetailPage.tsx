import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function ProductDetailPage() {
  const [, params] = useRoute('/product/:id');
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productId = params?.id ? parseInt(params.id) : 1;

  // Fetch data
  const { data: product } = trpc.products.byId.useQuery({ id: productId });
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, { enabled: !!user });

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
      trpc.useUtils().cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    addToCartMutation.mutate({ productId, quantity });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation cartItemCount={cartItemCount} />
        <div className="container flex items-center justify-center py-16">
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const displayPrice = product.discountPrice ? parseFloat(String(product.discountPrice)) : parseFloat(String(product.price));
  const originalPrice = parseFloat(String(product.price));
  const isOutOfStock = product.stock === 0;

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
          Back
        </button>
      </div>

      {/* Product Details */}
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              aspectRatio: '1',
              backgroundColor: 'hsl(var(--muted))',
              backgroundImage: 'linear-gradient(to bottom right, rgb(243, 244, 246), rgb(249, 250, 251))',
            }}
          >
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Product Image</span>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {product.description}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  ৳{displayPrice.toFixed(0)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg line-through" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      ৳{originalPrice.toFixed(0)}
                    </span>
                    <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: 'rgb(254, 226, 226)', color: 'rgb(220, 38, 38)' }}>
                      Save {product.discountPercentage ? Math.round(Number(product.discountPercentage)) : 0}%
                    </span>
                  </>
                )}
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
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  Quantity:
                </span>
                <div className="flex items-center rounded-lg border" style={{ borderColor: 'hsl(var(--border))' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-muted"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

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

            {/* Additional Info */}
            <div className="space-y-3 border-t pt-6" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex justify-between">
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Category:</span>
                <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  Grocery
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Availability:</span>
                <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
