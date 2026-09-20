import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, Menu, X, Phone, Heart, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface NavigationProps {
  cartItemCount?: number;
}

export default function Navigation({ cartItemCount = 0 }: NavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: searchData } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData);
      setShowResults(true);
    }
  }, [searchData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featuredCategories = [
    'Oil & Ghee',
    'Honey',
    'Dates',
    'Spices',
    'Nuts & Seeds',
    'Beverage',
    'Rice',
    'Flours & Lentils',
    'Organic',
    'Functional Food',
  ];

  return (
    <nav>
      <div className="gb-topbar">
        <div className="container">
          <span>Free delivery over ৳1,500 • Support: +8809642922922</span>
          <div className="gb-topbar__links">
            <a href="tel:+8809642922922">Call us</a>
            <a href="/">Track order</a>
            <a href="/">Offer Zone</a>
          </div>
        </div>
      </div>

      <header className="gb-header">
        <div className="container">
          <Link href="/" className="gb-brand" aria-label="Ghorer Bazar home">
            <div className="gb-brand__mark">G</div>
            <div className="gb-brand__text">
              <strong>Ghorer Bazar</strong>
              <span>Pure &amp; natural</span>
            </div>
          </Link>

          <div ref={searchRef} className="gb-search hidden md:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
            />
            <Search className="gb-search__icon" size={18} />

            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-white shadow-xl z-50">
                {searchResults.slice(0, 8).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div
                      className="border-b border-border px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setShowResults(false);
                      }}
                    >
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ৳{parseFloat(product.discountPrice || product.price).toFixed(0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="gb-actions">
            <a href="tel:+8809642922922" className="hidden lg:inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Phone size={16} /> +8809642922922
            </a>

            <button type="button" className="gb-icon-btn hidden sm:flex" aria-label="Wishlist">
              <Heart size={18} />
            </button>

            <Link href="/cart" className="gb-icon-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartItemCount > 0 && <span>{cartItemCount > 9 ? '9+' : cartItemCount}</span>}
            </Link>

            <button type="button" className="gb-icon-btn md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search">
              <Search size={18} />
            </button>

            <button type="button" className="gb-icon-btn md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <span>Admin</span>
            </Link>

            <button type="button" className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <LogIn size={16} /> Login
            </button>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="border-t border-border bg-muted px-4 py-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-4 py-2 pr-10 text-sm outline-none focus:border-emerald-500"
              autoFocus
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
        </div>
      )}

      <div className="gb-category-band">
        <div className="container">
          {featuredCategories.map((cat) => {
            const category = categories?.find((c) => c.name === cat);
            return (
              <Link key={cat} href={`/category/${category?.id || 1}`} className={`gb-category-pill ${location === `/category/${category?.id}` ? 'is-active' : ''}`}>
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="container flex flex-col gap-2 py-4">
            {featuredCategories.map((cat) => {
              const category = categories?.find((c) => c.name === cat);
              return (
                <Link key={cat} href={`/category/${category?.id || 1}`} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-emerald-50" onClick={() => setIsMobileMenuOpen(false)}>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
