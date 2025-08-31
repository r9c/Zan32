import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FadeTransition from '../components/FadeTransition';
import CodeInput from '../components/CodeInput';

const JoinScreen = ({ onComplete }) => {
  const [enteredCode, setEnteredCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Generate initial 6-digit code
    const generateSixDigitCode = () => {
      return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .replace(/(\d{3})(\d{3})/, "$1-$2");
    };

    setCurrentCode(generateSixDigitCode());

    // Timer countdown and code refresh every 30 seconds
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCurrentCode(generateSixDigitCode());
          return 30;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeSubmit = (code) => {
    setEnteredCode(code);
    // Simulate validation delay
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className="screen-container">
      <FadeTransition>
        <motion.div
          className="screen-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ZAN32
        </motion.div>
      </FadeTransition>

      <FadeTransition delay={0.3}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="screen-subtitle" style={{ margin: 0 }}>
            Your Code:
          </p>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            {timeLeft}s
          </div>
        </motion.div>
      </FadeTransition>

      <FadeTransition delay={0.4}>
        <motion.div
          className="code-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {currentCode}
        </motion.div>
      </FadeTransition>

      <FadeTransition delay={0.6}>
        <motion.p
          className="screen-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Enter the 6-digit code to join
        </motion.p>
      </FadeTransition>

      <FadeTransition delay={0.8}>
        <CodeInput onCodeSubmit={handleCodeSubmit} />
      </FadeTransition>

      {enteredCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}
        >
          Connecting...
        </motion.div>
      )}
    </div>
  );
};

export default JoinScreen;
