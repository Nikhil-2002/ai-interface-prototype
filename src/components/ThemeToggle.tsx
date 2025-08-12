import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Theme } from '../types';
import { useApp } from '../contexts/AppContext';

export interface ThemeToggleProps {
  className?: string;
  'data-testid'?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  'data-testid': testId,
}) => {
  const { theme, setTheme } = useApp();
  
  const themes: Array<{ value: Theme; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun size={16} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
    { value: 'system', icon: <Monitor size={16} />, label: 'System' },
  ];
  
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  
  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };
  
  return (
    <motion.button
      type="button"
      onClick={handleThemeChange}
      className={`relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Current theme: ${currentTheme.label}. Click to cycle through themes.`}
      data-testid={testId}
      title={`Switch theme (current: ${currentTheme.label})`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {currentTheme.icon}
      </motion.div>
      
      {/* Theme indicator */}
      <motion.div
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
        style={{
          backgroundColor: 
            theme === 'light' ? '#fbbf24' : 
            theme === 'dark' ? '#6366f1' : 
            '#10b981'
        }}
        layoutId="theme-indicator"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
