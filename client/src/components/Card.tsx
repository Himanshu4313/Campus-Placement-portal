import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'flat';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-2xl transition-all duration-300',
            {
              'bg-card border border-border shadow-premium hover:shadow-premium-hover': variant === 'default',
              'glass shadow-glass backdrop-blur-md': variant === 'glass',
              'bg-card border border-primary/20 shadow-premium hover-glow': variant === 'glow',
              'bg-muted/40 border border-transparent': variant === 'flat',
            }
          ),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export default Card;
