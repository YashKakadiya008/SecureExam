import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';

/**
 * ScreenWrapper provides consistent styling and layout for all screens
 * with the new dark theme design and glassmorphism effects
 */
const ScreenWrapper = ({ children, className = "" }) => {
  const { isDarkMode } = useTheme();

  // Background orbs for visual effect
  const orbs = [
    { size: 300, posX: '70%', posY: '10%', blur: 80, delay: 0 },
    { size: 200, posX: '15%', posY: '30%', blur: 70, delay: 0.5 },
    { size: 350, posX: '60%', posY: '70%', blur: 90, delay: 1 },
    { size: 250, posX: '10%', posY: '85%', blur: 60, delay: 1.5 },
  ];

  return (
    <div className="noise bg-black min-h-screen relative overflow-hidden">
      {/* Background Orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white/5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ 
            delay: orb.delay, 
            duration: 2, 
            ease: "easeOut",
          }}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.posX,
            top: orb.posY,
            filter: `blur(${orb.blur}px)`,
            zIndex: 0
          }}
        />
      ))}

      <Header />
      
      <main className={`relative z-10 pt-24 ${className}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default ScreenWrapper; 