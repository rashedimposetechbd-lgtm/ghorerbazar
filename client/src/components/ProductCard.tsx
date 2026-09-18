import { ShoppingCart, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  discountPrice?: number | null;
  discountPercentage?: number | null;
  isBestSelling?: boolean;
  isNewArrival?: boolean;
  stock: number;
  hasLimitedTimeOffer?: boolean;
  offerEndsAt?: Date | null;
  onAddToCart: () => void;
  isLoading?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  discountPrice,
  discountPercentage,
  isBestSelling,
  isNewArrival,
  stock,
  hasLimitedTimeOffer,
  offerEndsAt,
  onAddToCart,
  isLoading,
}: ProductCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!hasLimitedTimeOffer || !offerEndsAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(offerEndsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [hasLimitedTimeOffer, offerEndsAt]);

  const displayPrice = discountPrice ? parseFloat(String(discountPrice)) : parseFloat(String(price));
  const originalPrice = parseFloat(String(price));
  const isOutOfStock = stock === 0;

  return (
    <article className="product-card">
      <div className="product-card__badge-stack">
        {isBestSelling && <span className="badge badge-success">Best Selling</span>}
        {isNewArrival && <span className="badge badge-warning">New Arrival</span>}
        {discountPercentage && (
          <span className="badge badge-danger">Save {Math.round(Number(discountPercentage))}%</span>
        )}
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-lg font-bold text-white">Stock Out</span>
        </div>
      )}

      <Link href={`/product/${id}`}>
        <div className="product-image cursor-pointer">
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <span className="text-sm">Product Image</span>
          </div>
        </div>
      </Link>

      {hasLimitedTimeOffer && timeLeft && timeLeft !== 'Expired' && (
        <div className="border-t border-border bg-yellow-50 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-yellow-700">
            <Clock size={14} />
            <span className="font-mono font-semibold">{timeLeft}</span>
          </div>
        </div>
      )}

      <div className="product-card__meta">
        <Link href={`/product/${id}`}>
          <h3>{name}</h3>
        </Link>

        <div className="product-card__price">
          {discountPrice ? (
            <>
              <span className="price-current">৳{displayPrice.toFixed(0)}</span>
              <span className="price-original">৳{originalPrice.toFixed(0)}</span>
            </>
          ) : (
            <span className="price-current">৳{originalPrice.toFixed(0)}</span>
          )}
        </div>

        <button type="button" onClick={onAddToCart} disabled={isOutOfStock || isLoading}>
          <span className="inline-flex items-center justify-center gap-2">
            <ShoppingCart size={16} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </span>
        </button>
      </div>
    </article>
  );
}
