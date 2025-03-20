import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiMenu, FiX, FiSearch, FiUser } from 'react-icons/fi';
import { HiOutlineMoon, HiOutlineSun, HiOutlineLogout } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { showToast } from '../utils/toast';
import Logo from './Logo';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

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
    setUserMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/');
      showToast.success('Logged out successfully');
    } catch (err) {
      showToast.error(err?.data?.message || 'Logout failed');
    }
  };

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

            {/* User Profile or Login Button */}
            {userInfo ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 glass-light rounded-lg px-3 py-2 text-white ml-2 hidden sm:flex"
                >
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white overflow-hidden">
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-4 h-4" />
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{userInfo.name}</span>
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-dark rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10">
                        Profile
                      </Link>
                      <button
                        onClick={logoutHandler}
                        className="flex items-center w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <HiOutlineLogout className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Link to="/login">
                  <button className="glass-button rounded-lg px-5 py-2 text-white ml-2 hidden sm:inline-block">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

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
            {userInfo ? (
              <>
                <Link to="/profile" className="px-4 py-3 block rounded-lg mb-1 text-white/70 hover:text-white hover:bg-white/5">
                  Profile
                </Link>
                <button
                  onClick={logoutHandler}
                  className="px-4 py-3 mt-2 block glass-button rounded-lg text-white text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div>
                <Link
                  to="/login"
                  className="px-4 py-3 mt-2 block glass-button rounded-lg text-white text-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;