import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { motion } from 'framer-motion';
import { FaBrain, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import { FcGoogle } from 'react-icons/fc';
import config from '../config/config.js';
import Logo from '../components/Logo';
import { showToast } from '../utils/toast';
import ScreenWrapper from '../components/ScreenWrapper';

const LoginScreen = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && !isLoading) {
      const redirectPath = getRedirectPath(userInfo.userType);
      navigate(redirectPath);
    }
  }, [navigate, userInfo, isLoading]);

  const getRedirectPath = (userType) => {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'institute':
        return '/institute/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
      showToast.success('Login successful');
    } catch (err) {
      showToast.error(err?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = () => {
    const authUrl = process.env.NODE_ENV === 'production'
      ? 'https://backdeploy-9bze.onrender.com/api/users/auth/google'
      : 'http://localhost:5000/api/users/auth/google';
    window.location.href = authUrl;
  };

  return (
    <ScreenWrapper className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 my-12"
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Welcome Back
          </h2>
          <div className="glass-divider w-24 mx-auto my-4"></div>
          <p className="mt-2 text-sm text-white/70">
            Sign in to your account
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-xl p-8">
          <div className="relative mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="glass-button w-full flex items-center justify-center px-4 py-3 rounded-lg"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              <span className="text-white">
                Continue with Google
              </span>
            </motion.button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full glass-divider"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-white/70">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="relative">
            <form 
              onSubmit={submitHandler} 
              className="glass rounded-lg p-8 space-y-6"
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="glass block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/40"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="glass block w-full pl-10 pr-12 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/40"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FaEye className="h-5 w-5 text-white/50 hover:text-white/70 cursor-pointer transition-colors" />
                      ) : (
                        <FaEyeSlash className="h-5 w-5 text-white/50 hover:text-white/70 cursor-pointer transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="glass-button w-full flex justify-center py-3 px-4 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-150"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-white/70">
              New to SecureExam?{' '}
              <Link to="/register" className="font-medium text-white hover:text-white/80 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </ScreenWrapper>
  );
};

export default LoginScreen;