import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("font-headline font-bold text-primary", className)}>
      MITRA
    </span>
  );
}
