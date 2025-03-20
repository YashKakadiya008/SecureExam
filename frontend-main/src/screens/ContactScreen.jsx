import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import ScreenWrapper from '../components/ScreenWrapper';

const ContactScreen = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'Address',
      details: [
        'SecureExam Headquarters',
        '123 Innovation Street',
        'Tech Park, Digital City 12345'
      ]
    },
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: [
        '+1 (555) 123-4567',
        '+1 (555) 765-4321'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: [
        'support@secureexam.com',
        'info@secureexam.com'
      ]
    }
  ];

  return (
    <ScreenWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Get in Touch
          </h1>
          <div className="glass-divider w-32 mx-auto mb-8"></div>
          <p className="text-lg max-w-3xl mx-auto text-white/70">
            Have questions about our platform? Need assistance? We're here to help.
            Reach out to our team and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-8 text-white">
                Contact Information
              </h2>
              
              <div className="space-y-8">
                {contactInfo.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex"
                  >
                    <div className="glass w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.details.map((detail, idx) => (
                          <p key={idx} className="text-white/70">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Connect With Us
                </h3>
                <div className="glass-divider w-24 mb-6"></div>
                <p className="text-white/70 mb-6">
                  Follow our social channels to stay updated with the latest features and announcements.
                </p>
                <div className="flex space-x-4">
                  {['twitter', 'facebook', 'linkedin', 'instagram'].map((social, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="glass w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5 rounded-full bg-white/10"></div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl"
            >
              <h2 className="text-2xl font-bold mb-8 text-white">
                Send Us a Message
              </h2>
              
              {submitSuccess && (
                <div className="glass-light rounded-lg p-4 mb-6 text-white">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              {submitError && (
                <div className="glass-dark rounded-lg p-4 mb-6 text-white">
                  There was an error sending your message. Please try again.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="glass w-full px-4 py-3 rounded-lg border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="glass w-full px-4 py-3 rounded-lg border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="glass w-full px-4 py-3 rounded-lg border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="glass w-full px-4 py-3 rounded-lg border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="glass-button flex items-center justify-center w-full px-6 py-3 rounded-lg text-white transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Frequently Asked Questions
          </h2>
          <div className="glass-divider w-32 mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'How can I get started with SecureExam?',
                answer: 'You can get started by registering on our platform. Once you create an account, you\'ll be guided through the setup process depending on your role - student, instructor, or institution.'
              },
              {
                question: 'Is SecureExam suitable for all types of exams?',
                answer: 'Yes, our platform is designed to accommodate various exam formats including multiple choice, essay-based, coding tests, and more. You can configure the settings based on your specific requirements.'
              },
              {
                question: 'How secure is the platform?',
                answer: 'We implement industry-standard security measures including end-to-end encryption, secure authentication, browser lockdown, and AI-powered proctoring to ensure exam integrity.'
              },
              {
                question: 'Do you offer customer support?',
                answer: 'Yes, we provide 24/7 customer support through multiple channels including email, phone, and live chat. Our dedicated support team is always ready to assist you.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="glass-card p-6 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {faq.question}
                </h3>
                <p className="text-white/70">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </ScreenWrapper>
  );
};

export default ContactScreen; 