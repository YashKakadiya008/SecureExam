import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaBrain, FaChalkboardTeacher, FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { clearAuthCookies } from '../utils/cookieUtils';
import logoImage from '../assets/logo.png';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isExamMode, setIsExamMode] = useState(() => {
    // Initialize with a function to avoid initialization issues
    return !!localStorage.getItem('examState');
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkExamMode = () => {
      try {
        const examState = localStorage.getItem('examState');
        setIsExamMode(!!examState);
      } catch (error) {
        console.error('Error checking exam mode:', error);
        setIsExamMode(false);
      }
    };

    // Create a custom event handler
    const handleExamStateChange = (event) => {
      if (event.detail?.type === 'examState') {
        checkExamMode();
      }
    };

    // Initial check
    checkExamMode();

    // Add event listeners
    window.addEventListener('customExamState', handleExamStateChange);
    window.addEventListener('storage', checkExamMode);

    return () => {
      window.removeEventListener('customExamState', handleExamStateChange);
      window.removeEventListener('storage', checkExamMode);
    };
  }, []);

  if (isExamMode) {
    return null;
  }

  const logoutHandler = async () => {
    try {
      const response = await logoutApiCall().unwrap();
      if (response.success) {
        // Clear exam state from localStorage
        localStorage.removeItem('examState');
        localStorage.removeItem('studentDashboardTab');
        
        // Clear all auth-related data
        clearAuthCookies();
        dispatch(logout());
        
        // Notify components about exam state change
        const event = new CustomEvent('customExamState', {
          detail: {
            type: 'examState',
            isActive: false
          }
        });
        window.dispatchEvent(event);
        
        // Force a page reload to clear any cached state
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Attempt to logout anyway
      localStorage.removeItem('examState');
      localStorage.removeItem('studentDashboardTab');
      clearAuthCookies();
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  // Generate avatar using DiceBear API
  const getAvatar = (name) => {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
  };

  // Only show navigation items when user is NOT logged in
  const navigationItems = userInfo ? [] : [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const ThemeToggle = () => {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`p-2 rounded-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        } focus:outline-none`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        layout
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDarkMode ? 'dark' : 'light'}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDarkMode ? (
              <FaSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FaMoon className="w-5 h-5 text-gray-600" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  };

  // Add this handler to close mobile menu when navigation occurs
  const handleNavigation = () => {
    setIsOpen(false); // Close mobile menu
    setDropdownOpen(false); // Close dropdown if open
  };

  return (
    <>
      {!isExamMode && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-40 ${
            scrolled 
              ? isDarkMode 
                ? 'bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-gray-800'
                : 'bg-white/90 backdrop-blur-xl border-b border-gray-200'
              : isDarkMode
                ? 'bg-transparent'
                : 'bg-transparent'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14"
                  >
                    <img 
                      src={logoImage} 
                      alt="NexusEdu Logo" 
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <span className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    NexusEdu
                  </span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={handleNavigation}
                      className={`transition-colors duration-300 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
                {userInfo ? (
                  <div className="relative">
                    <motion.button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center space-x-3 p-2 rounded-xl ${
                        isDarkMode 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getAvatar(userInfo.name)}
                          alt="Profile"
                          className="w-10 h-10 rounded-lg ring-2 ring-violet-500"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></div>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {userInfo.name}
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-2 w-64 rounded-2xl ${
                            isDarkMode 
                              ? 'bg-[#0A0F1C] ring-1 ring-gray-800' 
                              : 'bg-white ring-1 ring-gray-200'
                          } shadow-xl p-2`}
                        >
                          <div className="p-3">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {userInfo.email}
                            </p>
                          </div>
                          <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`} />
                          <Link
                            to="/profile"
                            onClick={handleNavigation}
                            className={`flex items-center space-x-3 p-3 rounded-xl ${
                              isDarkMode 
                                ? 'hover:bg-white/5 text-white' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <FaUser className="text-violet-500" />
                            <span>Profile</span>
                          </Link>
                          <button
                            onClick={() => {
                              handleNavigation();
                              logoutHandler();
                            }}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500"
                          >
                            <FaSignOutAlt />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      onClick={handleNavigation}
                      className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={handleNavigation}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`w-full h-0.5 transform transition-all duration-300 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-900'
                  } ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`w-full h-0.5 transition-all duration-300 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-900'
                  } ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`w-full h-0.5 transform transition-all duration-300 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-900'
                  } ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </motion.button>
            </div>
          </nav>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`md:hidden ${
                  isDarkMode 
                    ? 'bg-[#0A0F1C] border-t border-gray-800'
                    : 'bg-white border-t border-gray-200'
                }`}
              >
                <div className="px-4 py-6 space-y-4">
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg">
                    <span className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>

                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={handleNavigation}
                      className={`block px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-white/10' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {userInfo ? (
                    <>
                      <Link 
                        to="/profile" 
                        onClick={handleNavigation}
                        className={`block px-4 py-2 rounded-lg ${
                          isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleNavigation();
                          logoutHandler();
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={handleNavigation}
                        className={`block px-4 py-2 rounded-lg ${
                          isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/register"
                        onClick={handleNavigation}
                        className="block px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      >
                        Join Now
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </>
  );
};

export default Header;