import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mail, Phone, Shield, CreditCard } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  level: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  payoutVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const verificationLevels = [
  {
    key: 'email',
    label: 'Email Verified',
    description: 'Email address has been verified',
    icon: Mail,
    color: 'text-blue-500',
  },
  {
    key: 'phone',
    label: 'Phone Verified',
    description: 'Phone number has been verified',
    icon: Phone,
    color: 'text-green-500',
  },
  {
    key: 'identity',
    label: 'Identity Verified',
    description: 'Government ID has been verified',
    icon: Shield,
    color: 'text-purple-500',
  },
  {
    key: 'payout',
    label: 'Payout Verified',
    description: 'Payout account has been verified',
    icon: CreditCard,
    color: 'text-amber-500',
  },
];

export function VerificationBadge({
  level,
  emailVerified,
  phoneVerified,
  identityVerified,
  payoutVerified,
  size = 'md',
}: VerificationBadgeProps) {
  const verifiedLevels = verificationLevels.filter((v) => {
    switch (v.key) {
      case 'email':
        return emailVerified;
      case 'phone':
        return phoneVerified;
      case 'identity':
        return identityVerified;
      case 'payout':
        return payoutVerified;
      default:
        return false;
    }
  });

  if (verifiedLevels.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="success" className="gap-1 cursor-help">
              <CheckCircle2 className={sizeClasses[size]} />
              <span className="hidden sm:inline">Verified</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {verifiedLevels.map((v) => (
                <div key={v.key} className="flex items-center gap-2 text-sm">
                  <v.icon className={`h-3.5 w-3.5 ${v.color}`} />
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
