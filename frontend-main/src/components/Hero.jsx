import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaArrowRight, FaShieldAlt, FaBrain, FaLock, FaGraduationCap, FaUserShield, FaFingerprint, FaCogs, FaChartBar } from 'react-icons/fa';
import Footer from './Footer';

const Hero = () => {
  const { isDarkMode } = useTheme();

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideUp = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", damping: 15 } }
  };

  const slideRight = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", damping: 15 } }
  };

  const slideLeft = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", damping: 15 } }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const orbs = [
    { size: 300, posX: '70%', posY: '10%', blur: 80, delay: 0 },
    { size: 200, posX: '15%', posY: '30%', blur: 70, delay: 0.5 },
    { size: 350, posX: '60%', posY: '70%', blur: 90, delay: 1 },
    { size: 250, posX: '10%', posY: '85%', blur: 60, delay: 1.5 },
  ];

  return (
    <div className="noise bg-black min-h-screen relative overflow-hidden pt-24">
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
          }}
        />
      ))}

      {/* Hero Section - Asymmetric Layout */}
      <section className="relative z-10 py-10 mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Left Content Column (3/5) */}
          <motion.div 
            className="lg:col-span-3 space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={slideRight}
              className="flex items-center space-x-4"
            >
              <div className="w-20 h-1 bg-white opacity-50"></div>
              <span className="text-white/70 text-lg uppercase tracking-widest">Secure Exam Platform</span>
            </motion.div>

            <motion.h1 
              variants={slideRight}
              className="text-6xl md:text-7xl font-bold text-white leading-tight"
            >
              <span className="block">Next Generation</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                Assessment Technology
              </span>
            </motion.h1>

            <motion.p
              variants={slideRight} 
              className="text-lg md:text-xl text-white/70 max-w-xl"
            >
              Revolutionizing the examination process with state-of-the-art security, AI-powered monitoring, and a seamless interface for both students and administrators.
            </motion.p>

            <motion.div 
              variants={slideRight}
              className="flex flex-wrap gap-5 pt-4"
            >
              <Link to="/register">
                <button className="glass-button rounded-xl px-8 py-4 text-white font-medium hover:translate-y-[-2px] transition-all">
                  <span className="flex items-center">
                    Get Started
                    <FaArrowRight className="ml-2" />
                  </span>
                </button>
              </Link>
              <Link to="/about">
                <button className="glass-dark rounded-xl px-8 py-4 text-white/80 font-medium hover:translate-y-[-2px] transition-all">
                  <span>Learn More</span>
                </button>
              </Link>
            </motion.div>

            <motion.div
              variants={slideUp}
              className="flex items-center space-x-4 pt-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-300" />
                ))}
              </div>
              <div className="text-white/70 text-sm">
                Trusted by <span className="text-white">100K+</span> institutions worldwide
              </div>
            </motion.div>
          </motion.div>

          {/* Right Feature Card Column (2/5) */}
          <motion.div 
            className="lg:col-span-2"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              variants={slideLeft}
              className="glass-card rounded-3xl p-8 h-full glass-highlight"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <FaFingerprint className="text-white text-xl" />
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white opacity-60" />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Identity Verification</h3>
                <p className="text-white/70 mb-6">
                  Multi-factor authentication with advanced biometric verification ensures every student's identity is correctly verified.
                </p>

                <div className="mt-auto">
                  <div className="glass-divider mb-6"></div>
                  <div className="flex justify-between items-center">
                    <div className="text-white/70">Security Level</div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-4 h-1 rounded-full ${i <= 4 ? 'bg-white' : 'bg-white/30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section - Staggered Glass Cards */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16"
          >
            <div>
              <h2 className="text-4xl font-bold text-white">Core System Features</h2>
              <div className="glass-divider w-24 mt-4 mb-6"></div>
              <p className="text-white/70 max-w-lg">
                Our platform combines cutting-edge technology with intuitive design to create a secure and efficient examination environment.
              </p>
            </div>
            <Link to="/features" className="text-white mt-6 md:mt-0 flex items-center group">
              <span>Explore all features</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUserShield/>,
                title: "Advanced Proctoring",
                description: "AI-powered monitoring detects suspicious behavior and prevents cheating in real-time.",
                delay: 0.1
              },
              {
                icon: <FaLock/>,
                title: "Browser Lockdown",
                description: "Full system control prevents access to unauthorized resources during exams.",
                delay: 0.2
              },
              {
                icon: <FaFingerprint/>,
                title: "Biometric Verification",
                description: "Multi-factor authentication ensures the correct identity of each candidate.",
                delay: 0.3
              },
              {
                icon: <FaCogs/>,
                title: "Customizable Workflow",
                description: "Fully adaptable exam creation and administration tools for any education level.",
                delay: 0.4
              },
              {
                icon: <FaChartBar/>,
                title: "Detailed Analytics",
                description: "Comprehensive reporting and insights on student performance and potential issues.",
                delay: 0.5
              },
              {
                icon: <FaBrain/>,
                title: "AI Question Generation",
                description: "Intelligent question creation and automated assessment for various subject matters.",
                delay: 0.6
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="glass-card rounded-2xl p-8 hover:translate-y-[-5px] transition-all duration-300"
              >
                <div className="w-14 h-14 glass rounded-xl flex items-center justify-center mb-6 text-white text-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Horizontal Glass Panel */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "30M+", label: "Exams Conducted" },
                { value: "95%", label: "Cheating Reduction" },
                { value: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/60 uppercase tracking-wider text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section - Asymmetric With Glass */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -z-1"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  What Educational Institutions Are Saying
                </h2>
                <div className="glass-divider w-32 mb-8"></div>
                
                <blockquote className="text-white/80 text-lg md:text-xl mb-8">
                  "SecureExam has transformed how we conduct assessments. The platform's security features and ease of use have made remote testing not just possible, but preferable for both our faculty and students."
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-400 mr-4"></div>
                  <div>
                    <div className="text-white font-medium">Dr. Sarah Johnson</div>
                    <div className="text-white/60">Dean of Academics, University of Technology</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 mb-8 relative">
                  <div className="text-white/80 italic">
                    "The analytics provided by SecureExam gave us unprecedented insights into student performance patterns."
                  </div>
                  <div className="mt-4 text-white/60 text-sm">
                    — Prof. Michael Chen, Data Science Department
                  </div>
                </div>
                
                <div className="glass rounded-2xl p-6 ml-12 relative">
                  <div className="text-white/80 italic">
                    "We reduced cheating incidents by 98% in the first semester of implementation."
                  </div>
                  <div className="mt-4 text-white/60 text-sm">
                    — Amanda Torres, Exam Coordinator
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Centered Glass Card */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Examination Process?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of educational institutions worldwide that trust SecureExam for their assessment needs.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button rounded-xl px-10 py-5 text-white font-medium"
              >
                <span className="flex items-center text-lg">
                  Get Started Now
                  <FaArrowRight className="ml-2" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Hero;
