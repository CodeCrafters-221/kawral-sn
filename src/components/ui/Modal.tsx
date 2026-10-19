import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { cn } from '@/src/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
  className,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(maxWidthClasses[maxWidth], className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title && typeof title === 'string' ? (
              <DialogTitle>{title}</DialogTitle>
            ) : (
              title
            )}
            {description && typeof description === 'string' ? (
              <DialogDescription>{description}</DialogDescription>
            ) : (
              description
            )}
          </DialogHeader>
        )}
        <div className="overflow-y-auto flex-1 min-h-0 py-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
