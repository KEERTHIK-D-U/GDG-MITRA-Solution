import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <svg width="12" height="24" viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current text-primary">
            <path d="M10 2L2 8V16L10 22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-logo font-bold text-primary tracking-wider">
            MITRA
        </span>
       <svg width="12" height="24" viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current text-primary">
            <path d="M2 2L10 8V16L2 22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
  );
}
