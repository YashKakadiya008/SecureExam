import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaShieldAlt, FaLock, FaChartLine, FaRobot, FaCode, FaUserShield, FaCloudUploadAlt, FaMobileAlt, FaGithub, FaLinkedin } from 'react-icons/fa';
import Footer from '../components/Footer';

const AboutScreen = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Secure Examination',
      description: 'Our platform ensures secure exam delivery with encrypted question papers and submissions.'
    },
    {
      icon: <FaLock />,
      title: 'Anti-Cheating System',
      description: 'Basic proctoring measures to maintain exam integrity.'
    },
    {
      icon: <FaChartLine />,
      title: 'Result Analytics',
      description: 'Instant results and basic performance tracking capabilities.'
    },
    {
      icon: <FaRobot />,
      title: 'Automated Assessment',
      description: 'Automated evaluation for objective type questions.'
    }
  ];

  const technologies = [
    {
      icon: <FaCode />,
      title: 'Modern Tech Stack',
      description: 'Built with React, Node.js, and MongoDB for reliable performance.'
    },
    {
      icon: <FaUserShield />,
      title: 'Data Security',
      description: 'Basic security measures to protect user data and exam content.'
    },
    {
      icon: <FaCloudUploadAlt />,
      title: 'Cloud Based',
      description: 'Hosted on cloud for consistent availability.'
    },
    {
      icon: <FaMobileAlt />,
      title: 'Responsive Design',
      description: 'Works smoothly on both desktop and mobile devices.'
    }
  ];

  const developers = [
    {
      name: 'Yash Kakadiya',
      role: 'Full Stack Developer & Deployment Specialist',
      github: 'https://github.com/YashKakadiya008',
      linkedin: 'https://www.linkedin.com/in/yash-kakadiya-028599259/'
    },
    {
      name: 'Jaimin Khunt',
      role: 'Full Stack Developer & Deployment Specialist',
      github: 'https://github.com/notHuman9504/',
      linkedin: 'https://www.linkedin.com/in/jaimin-khunt/'
    },


    {
      name: 'Soham Kansara',
      role: 'Frontend Developer',
      github: 'https://github.com/soham-123456',
      linkedin: 'https://www.linkedin.com/in/soham-kansara-129839269/'
    }

  ];

  return (
    <>
      <div className={`${isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'} pt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              About <span className="text-violet-600">NexusEdu</span>
            </h1>
            <p className={`text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              A platform designed to simplify online examinations with focus on security
              and ease of use for both institutions and students.
            </p>
          </motion.div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
                  } shadow-lg`}
              >
                <div className={`flex items-center mb-4`}>
                  <div className={`flex justify-center items-center w-12 h-12 rounded-xl ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'
                    } ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} text-2xl`}>
                    {feature.icon}
                  </div>
                  <h3 className={`ml-4 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`ml-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Technology Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <h2 className={`text-3xl font-bold mb-12 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Our Technology
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
                    } shadow-lg`}
                >
                  <div className={`flex items-center mb-4`}>
                    <div className={`flex justify-center items-center w-12 h-12 rounded-xl ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'
                      } ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} text-2xl`}>
                      {tech.icon}
                    </div>
                    <h3 className={`ml-4 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {tech.title}
                    </h3>
                  </div>
                  <p className={`ml-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tech.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-4xl mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
              } shadow-lg mb-20`}
          >
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Our Mission
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              We aim to provide a reliable platform for conducting online examinations,
              making it easier for institutions to manage assessments and for students
              to take tests from anywhere. Our focus is on creating a simple yet
              effective solution for online education needs.
            </p>
          </motion.div>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
          >
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Meet Our Developers
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                The talented team behind NexusEdu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {developers.map((dev, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative group overflow-hidden rounded-2xl ${isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
                    } shadow-lg p-6`}
                >
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center text-3xl ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'
                      } ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                      {dev.name.charAt(0)}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {dev.name}
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {dev.role}
                    </p>
                    <div className="flex justify-center space-x-4">
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full ${isDarkMode
                            ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                            : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                          } transition-colors duration-200`}
                      >
                        <FaGithub className="w-5 h-5" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full ${isDarkMode
                            ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                            : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                          } transition-colors duration-200`}
                      >
                        <FaLinkedin className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutScreen; 
