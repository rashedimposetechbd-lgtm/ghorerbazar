import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ComboCard from '@/components/ComboCard';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { ChevronLeft } from 'lucide-react';

export default function CombosPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch data
  const { data: combos } = trpc.combos.list.useQuery();
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, { enabled: !!user });

  // Update cart count
  useEffect(() => {
    if (cartItems) {
      setCartItemCount(cartItems.length);
    }
  }, [cartItems]);

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
          Exclusive Combo Deals
        </h1>
        <p className="mt-2 text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Save more with our special bundled offers
        </p>
      </div>

      {/* Combos Grid */}
      <div className="container py-8">
        {combos && combos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <ComboCard
                key={combo.id}
                id={combo.id}
                name={combo.name}
                price={parseFloat(String(combo.price))}
                originalPrice={parseFloat(String(combo.originalPrice))}
                savingsPercentage={parseFloat(String(combo.savingsPercentage))}
                stock={combo.stock}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No combo deals available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
