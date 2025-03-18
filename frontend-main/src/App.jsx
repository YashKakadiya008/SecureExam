import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCheckAuthQuery } from './slices/usersApiSlice';
import { setCredentials, setLoading, logout } from './slices/authSlice';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { useTheme } from './context/ThemeContext';


const App = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: authData, isLoading, isError } = useCheckAuthQuery();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authData) {
      dispatch(setCredentials(authData));
    } else if (isError) {
      dispatch(logout());
    }
  }, [authData, isError, dispatch]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
    </div>;
  }

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

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Header />
       <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          
          {/* Public routes */}
          <Route
            path="/login"
            element={
              userInfo ? (
                <Navigate to={getRedirectPath(userInfo.userType)} replace />
              ) : (
                <LoginScreen />
              )
            }
          />
          <Route
            path="/register"
            element={
              userInfo ? (
                <Navigate to={getRedirectPath(userInfo.userType)} replace />
              ) : (
                <RegisterScreen />
              )
            }
          />
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};


export default App;
