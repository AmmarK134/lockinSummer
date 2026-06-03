import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'purple' | 'green' | 'amber' | 'none';
  padding?: 'sm' | 'md' | 'lg';
}

const GLOW_STYLES: Record<NonNullable<CardProps['glow']>, string> = {
  cyan:   'glow-cyan',
  purple: 'glow-purple',
  green:  'glow-green',
  amber:  'glow-amber',
  none:   '',
};

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', glow = 'none', padding = 'md', style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`card ${GLOW_STYLES[glow]} ${PADDING[padding]} ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
