import { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="accordion" role="list">
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <section key={item.id} className="accordion-item" role="listitem">
            <button
              type="button"
              onClick={() => setActiveId(isActive ? null : item.id)}
              aria-expanded={isActive}
              className="accordion-trigger"
            >
              <span>{item.title}</span>
              <span aria-hidden="true">{isActive ? '-' : '+'}</span>
            </button>
            {isActive && <p className="accordion-content">{item.content}</p>}
          </section>
        );
      })}
    </div>
  );
}
