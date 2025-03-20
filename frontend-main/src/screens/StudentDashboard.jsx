import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import config from '../config/config.js';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { FaExpand, FaCompress, FaSync } from 'react-icons/fa';
import ScreenWrapper from '../components/ScreenWrapper';

const StudentDashboard = () => {
  const { isDarkMode } = useTheme();
  const [isExamMode, setIsExamMode] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialize activeTab after isExamMode is declared
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('studentDashboardTab');
    return isExamMode ? 'exam' : (savedTab || 'start');
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    let timer;
    if (currentExam && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmitExam('time_expired');
            localStorage.removeItem('examState');
            return 0;
          }
          // Save state every 30 seconds
          if (prevTime % 30 === 0) {
            saveExamState();
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentExam, timeLeft]);

  useEffect(() => {
    if (currentExam) {
      setIsExamMode(true);
    } else {
      setIsExamMode(false);
    }
  }, [currentExam]);

  useEffect(() => {
    if (isExamMode && currentExam) {
      let isSubmitting = false;

      const handleVisibilityChange = () => {
        if (document.hidden && !isSubmitting && !examSubmitting) {
          isSubmitting = true;
          handleSubmitExam('tab_switch');
        }
      };

      const handleWindowBlur = () => {
        if (!isSubmitting && !examSubmitting) {
          isSubmitting = true;
          handleSubmitExam('window_switch');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        isSubmitting = false;
      };
    }
  }, [isExamMode, currentExam, answers, examSubmitting]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/api/exams/my-results`,
        { withCredentials: true }
      );
      
      console.log('Fetched exam results:', response.data);
      setExamResults(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching results:', error);
      setExamResults([]);
      setError('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab) => {
    if (isExamMode) {
      return; // Don't allow tab switching during exam
    }
    setActiveTab(tab);
    localStorage.setItem('studentDashboardTab', tab);
  };

  useEffect(() => {
    if (isExamMode) {
      setActiveTab('exam');
      localStorage.removeItem('studentDashboardTab');
    }
  }, [isExamMode]);

  const renderStartExam = () => {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Start Exam
        </h2>
        
        <div className="max-w-md mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-lg glass-card border border-red-400 text-white">
              <p>{error}</p>
            </div>
          )}

          <div>
            <p className="text-lg mb-4 text-white/70">
              Enter the exam code provided by your institute to begin
            </p>

            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="examCode" 
                  className="block text-sm font-medium mb-2 text-white/80"
                >
                  Exam Code
                </label>
                <input
                  type="text"
                  id="examCode"
                  value={ipfsHash}
                  onChange={(e) => {
                    setIpfsHash(e.target.value);
                    setError(null); // Clear error when input changes
                  }}
                  placeholder="Enter your exam code"
                  className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-violet-500 transition-colors"
                />
              </div>

              <button
                onClick={handleStartExam}
                disabled={!ipfsHash.trim() || loading}
                className={`glass-button w-full py-3 px-4 rounded-lg text-white font-medium ${
                  !ipfsHash.trim() || loading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : (
                  'Start Exam'
                )}
              </button>
            </div>
          </div>

          {/* Important Instructions */}
          <div className="glass-card mt-8 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-white">
              Important Instructions
            </h3>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Make sure you have a stable internet connection
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Do not leave or refresh the page during the exam
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Switching tabs or windows will auto-submit your exam
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Keep track of the time limit once you start
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      showToast.error('Failed to enter fullscreen mode');
      console.error('Fullscreen error:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Exit fullscreen error:', error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Only force fullscreen and auto-submit if it's not a manual submission
      if (!document.fullscreenElement && isExamMode && !examSubmitting) {
        showToast.error('Fullscreen mode is required during the exam');
        enterFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isExamMode, enterFullscreen, examSubmitting]);

  const notifyExamStateChange = (isExamActive) => {
    // Create a custom event with detail
    const event = new CustomEvent('customExamState', {
      detail: {
        type: 'examState',
        isActive: isExamActive
      }
    });
    window.dispatchEvent(event);
  };

  const handleStartExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!ipfsHash) {
        setError('Please enter the IPFS hash provided by your institute');
        return;
      }

      // Check if exam was already attempted using examResults
      const hasAttempted = examResults.some(result => {
        console.log('Comparing:', {
          resultHash: result.exam?.ipfsHash,
          currentHash: ipfsHash.trim(),
          match: result.exam?.ipfsHash === ipfsHash.trim()
        });
        return result.exam?.ipfsHash === ipfsHash.trim();
      });

      if (hasAttempted) {
        setError('You have already attempted this exam. You cannot retake it.');
        showToast.error('You have already attempted this exam. You cannot retake it.');
        setIpfsHash('');
        setLoading(false);
        return;
      }

      // First, check if exam mode is enabled
      const examModeResponse = await axios.get(
        `${config.API_BASE_URL}/api/exams/check-mode/${ipfsHash.trim()}`,
        { withCredentials: true }
      );

      if (!examModeResponse.data.examMode) {
        setError('This exam has not been started by the institute yet. Please wait for the institute to enable exam mode.');
        showToast.error('Exam has not been started yet');
        setLoading(false);
        return;
      }

      await enterFullscreen();

      const response = await axios.post(
        `${config.API_BASE_URL}/api/exams/start`,
        { ipfsHash: ipfsHash.trim() },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Check if the response is valid
      if (response.status === 200) {
        const examData = response.data;
        setCurrentExam(examData);
        setTimeLeft(examData.timeLimit * 60);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setActiveTab('exam');
        setIsExamMode(true);
        
        // Save exam state
        const examState = {
          examData: examData,
          timeRemaining: examData.timeLimit * 60,
          currentAnswers: {},
          questionIndex: 0
        };
        localStorage.setItem('examState', JSON.stringify(examState));
        notifyExamStateChange(true);
      }
    } catch (error) {
      await exitFullscreen();
      console.error('Start exam error:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setError('Exam not found. Please check the IPFS hash.');
          showToast.error('Exam not found. Please check the IPFS hash.');
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
          showToast.error(error.response.data.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
          showToast.error('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('Invalid Exam Code');
        showToast.error('Invalid Exam Code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExamCompletion = async () => {
    await exitFullscreen();
    setCurrentExam(null);
    setIsExamMode(false);
    setAnswers({});
    setTimeLeft(null);
    setActiveTab('results');
    localStorage.removeItem('examState');
    localStorage.removeItem('pendingSubmission');
    fetchResults();
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    try {
      const updatedAnswers = {
        ...answers,
        [questionIndex]: answerIndex
      };
      setAnswers(updatedAnswers);
      saveExamState(updatedAnswers);
    } catch (error) {
      console.error('Error saving answer:', error);
      showToast.error('Failed to save answer');
    }
  };

  const handleSubmitExam = async (submitType = 'manual') => {
    setExamSubmitting(true);
    try {
      // Exit fullscreen mode before submitting
      await exitFullscreen(); // Ensure to exit fullscreen

      // Capture attempted answers
      const attemptedAnswers = Object.keys(answers).reduce((acc, key) => {
        if (answers[key] !== null && answers[key] !== undefined) {
          acc[key] = Number(answers[key]);
        }
        return acc;    
      }, {});


      const submissionData = {
        examId: currentExam._id,
        answers: attemptedAnswers,
        isAutoSubmit: submitType === 'time_expired', // Set to true if auto-submit
        totalQuestions: currentExam.questions.length,
        attemptedCount: Object.keys(attemptedAnswers).length,
        timeRemaining: timeLeft 
      };

      // Show a different toast message for auto submission
      if (submitType === 'time_expired') {
        showToast.warning(`Time's up! Your exam is being submitted automatically.`);
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/api/exams/submit`,
        submissionData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data) {
        // Handle successful submission
        localStorage.removeItem('examState');
        const event = new CustomEvent('customExamState', {
          detail: {
            type: 'examState',
            isActive: false
          }
        });
        window.dispatchEvent(event);
        showToast.success('Exam submitted successfully!');
        notifyExamSubmission();

        // Clear all local storage data related to the exam
        localStorage.removeItem('studentDashboardTab');
        localStorage.removeItem('pendingSubmission'); // If you have this key

        // Switch to results tab after submission
        setIsExamMode(false);
        setCurrentExam(null);
        setAnswers({});
        setTimeLeft(null);
        setActiveTab('results'); // Switch to results tab
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      // Log the error response for debugging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        showToast.error(`Failed to submit exam: ${error.response.data.message || 'Please try again or contact support.'}`);
      } else {
        showToast.error('Failed to submit exam. Please check your network connection.');
      }
    } finally {
      setExamSubmitting(false);
    }
  };

  // Add online/offline status handling
  useEffect(() => {
    const handleOnline = async () => {
      const pendingSubmission = localStorage.getItem('pendingSubmission');
      if (pendingSubmission) {
        try {
          const { submissionData } = JSON.parse(pendingSubmission);
          
          const response = await axios.post(
            `${config.API_BASE_URL}/api/exams/submit`,
            submissionData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data) {
            localStorage.removeItem('examState');
            localStorage.removeItem('pendingSubmission');
            showToast.success('Pending exam submitted successfully!');
            await handleExamCompletion();
          }
        } catch (error) {
          console.error('Error submitting pending exam:', error);
          showToast.error('Failed to submit pending exam. Please try again or contact support.');
        }
      }
    };

    const handleOffline = () => {
      showToast.warning('You are offline. Don\'t worry, your exam progress is saved.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending submission on component mount
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add this function to check if all questions are answered
  const areAllQuestionsAnswered = () => {
    if (!currentExam) return false;
    
    const totalQuestions = currentExam.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    return answeredQuestions === totalQuestions;
  };

  // Add this function to get the number of remaining questions
  const getRemainingQuestions = () => {
    if (!currentExam) return 0;
    
    const totalQuestions = currentExam.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    return totalQuestions - answeredQuestions;
  };

  // Update the exam rendering with submit button validation
  const renderExam = () => {
    if (!currentExam) {
      return (
        <div className="text-center p-4">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            No active exam. Please start an exam first.
          </p>
        </div>
      );
    }

    const remainingQuestions = getRemainingQuestions();
    const allAnswered = areAllQuestionsAnswered();

    return (
      <div className="relative">
        {/* Exam Content */}
        <div className="space-y-4 md:space-y-6 pb-16">
          {/* Timer and Progress */}
          <div className="sticky top-0 z-10 bg-inherit py-2 space-y-2">
            <div className={`text-lg font-semibold ${
              timeLeft <= 300 ? 'text-red-500' : isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {remainingQuestions > 0 
                ? `${remainingQuestions} question${remainingQuestions > 1 ? 's' : ''} remaining`
                : 'All questions answered!'
              }
            </div>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Question {currentQuestionIndex + 1} of {currentExam.questions.length}
            </h3>
            <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentExam.questions[currentQuestionIndex].text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentExam.questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  answers[currentQuestionIndex] === index
                    ? isDarkMode
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-100 text-violet-900'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation and Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`w-full sm:w-auto px-4 py-2 rounded ${
                currentQuestionIndex === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              Previous
            </button>

            {currentQuestionIndex === currentExam.questions.length - 1 ? (
              <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
                <button
                  onClick={handleSubmitExam}
                  disabled={examSubmitting || !allAnswered}
                  className={`w-full sm:w-auto px-6 py-2 rounded transition-all ${
                    examSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : allAnswered
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {examSubmitting 
                    ? 'Submitting...' 
                    : allAnswered
                      ? 'Submit Exam'
                      : `Answer All Questions (${remainingQuestions} left)`
                  }
                </button>
                {!allAnswered && (
                  <span className="text-xs text-red-500 mt-1">
                    Please answer all questions before submitting
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => 
                  Math.min(currentExam.questions.length - 1, prev + 1)
                )}
                className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded"
              >
                Next
              </button>
            )}
          </div>

          {/* Question Navigation Grid */}
          <div className="mt-8">
            <h4 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Question Navigation
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {currentExam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-2 text-sm rounded relative ${
                    currentQuestionIndex === index
                      ? 'bg-violet-600 text-white'
                      : answers[index] !== undefined
                        ? isDarkMode
                          ? 'bg-violet-900/50 text-violet-100'
                          : 'bg-violet-100 text-violet-900'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {index + 1}
                  {answers[index] !== undefined && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Summary */}
          <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Answered: {Object.keys(answers).length} / {currentExam.questions.length}
          </div>
        </div>

        {/* Warning Banner */}
        {isExamMode && (
          <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 md:py-3 px-4 text-center z-50">
            <p className="text-xs md:text-sm font-medium">
              Warning: Leaving this page will automatically submit your exam
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderResultsTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Results
          </h2>
          <button
            onClick={fetchResults} // Call fetchResults to refresh
            disabled={loading} // Disable button while loading
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'bg-[#2a2f3e] hover:bg-[#3a3f4e] text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh results"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'} rounded-lg shadow-lg`}>
          {examResults && examResults.length > 0 ? (
            <div className="space-y-4">
              {examResults.map((result) => (
                <div
                  key={result._id}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
                >
                  <h3 className={`font-semibold text-base md:text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {result.exam.examName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {result.score !== null && result.score !== undefined
                          ? `${Number(result.score).toFixed(2)}%`
                          : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct Answers</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {result.correctAnswers !== null && result.correctAnswers !== undefined
                          ? `${result.correctAnswers}/${result.totalQuestions}`
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    Submitted: {new Date(result.submittedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
                </div>
              ) : (
                'No exam results found'
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add a cleanup function for exam mode
  useEffect(() => {
    if (!isExamMode) {
      // Cleanup when exam mode is disabled
      setCurrentExam(null);
      setAnswers({});
      setTimeLeft(null);
      setCurrentQuestionIndex(0);
    }
  }, [isExamMode]);

  // Add effect to restore exam state on mount/navigation
  useEffect(() => {
    const restoreExamState = () => {
      const savedExamState = localStorage.getItem('examState');
      if (savedExamState) {
        try {
          const { examData, timeRemaining, currentAnswers, questionIndex } = JSON.parse(savedExamState);
          setCurrentExam(examData);
          setTimeLeft(timeRemaining);
          setAnswers(currentAnswers || {});
          setCurrentQuestionIndex(questionIndex || 0);
          setIsExamMode(true);
          setActiveTab('exam');
        } catch (error) {
          console.error('Error restoring exam state:', error);
          localStorage.removeItem('examState');
        }
      }
    };

    restoreExamState();
  }, []);

  // Update saveExamState function
  const saveExamState = useCallback(() => {
    if (currentExam && isExamMode) {
      const examState = {
        examData: currentExam,
        timeRemaining: timeLeft,
        currentAnswers: answers,
        questionIndex: currentQuestionIndex
      };
      localStorage.setItem('examState', JSON.stringify(examState));
      window.dispatchEvent(new Event('storage'));
    }
  }, [currentExam, timeLeft, answers, currentQuestionIndex, isExamMode]);

  // Update beforeunload handler to not auto-submit on refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExamMode && currentExam) {
        // Save current state before refresh
        saveExamState();
        
        // Show warning message
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be saved.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isExamMode, currentExam, answers, timeLeft, currentQuestionIndex]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (!isExamMode) {
        localStorage.removeItem('examState');
        window.dispatchEvent(new Event('storage'));
      }
    };
  }, [isExamMode]);

  useEffect(() => {
    // Fetch results when the component mounts
    fetchResults();

    // Event listener for exam submission
    const handleExamSubmitted = () => {
      fetchResults(); // Refresh results when an exam is submitted
    };

    // Add event listener
    window.addEventListener('examSubmitted', handleExamSubmitted);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('examSubmitted', handleExamSubmitted);
    };
  }, []); // Empty dependency array to run only on mount

  return (
    <ScreenWrapper>
      <div className="max-w-6xl mx-auto pb-12 px-4 pt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Student Dashboard
          </h1>
          {!isExamMode && (
            <div className="flex space-x-2">
              <button
                onClick={() => fetchResults()}
                className="glass p-2.5 rounded-full text-white hover:text-white/80 transition-colors"
                title="Refresh"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          )}
        </div>

        {!isExamMode && (
          <div className="glass-card rounded-xl overflow-hidden mb-8">
            <div className="border-b border-white/10">
              <nav className="flex">
                <button
                  onClick={() => handleTabSwitch('start')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'start'
                      ? 'text-white border-b-2 border-violet-500'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Start Exam
                </button>
                <button
                  onClick={() => handleTabSwitch('results')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'results'
                      ? 'text-white border-b-2 border-violet-500'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  My Results
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'start' && renderStartExam()}
              {activeTab === 'results' && renderResultsTab()}
            </div>
          </div>
        )}

        {/* Exam Mode Content (will be implemented later) */}
      </div>
    </ScreenWrapper>
  );
};

// Function to dispatch the event when an exam is submitted
const notifyExamSubmission = () => {
  const event = new CustomEvent('examSubmitted');
  window.dispatchEvent(event);
};

export default StudentDashboard;