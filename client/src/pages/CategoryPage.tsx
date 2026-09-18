import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

export default function CategoryPage() {
  const [, params] = useRoute('/category/:id');
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const categoryId = params?.id ? parseInt(params.id) : 1;

  // Fetch data
  const { data: category } = trpc.categories.byId.useQuery({ id: categoryId });
  const { data: products } = trpc.products.byCategory.useQuery({ categoryId });
  const { data: cartItems } = trpc.cart.list.useQuery();

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success('Added to cart!');
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />

      {/* Breadcrumb & Header */}
      <div className="container py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm font-medium"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <ChevronLeft size={18} />
          Back to Home
        </button>

        <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          {category?.name || 'Products'}
        </h1>
        {category?.description && (
          <p className="mt-2 text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="container py-8">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={parseFloat(String(product.price))}
                discountPrice={product.discountPrice ? parseFloat(String(product.discountPrice)) : null}
                discountPercentage={product.discountPercentage ? parseFloat(String(product.discountPercentage)) : null}
                isBestSelling={product.isBestSelling || false}
                isNewArrival={product.isNewArrival || false}
                stock={product.stock}
                hasLimitedTimeOffer={product.hasLimitedTimeOffer || false}
                offerEndsAt={product.offerEndsAt}
                onAddToCart={() => handleAddToCart(product.id)}
                isLoading={addToCartMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
