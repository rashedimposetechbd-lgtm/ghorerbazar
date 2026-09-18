import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import ProductCard from '@/components/ProductCard';
import ComboCard from '@/components/ComboCard';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import BrandShowcase from '@/components/BrandShowcase';

export default function Home() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: topSelling } = trpc.products.topSelling.useQuery({ limit: 8 });
  const { data: combos } = trpc.combos.list.useQuery();
  const { data: allProducts } = trpc.products.list.useQuery();
  const { data: cartItems } = trpc.cart.list.useQuery();

  useEffect(() => {
    if (cartItems) setCartItemCount(cartItems.length);
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

  const honeyProducts = allProducts?.filter((p) => p.categoryId === categories?.find((c) => c.name === 'Honey')?.id).slice(0, 6) || [];
  const oilProducts = allProducts?.filter((p) => p.categoryId === categories?.find((c) => c.name === 'Oil & Ghee')?.id).slice(0, 6) || [];
  const dateProducts = allProducts?.filter((p) => p.categoryId === categories?.find((c) => c.name === 'Dates')?.id).slice(0, 6) || [];

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
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />

      <section className="gb-hero">
        <div className="container">
          <div className="gb-hero__shell">
            <div className="gb-hero__copy">
              <span className="gb-hero__eyebrow">Trusted natural grocery</span>
              <h1>Premium groceries from trusted local sources.</h1>
              <p>
                Discover authentic, high-quality products from trusted brands. From pure honey to organic spices, find everything for your kitchen.
              </p>

              <div className="gb-hero__actions">
                <Link href="/category/1" className="gb-cta">Shop Now</Link>
                <Link href="/combos" className="gb-cta gb-cta--outline">View Combo Deals</Link>
              </div>

              <div className="gb-hero__stats">
                <div className="gb-stat">
                  <strong>10k+</strong>
                  <span>Happy customers</span>
                </div>
                <div className="gb-stat">
                  <strong>50+</strong>
                  <span>Natural products</span>
                </div>
                <div className="gb-stat">
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </div>
            </div>

            <div className="gb-hero__visual">
              <div className="gb-hero__panel">
                <img alt="Featured grocery selection" src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gb-section">
        <div className="container">
          <div className="gb-section__head">
            <h2>Featured Categories</h2>
          </div>
          <div className="gb-categories">
            {featuredCategories.map((catName) => {
              const category = categories?.find((c) => c.name === catName);
              return (
                <Link key={catName} href={`/category/${category?.id || 1}`} className="gb-category-card">
                  <div className="gb-category-card__icon">{catName.charAt(0)}</div>
                  <p>{catName}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {topSelling && topSelling.length > 0 && (
        <section className="gb-section" style={{ background: 'linear-gradient(180deg, rgba(15, 139, 88, 0.03), rgba(15, 139, 88, 0.01))' }}>
          <div className="container">
            <div className="gb-section__head">
              <h2>Top Selling Products</h2>
              <Link href="/category/1">View All</Link>
            </div>
            <div className="gb-product-grid">
              {topSelling.map((product) => (
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
          </div>
        </section>
      )}

      <BrandShowcase />

      {combos && combos.length > 0 && (
        <section className="gb-section">
          <div className="container">
            <div className="gb-section__head">
              <h2>Exclusive Combo Deals</h2>
              <Link href="/combos">View All Combos</Link>
            </div>
            <div className="gb-product-grid">
              {combos.slice(0, 4).map((combo) => (
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
          </div>
        </section>
      )}

      {honeyProducts.length > 0 && (
        <section className="gb-section" style={{ background: 'linear-gradient(180deg, rgba(15, 139, 88, 0.03), rgba(15, 139, 88, 0.01))' }}>
          <div className="container">
            <div className="gb-section__head">
              <h2>All Natural Honey</h2>
              <Link href={`/category/${categories?.find((c) => c.name === 'Honey')?.id || 1}`}>View all items</Link>
            </div>
            <div className="gb-product-grid">
              {honeyProducts.map((product) => (
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
          </div>
        </section>
      )}

      {dateProducts.length > 0 && (
        <section className="gb-section">
          <div className="container">
            <div className="gb-section__head">
              <h2>Premium Dates</h2>
              <Link href={`/category/${categories?.find((c) => c.name === 'Dates')?.id || 1}`}>View all items</Link>
            </div>
            <div className="gb-product-grid">
              {dateProducts.map((product) => (
                <ProductCard key={product.id} id={product.id} name={product.name} price={parseFloat(String(product.price))} discountPrice={product.discountPrice ? parseFloat(String(product.discountPrice)) : null} discountPercentage={product.discountPercentage ? parseFloat(String(product.discountPercentage)) : null} isBestSelling={product.isBestSelling || false} isNewArrival={product.isNewArrival || false} stock={product.stock} hasLimitedTimeOffer={product.hasLimitedTimeOffer || false} offerEndsAt={product.offerEndsAt} onAddToCart={() => handleAddToCart(product.id)} isLoading={addToCartMutation.isPending} />
              ))}
            </div>
          </div>
        </section>
      )}

      {oilProducts.length > 0 && (
        <section className="gb-section" style={{ background: 'linear-gradient(180deg, rgba(15, 139, 88, 0.03), rgba(15, 139, 88, 0.01))' }}>
          <div className="container">
            <div className="gb-section__head">
              <h2>Cooking Essentials</h2>
              <Link href={`/category/${categories?.find((c) => c.name === 'Oil & Ghee')?.id || 1}`}>View all items</Link>
            </div>
            <div className="gb-product-grid">
              {oilProducts.map((product) => (
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
          </div>
        </section>
      )}

      <footer>
        <div className="container gb-footer__grid">
          <div>
            <h3>Ghorer Bazar</h3>
            <p>Premium natural foods and groceries for your kitchen.</p>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>
              <li><Link href="/category/1">Oil &amp; Ghee</Link></li>
              <li><Link href="/category/2">Honey</Link></li>
              <li><Link href="/category/3">Dates</Link></li>
              <li><Link href="/category/4">Spices</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="tel:+8809642922922">Contact</a></li>
              <li><a href="/">FAQs</a></li>
              <li><a href="/">Shipping</a></li>
              <li><a href="/">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4>Visit Us</h4>
            <p>Rampura, Dhaka, Bangladesh</p>
            <p>contact@ghorerbazar.com</p>
            <p>+8809642922922</p>
          </div>
        </div>
        <div className="gb-footer__bottom">© 2026 Ghorer Bazar. All rights reserved.</div>
      </footer>
    </div>
  );
}
