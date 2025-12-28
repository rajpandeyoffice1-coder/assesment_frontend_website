import { Brain } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size]} bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25`}>
        <Brain className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} text-primary-foreground`} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-display font-bold text-gradient-primary`}>
            AssessPro
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground font-medium tracking-wide">
              Online Assessment Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
