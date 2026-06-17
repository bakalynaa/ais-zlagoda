import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { gsap } from 'gsap';

import './FlowingMenu.css';

interface FlowingMenuItem {
  to?: string;
  label: string;
  image: string;
  onClick?: () => void;
}

interface Props {
  items: FlowingMenuItem[];
  onNavigate?: () => void;
  speed?: number;
}

interface MenuItemProps extends FlowingMenuItem {
  index: number;
  speed: number;
  onNavigate?: () => void;
  onActivate: (index: number) => void;
  registerCloser: (index: number, closer: () => void) => void;
}

const animationDefaults = { duration: 0.6, ease: 'expo' };

function distMetric(x: number, y: number, x2: number, y2: number) {
  const xDiff = x - x2;
  const yDiff = y - y2;
  return xDiff * xDiff + yDiff * yDiff;
}

function findClosestEdge(mouseX: number, mouseY: number, width: number, height: number) {
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
  return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
}

function MenuItem({
  index,
  to,
  label,
  image,
  onClick,
  speed,
  onNavigate,
  onActivate,
  registerCloser,
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeSlideRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const getLinkEl = () => itemRef.current?.querySelector<HTMLElement>('.flowing-menu__link') ?? null;

  const killVerticalTweens = () => {
    if (marqueeRef.current) gsap.killTweensOf(marqueeRef.current, 'y');
    if (marqueeSlideRef.current) gsap.killTweensOf(marqueeSlideRef.current, 'y');
  };

  const closeMarquee = useCallback((edge: 'top' | 'bottom') => {
    if (!marqueeRef.current || !marqueeSlideRef.current) return;

    const linkEl = getLinkEl();
    killVerticalTweens();
    if (linkEl) gsap.killTweensOf(linkEl, 'opacity');

    const timeline = gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeSlideRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);

    if (linkEl) {
      timeline.to(linkEl, { opacity: 1, duration: 0.2 }, 0);
    }
  }, []);

  useEffect(() => {
    registerCloser(index, () => closeMarquee('bottom'));
  }, [closeMarquee, index, registerCloser]);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-menu__marquee-part');
      if (!marqueeContent) return;

      const contentWidth = (marqueeContent as HTMLElement).offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [label, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-menu__marquee-part');
      if (!marqueeContent) return;

      const contentWidth = (marqueeContent as HTMLElement).offsetWidth;
      if (contentWidth === 0) return;

      animationRef.current?.kill();

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);

    return () => {
      window.clearTimeout(timer);
      animationRef.current?.kill();
    };
  }, [label, image, repetitions, speed]);

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeSlideRef.current) return;

    onActivate(index);

    const rect = itemRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    const linkEl = getLinkEl();
    killVerticalTweens();
    if (linkEl) gsap.killTweensOf(linkEl, 'opacity');

    const timeline = gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeSlideRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeSlideRef.current], { y: '0%' }, 0);

    if (linkEl) {
      timeline.to(linkEl, { opacity: 0, duration: 0.2 }, 0);
    }
  };

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    closeMarquee(edge);
  };

  return (
    <div
      className="flowing-menu__item"
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {to ? (
        <NavLink
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => `flowing-menu__link${isActive ? ' active' : ''}`}
        >
          {label}
        </NavLink>
      ) : (
        <button
          type="button"
          className="flowing-menu__link"
          onClick={() => {
            onClick?.();
            onNavigate?.();
          }}
        >
          {label}
        </button>
      )}

      <div className="flowing-menu__marquee" ref={marqueeRef}>
        <div className="flowing-menu__marquee-inner-wrap" ref={marqueeSlideRef}>
          <div className="flowing-menu__marquee-inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }, (_, idx) => (
              <div className="flowing-menu__marquee-part" key={`${label}-${idx}`}>
                <span>{label}</span>
                <div className="flowing-menu__marquee-img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({ items, onNavigate, speed = 15 }: Props) {
  const closersRef = useRef<Map<number, () => void>>(new Map());

  const registerCloser = useCallback((index: number, closer: () => void) => {
    closersRef.current.set(index, closer);
  }, []);

  const handleActivate = useCallback((activeIndex: number) => {
    closersRef.current.forEach((close, index) => {
      if (index !== activeIndex) {
        close();
      }
    });
  }, []);

  return (
    <div className="flowing-menu-wrap">
      <nav className="flowing-menu">
        {items.map((item, index) => (
          <MenuItem
            key={item.to ?? `${item.label}-${index}`}
            index={index}
            {...item}
            speed={speed}
            onNavigate={onNavigate}
            onActivate={handleActivate}
            registerCloser={registerCloser}
          />
        ))}
      </nav>
    </div>
  );
}
