import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CodeInput = ({ onCodeSubmit, placeholder = "Enter Code" }) => {
  const [code, setCode] = useState('');

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 6) value = value.slice(0, 6); // Limit to 6 digits
    
    // Format as XXX-XXX
    if (value.length >= 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    setCode(value);
  };

  const handleSubmit = () => {
    if (code.replace(/\D/g, '').length === 6) {
      onCodeSubmit(code);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
    >
      <input
        type="text"
        value={code}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="input-field"
        maxLength={7}
        style={{ width: '250px' }}
      />
      <motion.button
        className="button"
        onClick={handleSubmit}
        disabled={code.replace(/\D/g, '').length !== 6}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          opacity: code.replace(/\D/g, '').length === 6 ? 1 : 0.5,
          cursor: code.replace(/\D/g, '').length === 6 ? 'pointer' : 'not-allowed'
        }}
      >
        Enter Code
      </motion.button>
    </motion.div>
  );
};

export default CodeInput;
