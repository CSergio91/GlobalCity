import React from 'react';
import { AuthCard } from './AuthCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto animate-in zoom-in-95 duration-200">
        <AuthCard 
          onSuccess={onSuccess}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
