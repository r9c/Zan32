import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CodeScreen() {
  const [totp, setTotp] = useState("123-456");

  // Simulate TOTP refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newCode = Math.floor(100000 + Math.random() * 900000)
        .toString()
        .replace(/(\d{3})(\d{3})/, "$1-$2");
      setTotp(newCode);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="code-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "1rem",
      }}
    >
      <motion.h1
        style={{ fontWeight: "700", fontSize: "3rem" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        ZAN32
      </motion.h1>

      {/* User Code Section */}
      <p style={{ marginBottom: "0.2rem", opacity: 0.8 }}>Your Code:</p>
      <motion.div
        style={{
          backgroundColor: "#2c2c2c",
          padding: "0.8rem 2rem",
          borderRadius: "8px",
          fontSize: "1.5rem",
          letterSpacing: "2px",
          textAlign: "center",
          minWidth: "200px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {totp}
      </motion.div>

      {/* Enter Code Section */}
      <motion.input
        placeholder="Enter Code"
        style={{
          padding: ".8rem",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "1.2rem",
          width: "200px",
          backgroundColor: "#2c2c2c",
          color: "white",
          border: "none",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      />

      <motion.button
        style={{
          padding: "0.6rem 1.5rem",
          borderRadius: "8px",
          backgroundColor: "#444",
          color: "white",
          fontWeight: "500",
          cursor: "pointer",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Enter Code
      </motion.button>
    </motion.div>
  );
}



