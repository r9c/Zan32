import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
<<<<<<< HEAD
import SplashScreen from './screens/SplashScreen';
import TransitionScreen from './screens/TransitionScreen';
import CodeScreen from './screens/CodeScreen';
import './styles/globals.css';

function App() {
  const [step, setStep] = useState(0);
=======
import StarryBackground from './components/StarryBackground';
import StartScreen from './screens/StartScreen';
import JoinScreen from './screens/JoinScreen';
import ChatScreen from './screens/ChatScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('start');

  const handleStartComplete = () => {
    setCurrentScreen('join');
  };

  const handleJoinComplete = () => {
    setCurrentScreen('chat');
  };

  const handleBackToJoin = () => {
    setCurrentScreen('join');
  };
>>>>>>> 1d89b58 (Initial commit - current project)

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
<<<<<<< HEAD
      width: "100vw"
    }}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="splash"
            style={{ width: "100%" }}
=======
      width: "100vw",
      position: "relative"
    }}>
      <StarryBackground />
      
      <AnimatePresence mode="wait">
        {currentScreen === 'start' && (
          <motion.div
            key="start"
            style={{ width: "100%", height: "100%" }}
>>>>>>> 1d89b58 (Initial commit - current project)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
<<<<<<< HEAD
            <SplashScreen onComplete={() => setStep(1)} />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="transition"
            style={{ width: "100%" }}
=======
            <StartScreen onComplete={handleStartComplete} />
          </motion.div>
        )}
        
        {currentScreen === 'join' && (
          <motion.div
            key="join"
            style={{ width: "100%", height: "100%" }}
>>>>>>> 1d89b58 (Initial commit - current project)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
<<<<<<< HEAD
            <TransitionScreen onComplete={() => setStep(2)} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="code"
            style={{ width: "100%" }}
=======
            <JoinScreen onComplete={handleJoinComplete} />
          </motion.div>
        )}
        
        {currentScreen === 'chat' && (
          <motion.div
            key="chat"
            style={{ width: "100%", height: "100%" }}
>>>>>>> 1d89b58 (Initial commit - current project)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
<<<<<<< HEAD
            <CodeScreen />
=======
            <ChatScreen onBackToJoin={handleBackToJoin} />
>>>>>>> 1d89b58 (Initial commit - current project)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;