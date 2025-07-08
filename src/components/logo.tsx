import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 100, height = 35 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      className={cn('text-foreground', className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mitra Logo"
    >
      <text
        x="0"
        y="30"
        fontFamily='"Playfair Display", serif'
        fontSize="32"
        fontWeight="bold"
        fill="currentColor"
      >
        Mitra
      </text>
    </svg>
  );
}
