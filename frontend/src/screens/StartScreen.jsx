import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import FadeTransition from '../components/FadeTransition';

const StartScreen = ({ onComplete }) => {
  useEffect(() => {
    // Fade out after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="screen-container">
      <FadeTransition>
        <motion.div
          className="screen-title"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.95, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ZAN32
        </motion.div>
      </FadeTransition>
    </div>
  );
};

export default StartScreen;
