import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, Menu, X, Phone, Heart, LogIn, Sun, Moon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationProps {
  cartItemCount?: number;
}

export default function Navigation({ cartItemCount = 0 }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const { data: settings } = trpc.storefront.settings.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: searchData } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const siteName = settings?.siteName || 'Babui Shop';
  const siteTitle = settings?.siteTitle || 'Pure & Natural';
  const sitePhone = settings?.sitePhone || '+8801629863029';
  const announcement = settings?.announcementText || `Free delivery over ৳${settings?.freeShippingThreshold ?? 1500} • Support: ${sitePhone}`;

  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteTitle ? `${settings.siteName} | ${settings.siteTitle}` : settings.siteName;
    }
  }, [settings?.siteName, settings?.siteTitle]);

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
    <nav className="w-full">
      <div className="gb-topbar bg-emerald-800 text-emerald-100 text-xs py-1.5 border-b border-emerald-700/50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="font-medium truncate">{announcement}</span>
          <div className="gb-topbar__links hidden sm:flex items-center gap-4 text-[11px]">
            <a href={`tel:${sitePhone}`} className="hover:text-white transition-colors">Call us</a>
            <Link href="/page/contact-us" className="hover:text-white transition-colors">Support</Link>
            <Link href="/combos" className="hover:text-white transition-colors">Offer Zone</Link>
          </div>
        </div>
      </div>

      <header className="gb-header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4 flex items-center justify-between py-3 gap-4">
          <Link href="/" className="gb-brand flex items-center gap-3 shrink-0" aria-label={`${siteName} home`}>
            {settings?.siteLogo ? (
              <img src={settings.siteLogo} alt={siteName} className="h-9 w-auto object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
                {siteName.charAt(0)}
              </div>
            )}
            <div className="gb-brand__text flex flex-col">
              <strong className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{siteName}</strong>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{siteTitle}</span>
            </div>
          </Link>

          <div ref={searchRef} className="gb-search hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search honey, ghee, oil, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-colors pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />

            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50">
                {searchResults.slice(0, 8).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div
                      className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setShowResults(false);
                      }}
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{product.name}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        ৳{parseFloat(product.discountPrice || product.price).toFixed(0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="gb-actions flex items-center gap-2.5 shrink-0">
            <a href={`tel:${sitePhone}`} className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors">
              <Phone size={14} className="text-emerald-600" /> {sitePhone}
            </a>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            <Link href="/cart" className="p-2 rounded-xl relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            <button type="button" className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search">
              <Search size={18} />
            </button>

            <button type="button" className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pr-10 text-xs outline-none text-slate-900 dark:text-white"
              autoFocus
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>
      )}

      <div className="gb-category-band bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 py-2">
        <div className="container mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {featuredCategories.map((cat) => {
            const category = categories?.find((c) => c.name === cat);
            const isActive = location === `/category/${category?.id}`;
            return (
              <Link
                key={cat}
                href={`/category/${category?.id || 1}`}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden py-3">
          <div className="container mx-auto px-4 flex flex-col gap-1">
            <Link href="/" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/combos" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
              Combo Packages
            </Link>
            <Link href="/cart" className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
              Cart ({cartItemCount})
            </Link>
            <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider px-3">
              Categories
            </div>
            {featuredCategories.map((cat) => {
              const category = categories?.find((c) => c.name === cat);
              return (
                <Link
                  key={cat}
                  href={`/category/${category?.id || 1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
              <Link href="/admin" className="block text-center py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs" onClick={() => setIsMobileMenuOpen(false)}>
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
