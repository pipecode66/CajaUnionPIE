export function CompanySkeletonCard() {
  return (
    <article className="company-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-banner" />
      <div className="company-card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </article>
  );
}

export function ProductSkeletonCard() {
  return (
    <article className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-product" />
      <div className="product-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </article>
  );
}
