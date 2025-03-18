import HomeScreen from './screens/HomeScreen';
import { useTheme } from './context/ThemeContext';

const App = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <HomeScreen />
    </div>
  );
};


export default App;
