import { forwardRef, type HTMLAttributes, useRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number | number[];
  onChange: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onChange, min = 0, max = 100, step = 1, range = false, disabled = false, showValue = false, label, ...props }, ref) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeThumb, setActiveThumb] = useState<number | null>(null);
    const values = Array.isArray(value) ? value : [value];

    const getPercent = (val: number) => ((val - min) / (max - min)) * 100;
    const getValue = (percent: number) => min + (percent / 100) * (max - min);
    const snapToStep = (val: number) => Math.round(val / step) * step;

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setActiveThumb(index);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (activeThumb === null || !trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      let newValue = snapToStep(getValue(percent));
      newValue = Math.max(min, Math.min(max, newValue));
      
      const newValues = [...values];
      newValues[activeThumb] = newValue;
      newValues.sort((a, b) => a - b);
      onChange(range ? newValues : newValues[0]);
    };

    const handleMouseUp = () => {
      setActiveThumb(null);
    };

    useEffect(() => {
      if (activeThumb !== null) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [activeThumb]);

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newValue = values[index];
      const stepValue = e.shiftKey ? step * 10 : step;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, snapToStep(newValue + stepValue));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, snapToStep(newValue - stepValue));
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }
      
      const newValues = [...values];
      newValues[index] = newValue;
      newValues.sort((a, b) => a - b);
      onChange(range ? newValues : newValues[0]);
    };

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-space-300">{label}</label>
            {showValue && (
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                {range ? values.map(v => v.toFixed(0)).join(' - ') : values[0].toFixed(0)}
              </span>
            )}
          </div>
        )}
        <div
          ref={trackRef}
          className="relative h-2 bg-space-800 rounded-full cursor-pointer"
          onMouseDown={(e) => {
            if (disabled || range) return;
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return;
            const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            let newValue = snapToStep(getValue(percent));
            newValue = Math.max(min, Math.min(max, newValue));
            onChange(newValue);
          }}
        >
          <div
            className="absolute top-0 h-full bg-cyan-500 rounded-full transition-all duration-100"
            style={{
              left: `${range ? getPercent(values[0]) : 0}%`,
              width: `${range ? getPercent(values[1]) - getPercent(values[0]) : getPercent(values[0])}%`,
            }}
          />
          {values.map((val, index) => (
            <div
              key={index}
              ref={(el) => { thumbRefs.current[index] = el; }}
              onMouseDown={handleMouseDown(index)}
              onKeyDown={handleKeyDown(index)}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={val}
              aria-label={label}
              aria-orientation="horizontal"
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full border-2 border-space-950 shadow-lg transition-transform duration-100 focus-visible-ring',
                activeThumb === index && 'scale-125',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ left: `calc(${getPercent(val)}% - 10px)` }}
            >
              <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';