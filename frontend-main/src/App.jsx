import HomeScreen from './screens/HomeScreen';
import { useTheme } from './context/ThemeContext';
import Header from './components/Header';

const App = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Header/>
      <HomeScreen />
    </div>
  );
};


export default App;
