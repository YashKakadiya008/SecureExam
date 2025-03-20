import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useUpdateUserMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { showToast } from '../utils/toast';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaUserCircle, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import ScreenWrapper from '../components/ScreenWrapper';

const ProfileScreen = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
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

  useEffect(() => {
    if (userInfo?.name) {
      setAvatarUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userInfo.name)}&backgroundColor=6d28d9`);
    }
  }, [userInfo?.name]);

  useEffect(() => {
    if (userInfo && !isEditing) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPassword('');
      setConfirmPassword('');
    }
  }, [userInfo, isEditing]);

  // Password strength checker function
  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        _id: userInfo._id,
        name: name !== userInfo.name ? name : undefined,
        email: email !== userInfo.email ? email : undefined,
        password: password || undefined,
      };

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(filteredUpdateData).length > 1) {
        const res = await updateProfile(filteredUpdateData).unwrap();
        dispatch(setCredentials(res));
        setIsEditing(false);
        showToast.success('Profile updated successfully');
      } else {
        setIsEditing(false);
      }
      
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast.error(err?.data?.message || 'Update failed');
    }
  };

  const InputField = ({ value, onChange, ...props }) => (
    <input
      className={`glass w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-white/50 transition-colors duration-200 ${
        !isEditing ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      disabled={!isEditing}
      value={value}
      onChange={onChange}
      {...props}
    />
  );

  return (
    <ScreenWrapper>
      <div className="max-w-2xl mx-auto pb-12 px-4 pt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Your Profile
          </h1>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="glass p-2.5 rounded-full text-white hover:text-white/80 transition-colors"
              title="Edit Profile"
            >
              <FaEdit />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setName(userInfo.name || '');
                setEmail(userInfo.email || '');
                setPassword('');
                setConfirmPassword('');
              }}
              className="glass p-2.5 rounded-full text-white hover:text-white/80 transition-colors"
              title="Cancel Editing"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="relative inline-block">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-violet-500 bg-violet-500/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-violet-500 bg-violet-500/10">
                      <FaUserCircle className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white">
                  {userInfo?.name}
                </h2>
                <div className="glass-light px-3 py-1 rounded-full mt-2 inline-block">
                  <p className="text-sm text-white/80">
                    {userInfo?.userType?.charAt(0).toUpperCase() + userInfo?.userType?.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-white/50" />
                  </div>
                  <InputField
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-white/50" />
                  </div>
                  <InputField
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Fields */}
              {isEditing && (
                <>
                  <div className="glass-divider my-4"></div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      New Password
                    </label>
                    <div className="mt-1 space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-white/50" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                          }}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-white/50" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                </>
              )}

              {/* Submit Button */}
              {isEditing && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="glass-button w-full py-3 rounded-lg flex items-center justify-center text-white font-medium"
                  >
                    {isLoading ? (
                      <Loader small />
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default ProfileScreen;
