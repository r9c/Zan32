import React from 'react';
import { motion } from 'framer-motion';

const FadeTransition = ({ children, delay = 0, duration = 0.6, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FadeTransition;
