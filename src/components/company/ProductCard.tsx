import type { Product } from '../../types/company';
import { currencyCop, toWhatsappUrl } from '../../utils/company';

interface ProductCardProps {
  product: Product;
  companyName: string;
  companyWhatsapp?: string;
  onView: (product: Product) => void;
}

export function ProductCard({ product, companyName, companyWhatsapp, onView }: ProductCardProps) {
  const message = `Hola, me interesa el producto "${product.name}" de ${companyName}.`;

  return (
    <article className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      <div className="product-body">
        <h4>{product.name}</h4>
        <p>{product.shortDesc}</p>
        <strong>{currencyCop(product.price)}</strong>
        <div className="product-actions">
          <button type="button" className="secondary-btn" onClick={() => onView(product)}>
            Ver detalle
          </button>
          <a
            href={toWhatsappUrl(companyWhatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="secondary-link"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
