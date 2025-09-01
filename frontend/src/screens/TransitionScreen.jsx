import { useEffect } from 'react';

export default function TransitionScreen({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
    }, 800);
    return () => clearTimeout(timer);
}, [onComplete]);

    return (
        <div
            style={{
                backgroundColor: '1f1f1f',
                width: '100%',
                height: '100vh'
            }}
        />    
    );
}