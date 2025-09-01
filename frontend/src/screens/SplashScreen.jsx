import { useEffect } from 'react';
import  { motion } from 'framer-motion';

export default function Splashscreen({ onComplete}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '4rem',
            fontWeight: '700'
        }}
        animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.95, 1]
        }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        ZAN32
    </motion.div>
    );
}
