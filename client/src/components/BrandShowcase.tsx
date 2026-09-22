import { trpc } from '@/lib/trpc';

export default function BrandShowcase() {
  const { data: brands } = trpc.brands.list.useQuery();

  const brandsList = Array.isArray(brands) ? brands : [];

  if (brandsList.length === 0) {
    return null;
  }

  return (
    <section className="gb-brand-showcase gb-section">
      <div className="container">
        <div className="gb-section__head">
          <h2>Our Brands</h2>
          <a href="/">See all</a>
        </div>
        <div className="gb-brand-grid">
          {brandsList.map((brand: any) => (
            <div key={brand.id} className="gb-brand-item">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} />
              ) : (
                <span className="text-center font-semibold text-sm text-foreground">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
