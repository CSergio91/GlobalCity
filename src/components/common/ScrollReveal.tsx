import React, { useRef, useState, useEffect } from 'react';

export type RevealAnimation = 
  | 'fade-up' 
  | 'zoom-in' 
  | 'slide-left' 
  | 'slide-right' 
  | 'fade-in' 
  | 'flip-up' 
  | 'blur-reveal' 
  | 'scale-pop';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: RevealAnimation;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  threshold = 0.1,
  once = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialStyle = (): string => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-10';
      case 'zoom-in':
        return 'opacity-0 scale-[0.92]';
      case 'slide-left':
        return 'opacity-0 -translate-x-12';
      case 'slide-right':
        return 'opacity-0 translate-x-12';
      case 'flip-up':
        return 'opacity-0 [transform:perspective(1000px)_rotateX(22deg)_translateY(40px)]';
      case 'blur-reveal':
        return 'opacity-0 blur-md scale-[0.96] translate-y-6';
      case 'scale-pop':
        return 'opacity-0 scale-[0.88] translate-y-4';
      case 'fade-in':
      default:
        return 'opacity-0';
    }
  };

  const getVisibleStyle = (): string => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-100 translate-y-0';
      case 'zoom-in':
        return 'opacity-100 scale-100';
      case 'slide-left':
        return 'opacity-100 translate-x-0';
      case 'slide-right':
        return 'opacity-100 translate-x-0';
      case 'flip-up':
        return 'opacity-100 [transform:perspective(1000px)_rotateX(0deg)_translateY(0)]';
      case 'blur-reveal':
        return 'opacity-100 blur-0 scale-100 translate-y-0';
      case 'scale-pop':
        return 'opacity-100 scale-100 translate-y-0';
      case 'fade-in':
      default:
        return 'opacity-100';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
      }}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        isVisible ? getVisibleStyle() : getInitialStyle()
      } ${className}`}
    >
      {children}
    </div>
  );
};

