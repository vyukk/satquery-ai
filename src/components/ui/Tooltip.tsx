import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import * as React from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 200, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const childRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-cyan-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-cyan-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-cyan-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-cyan-900',
  };

  const tooltipContent = isVisible ? (
    <div
      ref={tooltipRef}
      className={clsx(
        'fixed z-50 px-3 py-2 bg-cyan-900 text-space-100 text-xs font-medium rounded-lg shadow-glow-cyan whitespace-nowrap max-w-[300px]',
        positions[position],
        className
      )}
      role="tooltip"
    >
      {content}
      <div
        className={clsx(
          'absolute w-0 h-0 border-4 border-transparent',
          arrows[position]
        )}
      />
    </div>
  ) : null;

  const enhancedChildren = typeof children === 'object' && children !== null && 'props' in children
    ? React.cloneElement(children as React.ReactElement, {
        ref: childRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      } as any)
    : (
      <span
        ref={childRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block cursor-help"
      >
        {children}
      </span>
    );

  return (
    <>
      {enhancedChildren}
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}