import type { CSSProperties, ElementType, ReactNode } from 'react';
import './StarBorder.css';

interface StarBorderProps {
  as?: ElementType;
  className?: string;
  color?: string;
  colorSecondary?: string;
  speed?: string;
  thickness?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = 'rgba(255, 252, 248, 0.92)',
  colorSecondary = 'rgba(196, 168, 130, 0.78)',
  speed = '6s',
  thickness = 1,
  children,
  style,
  ...rest
}: StarBorderProps & Record<string, unknown>) {
  return (
    <Component
      className={`star-border-container ${className}`.trim()}
      style={{
        padding: `${thickness}px 0`,
        ...style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${colorSecondary}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div className="inner-content">{children}</div>
    </Component>
  );
}
