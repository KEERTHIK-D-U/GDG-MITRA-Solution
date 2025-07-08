import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 100, height = 35 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Mitra Logo"
      width={width}
      height={height}
      className={cn(className)}
      priority
    />
  );
}
