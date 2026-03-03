import type { Company, Product } from '../../types/company';
import { currencyCop, toWhatsappUrl } from '../../utils/company';
import { Modal } from '../common/Modal';

interface ProductModalProps {
  company: Company;
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ company, product, onClose }: ProductModalProps) {
  if (!product) {
    return null;
  }

  const message = `Hola, deseo pedir "${product.name}" de ${company.name}.`;

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} title={product.name}>
      <article className="product-modal-content">
        <img src={product.imageUrl} alt={product.name} className="product-modal-image" />
        <div>
          <p>{product.shortDesc}</p>
          <p>
            <strong>{currencyCop(product.price)}</strong>
          </p>
          {product.sku && <p className="muted-text">SKU: {product.sku}</p>}
          <div className="chip-row">
            {product.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <a
            href={toWhatsappUrl(company.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="primary-link"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </article>
    </Modal>
  );
}
