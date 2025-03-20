import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { motion } from 'framer-motion';
import { FaBrain, FaEnvelope, FaLock, FaUser, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import config from '../config/config.js';
import { showToast } from '../utils/toast';
import ScreenWrapper from '../components/ScreenWrapper';

const RegisterScreen = () => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    // Check for successful Google OAuth login
    const params = new URLSearchParams(location.search);
    const loginSuccess = params.get('loginSuccess');
    const error = params.get('error');

    if (loginSuccess === 'true') {
      showToast.success('Login successful');
      // Redirect to appropriate dashboard based on user type
      if (userInfo) {
        const dashboardPath = getDashboardPath(userInfo.userType);
        navigate(dashboardPath);
      }
    } else if (error) {
      showToast.error(decodeURIComponent(error));
    }
  }, [location, userInfo, navigate]);

  const getDashboardPath = (userType) => {
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

  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score based on met requirements
    const score = Object.values(requirements).filter(Boolean).length;

    setPasswordStrength({ score, requirements });
  };

  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
      case 3:
        return 'bg-yellow-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  // Update password strength when password changes
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const isPasswordValid = () => {
    return Object.values(passwordStrength.requirements).every(Boolean);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    if (!termsAgreed) {
      showToast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      showToast.success('Registration successful');
      navigate('/');
    } catch (err) {
      // Show the specific error message from the backend
      if (err?.data?.message) {
        // Server error message (e.g., "User already exists")
        showToast.error(err.data.message);
      } else if (!navigator.onLine) {
        showToast.error('No internet connection. Please check your network.');
      } else if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        showToast.error('Unable to connect to the server. Please try again later.');
      } else {
        showToast.error('User already exists');
      }
      console.error('Registration error:', err); // For debugging
    }
  };

  const handleGoogleSignIn = () => {
    const authUrl = `${config.API_BASE_URL}/api/users/auth/google`;
    // Ensure HTTPS in production and correct redirect
    if (process.env.NODE_ENV === 'production') {
      const redirectUrl = `${config.FRONTEND_URL}/register`;
      window.location.href = `${authUrl}?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    } else {
      window.location.href = authUrl;
    }
  };

  return (
    <ScreenWrapper>
      <div className="max-w-md mx-auto pb-12 px-4 pt-4">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Create Account
          </h1>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-6">
            <p className="text-white/70 text-center mb-6">
              Join the future of secure education
            </p>
            
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="glass w-full flex items-center justify-center px-4 py-3 rounded-lg text-white mb-6"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              <span>Continue with Google</span>
            </button>
            
            {/* Divider */}
            <div className="glass-divider my-4 relative">
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 px-4 text-white/50 text-sm">
                Or with email
              </span>
            </div>
            
            <form onSubmit={submitHandler} className="space-y-4 mt-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-white/80">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-white/50" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="glass w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-white/50"
                  />
                </div>
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-white/80">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-white/50" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-white/50"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-white/80">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-white/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEye className="text-white/50 hover:text-white cursor-pointer transition-colors" />
                    ) : (
                      <FaEyeSlash className="text-white/50 hover:text-white cursor-pointer transition-colors" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`${getStrengthColor()} h-full transition-all duration-300`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className={`flex items-center ${passwordStrength.requirements.length ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="w-4 h-4 mr-1 inline-block">{passwordStrength.requirements.length ? '✓' : '○'}</span> At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.requirements.uppercase ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="w-4 h-4 mr-1 inline-block">{passwordStrength.requirements.uppercase ? '✓' : '○'}</span> Uppercase letter
                      </div>
                      <div className={`flex items-center ${passwordStrength.requirements.lowercase ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="w-4 h-4 mr-1 inline-block">{passwordStrength.requirements.lowercase ? '✓' : '○'}</span> Lowercase letter
                      </div>
                      <div className={`flex items-center ${passwordStrength.requirements.number ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="w-4 h-4 mr-1 inline-block">{passwordStrength.requirements.number ? '✓' : '○'}</span> Number
                      </div>
                      <div className={`flex items-center ${passwordStrength.requirements.special ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="w-4 h-4 mr-1 inline-block">{passwordStrength.requirements.special ? '✓' : '○'}</span> Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-white/80">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-white/50" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="glass w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaEye className="text-white/50 hover:text-white cursor-pointer transition-colors" />
                    ) : (
                      <FaEyeSlash className="text-white/50 hover:text-white cursor-pointer transition-colors" />
                    )}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="glass-light h-4 w-4 rounded text-violet-600 border-white/30 focus:ring-violet-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-white/70">
                    I agree to the <Link to="/terms" className="text-violet-400 hover:text-violet-300">Terms of Service</Link> and <Link to="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !termsAgreed}
                  className={`glass-button w-full py-3 rounded-lg text-white font-medium ${
                    isLoading || !termsAgreed ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? <Loader small /> : 'Create Account'}
                </button>
              </div>
              
              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-white/70">
                  Already have an account?{' '}
                  <Link to="/login" className="text-violet-400 hover:text-violet-300">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default RegisterScreen;