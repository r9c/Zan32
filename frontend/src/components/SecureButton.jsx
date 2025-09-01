import React from 'react';
import { motion } from 'framer-motion';

const SecureButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  const buttonVariants = {
    primary: {
      background: 'rgba(68, 68, 68, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hover: {
        background: 'rgba(88, 88, 88, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        scale: 1.05,
        y: -2
      }
    },
    secondary: {
      background: 'rgba(44, 44, 44, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hover: {
        background: 'rgba(64, 64, 64, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        scale: 1.05,
        y: -2
      }
    }
  };

  const sizeVariants = {
    small: { padding: '0.5rem 1rem', fontSize: '0.9rem' },
    medium: { padding: '0.8rem 2rem', fontSize: '1.1rem' },
    large: { padding: '1rem 2.5rem', fontSize: '1.3rem' }
  };

  const currentVariant = buttonVariants[variant];
  const currentSize = sizeVariants[size];

  return (
    <motion.button
      className="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : currentVariant.hover}
      whileTap={disabled ? {} : { scale: 0.95, y: 0 }}
      style={{
        ...currentVariant,
        ...currentSize,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        ...props.style
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default SecureButton;
