import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaArrowUp, FaBook, FaLock, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import Logo from './Logo';

const Footer = () => {
  const { isDarkMode } = useTheme();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = {
    platform: [
      { name: 'Features', path: '/features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Security', path: '/security' },
      { name: 'Roadmap', path: '/roadmap' },
    ],
    resources: [
      { name: 'Documentation', path: '/docs' },
      { name: 'API', path: '/api' },
      { name: 'Tutorials', path: '/tutorials' },
      { name: 'Blog', path: '/blog' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
      { name: 'Partners', path: '/partners' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Data Protection', path: '/data-protection' },
      { name: 'Cookie Policy', path: '/cookies' },
    ]
  };

  const socialIcons = [
    { icon: <FaTwitter />, link: 'https://twitter.com' },
    { icon: <FaLinkedin />, link: 'https://linkedin.com' },
    { icon: <FaGithub />, link: 'https://github.com' },
    { icon: <FaInstagram />, link: 'https://instagram.com' },
  ];

  const features = [
    { icon: <FaLock />, title: 'Secure' },
    { icon: <FaBook />, title: 'Simple' },
    { icon: <FaGraduationCap />, title: 'Smart' },
    { icon: <FaChartLine />, title: 'Scalable' },
  ];

  return (
    <footer className="relative z-10">
      {/* Top curved divider */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
        <svg className="absolute -top-12 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="fill-black"></path>
        </svg>
      </div>

      {/* Newsletter Section */}
      <div className="relative pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-dark rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay Updated with SecureExam</h3>
                <p className="text-white/70 mb-6 max-w-lg">
                  Subscribe to our newsletter for the latest features, updates, and educational insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="glass px-5 py-3 rounded-xl text-white outline-none flex-grow"
                  />
                  <button className="glass-button px-6 py-3 rounded-xl text-white font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="glass-highlight p-4 rounded-xl text-center"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 glass rounded-full flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <div className="text-white">{feature.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-black pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Logo and description */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center mb-6">
                <Logo width="50" height="50" showText={true} />
              </Link>
              <p className="text-white/70 mb-8 max-w-md">
                Revolutionizing the examination process with state-of-the-art security, AI-powered monitoring, and a seamless interface for both students and administrators.
              </p>
              <div className="flex space-x-4">
                {socialIcons.map((social, index) => (
                  <a 
                    key={index} 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links], index) => (
              <div key={category} className="flex flex-col">
                <h4 className="text-white text-lg font-medium mb-4 capitalize">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-white/60 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Divider */}
          <div className="glass-divider mb-8"></div>

          {/* Copyright and Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SecureExam. All rights reserved.
            </div>
            <button 
              onClick={scrollToTop}
              className="glass p-3 rounded-full text-white hover:text-white/80 transition-colors"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 