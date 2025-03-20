import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import Logo from './Logo';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`absolute inset-0 ${scrolled ? 'glass-dark' : 'bg-transparent'} transition-all duration-500`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="relative z-10">
              <Logo width="40" height="40" showText={true} />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.path}
                  className={`px-4 py-2 mx-1 rounded-lg text-white/80 hover:text-white transition-all relative group ${
                    location.pathname === item.path ? 'text-white' : ''
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                  <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full glass relative overflow-hidden"
            >
              <FiSearch className="text-white w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full glass relative overflow-hidden"
            >
              {isDarkMode ? (
                <HiOutlineSun className="text-white w-5 h-5" />
              ) : (
                <HiOutlineMoon className="text-white w-5 h-5" />
              )}
            </button>

            {/* Login/Register Button */}
            <div>
              <Link to="/login">
                <button className="glass-button rounded-lg px-5 py-2 text-white ml-2 hidden sm:inline-block">
                  Sign In
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="ml-2 p-2.5 rounded-full glass md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX className="w-5 h-5 text-white" /> : <FiMenu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 glass-dark py-4 px-4 sm:px-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center glass rounded-xl px-4 py-3">
              <FiSearch className="text-white/60 w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Search SecureExam..."
                className="bg-transparent w-full text-white outline-none placeholder:text-white/60"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 glass-dark border-t border-white/10 md:hidden overflow-hidden">
          <nav className="flex flex-col py-4 px-4">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.path}
                  className={`px-4 py-3 block rounded-lg mb-1 ${
                    location.pathname === item.path
                      ? 'glass-button text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
            <div>
              <Link
                to="/login"
                className="px-4 py-3 mt-2 block glass-button rounded-lg text-white text-center sm:hidden"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;