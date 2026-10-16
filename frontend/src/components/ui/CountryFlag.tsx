import type { ImgHTMLAttributes } from 'react';

interface CountryFlagProps extends ImgHTMLAttributes<HTMLImageElement> {
  countryCode: string;
  className?: string;
  alt?: string;
}

export function CountryFlag({ countryCode, className = 'w-5 h-3.5', alt, ...props }: CountryFlagProps) {
  const code = (countryCode || 'us').toLowerCase();
  return (
    <img
      src={`/flags/${code}.png`}
      alt={alt || `${code.toUpperCase()} flag`}
      className={`inline-block object-cover rounded-[2px] border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.08)] shrink-0 align-middle ${className}`}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.includes('flagcdn.com')) {
          target.src = `https://flagcdn.com/w40/${code}.png`;
        }
      }}
      {...props}
    />
  );
}
