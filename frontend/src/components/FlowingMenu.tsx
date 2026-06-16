import { useMemo, useState, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';

interface FlowingMenuItem {
  to?: string;
  label: string;
  image: string;
  onClick?: () => void;
}

interface Props {
  items: FlowingMenuItem[];
  onNavigate?: () => void;
}

function edgeByPointer(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const topDistance = (x - rect.width / 2) ** 2 + y ** 2;
  const bottomDistance = (x - rect.width / 2) ** 2 + (y - rect.height) ** 2;
  return topDistance < bottomDistance ? 'top' : 'bottom';
}

export default function FlowingMenu({ items, onNavigate }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [edge, setEdge] = useState<'top' | 'bottom'>('bottom');

  const repeated = useMemo(() => Array.from({ length: 7 }), []);

  return (
    <nav className="flowing-menu">
      {items.map((item, index) => (
        <div
          key={item.to}
          className={`flowing-item ${hoveredIndex === index ? 'is-hovered' : ''}`}
          data-edge={edge}
          onMouseEnter={(event) => {
            setEdge(edgeByPointer(event));
            setHoveredIndex(index);
          }}
          onMouseLeave={(event) => {
            setEdge(edgeByPointer(event));
            setHoveredIndex(null);
          }}
        >
          {item.to ? (
            <NavLink to={item.to} onClick={onNavigate} className="flowing-link">
              {item.label}
            </NavLink>
          ) : (
            <button
              type="button"
              className="flowing-link flowing-link-button"
              onClick={() => {
                item.onClick?.();
                onNavigate?.();
              }}
            >
              {item.label}
            </button>
          )}

          <div className="flowing-marquee">
            <div className="flowing-track">
              {repeated.map((_, partIndex) => (
                <div className="flowing-part" key={`${item.label}-${partIndex}`}>
                  <span>{item.label}</span>
                  <div className="flowing-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}
