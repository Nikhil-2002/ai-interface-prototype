import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  description?: string;
  unit?: string;
  className?: string;
  'data-testid'?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  disabled = false,
  showValue = true,
  description,
  unit = '',
  className = '',
  'data-testid': testId,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value);
      onChange(newValue);
    },
    [onChange]
  );
  
  const formatValue = (val: number): string => {
    if (step >= 1) {
      return `${Math.round(val)}${unit}`;
    }
    return `${val.toFixed(2)}${unit}`;
  };
  
  return (
    <div className={`space-y-2 ${className}`} data-testid={testId}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={`slider-${label}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        {showValue && (
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {formatValue(value)}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Progress */}
          <motion.div
            className="h-full bg-primary-500 rounded-full origin-left"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>
        
        {/* Slider Input */}
        <input
          id={`slider-${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
        />
        
        {/* Custom Thumb */}
        <motion.div
          className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
          animate={{
            scale: disabled ? 0.8 : 1,
            opacity: disabled ? 0.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
      
      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default Slider;
