import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface ComboCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  savingsPercentage: number;
  stock: number;
}

export default function ComboCard({
  id,
  name,
  price,
  originalPrice,
  savingsPercentage,
  stock,
}: ComboCardProps) {
  const isOutOfStock = stock === 0;

  return (
    <div className="product-card">
      {/* Savings Badge */}
      <div className="absolute left-3 top-3 z-10">
        <span className="badge-danger badge font-semibold">
          Save {savingsPercentage.toFixed(1)}%
        </span>
      </div>

      {/* Stock Status */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-lg font-bold text-white">Stock Out</span>
        </div>
      )}

      {/* Combo Image Placeholder */}
      <div className="product-image bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="flex h-full w-full items-center justify-center text-purple-600">
          <span className="text-center text-sm font-semibold">Combo Deal</span>
        </div>
      </div>

      {/* Combo Info */}
      <div className="flex flex-col gap-3 p-4">
        {/* Name */}
        <Link href={`/combo/${id}`}>
          <h3 className="truncate-lines cursor-pointer text-sm font-semibold text-foreground hover:text-accent transition-colors">
            {name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="price-display">
            <span className="price-current">৳{price.toFixed(0)}</span>
            <span className="price-original">৳{originalPrice.toFixed(0)}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Link href={`/combo/${id}`}>
          <Button
            variant="outline"
            disabled={isOutOfStock}
            className="w-full"
            size="sm"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
