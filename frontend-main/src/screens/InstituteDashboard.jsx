import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { showToast } from '../utils/toast';
import axiosInstance from '../utils/axiosConfig';
import { FaSync, FaDownload } from 'react-icons/fa';

const InstituteDashboard = () => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [examName, setExamName] = useState('');
  const [description, setDescription] = useState('');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('instituteDashboardTab') || 'upload';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [examDuration, setExamDuration] = useState(60); // Default to 60 minutes

  useEffect(() => {
    fetchUploads();
  }, []);

  const resetForm = () => {
    setFile(null);
    setExamName('');
    setDescription('');
    setError(null);
    setSuccess(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/upload/my-uploads');
      if (response.data) {
        setUploads(response.data);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch uploads');
      setError(error.response?.data?.message || 'Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please select a valid JSON file');
        showToast.error('Please select a valid JSON file');
        e.target.value = ''; // Reset file input
      }
    }
  };

  const validateJsonContent = (content) => {
    if (!content.questions || !Array.isArray(content.questions)) {
      throw new Error('Invalid JSON format: missing questions array');
    }

    content.questions.forEach((q, index) => {
      if (!q.question) {
        throw new Error(`Question ${index + 1} is missing question text`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${index + 1} has invalid correct answer index`);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!file || !examName || !description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Validate JSON format
          const jsonContent = JSON.parse(e.target.result);
          
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('examName', examName);
          formData.append('description', description);
          formData.append('examDuration', examDuration);

          // Upload file
          const response = await axiosInstance.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.status === 201) {
            setSuccess('File uploaded successfully!');
            showToast.success('File uploaded successfully');
            await fetchUploads(); // Refresh the uploads list
            resetForm();
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Invalid JSON format';
          setError(errorMessage);
          showToast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
        setLoading(false);
      };

      reader.readAsText(file);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      setError(errorMessage);
      showToast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleViewResults = async (examId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/exams/results/${examId}`);
      setExamResults(response.data); // Set the fetched results
      setSelectedExam(uploads.find(u => u._id === examId)); // Set the selected exam
      setShowResultsModal(true); // Show the results modal
    } catch (error) {
      console.error('Error fetching results:', error);
      showToast.error('Failed to fetch exam results');
      setError('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseResults = async (examId) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/exams/release/${examId}`);
      setSuccess('Results released successfully');
      showToast.success('Results released successfully');
      await fetchUploads();
      if (selectedExam?._id === examId) {
        const response = await axiosInstance.get(`/api/exams/results/${examId}`);
        setExamResults(response.data);
      }
    } catch (error) {
      console.error('Error releasing results:', error);
      const errorMessage = 'Failed to release results: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadsRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUploads();
      showToast.success('Upload list refreshed successfully');
    } catch (error) {
      showToast.error('Failed to refresh upload list');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResultsRefresh = async () => {
    if (!selectedExam) return;
    
    setIsRefreshing(true);
    try {
      const response = await axiosInstance.get(`/api/exams/results/${selectedExam._id}`);
      setExamResults(response.data);
      showToast.success('Results refreshed successfully');
    } catch (error) {
      showToast.error('Failed to refresh results');
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadResultsAsCSV = () => {
    if (!examResults.length || !selectedExam) return;

    // Create CSV headers
    const headers = ['Student Name', 'Score (%)', 'Correct Answers', 'Total Questions', 'Submission Date'];
    
    // Convert results to CSV format with properly formatted date
    const csvData = examResults.map(result => {
      // Format the date properly
      const submissionDate = result.submittedAt 
        ? new Date(result.submittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : 'N/A';

      return [
        result.student?.name || 'Deleted User',
        result.score?.toFixed(2) || '0.00',
        result.correctAnswers || '0',
        result.totalQuestions || '0',
        submissionDate
      ];
    });

    // Add headers to the beginning
    csvData.unshift(headers);

    // Convert to CSV string with proper escaping for commas and quotes
    const csvString = csvData.map(row => 
      row.map(cell => {
        // If cell contains commas, quotes, or newlines, wrap it in quotes
        if (cell && cell.toString().includes(',') || cell.toString().includes('"') || cell.toString().includes('\n')) {
          return `"${cell.toString().replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Create filename with current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedExam.examName}_results_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('instituteDashboardTab', tab);
  };

  const handleToggleExamMode = async (examId) => {
    const currentExam = uploads.find(upload => upload._id === examId);
    
    // Check if the exam is approved
    if (!currentExam || currentExam.status !== 'approved') {
      showToast.error('Exam mode can only be toggled for approved exams.');
      return;
    }

    try {
      const newExamMode = !currentExam.examMode; // Toggle the current state

      const response = await axiosInstance.put(`/api/exams/${examId}/exam-mode`, {
        examMode: newExamMode // Send the new state to the server
      });

      // Update the uploads state to reflect the new exam mode
      setUploads(prevUploads => 
        prevUploads.map(upload => 
          upload._id === examId ? { ...upload, examMode: newExamMode } : upload
        )
      );

      showToast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling exam mode:', error);
      showToast.error('Failed to toggle exam mode');
    }
  };

  // Add validation for exam duration
  const handleExamDurationChange = (e) => {
    const value = parseInt(e.target.value);
    // Ensure value is not negative and is a valid number
    if (value < 0 || isNaN(value)) {
      setExamDuration(0);
    } else {
      setExamDuration(value);
    }
  };

  return (
    <div className={`min-h-screen pt-20 ${isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['upload', 'exams'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-violet-500 text-violet-500'
                    : isDarkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
            } rounded-lg shadow-md p-6`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Upload Exam Questions
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Exam Name
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Enter exam name"
                  required
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-[#0A0F1C] border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } border focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter exam description"
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-[#0A0F1C] border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } border focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Exam Duration (in minutes)
                </label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={handleExamDurationChange}
                  min="0"
                  placeholder="Enter exam duration"
                  required
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-[#0A0F1C] border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } border focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                />
                <p className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Minimum duration: 0 minutes
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload JSON File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/json"
                  required
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-[#0A0F1C] border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } border focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                />
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Upload a JSON file containing exam questions. Each question must have 4 options 
                  and one correct answer (numbered 1-4).
                </p>
              </div>

              {error && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-red-900/20 border-red-800 text-red-300' 
                    : 'bg-red-50 border-red-200 text-red-700'
                } border`}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className={`p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-green-900/20 border-green-800 text-green-300' 
                    : 'bg-green-50 border-green-200 text-green-700'
                } border`}>
                  {success}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !file || !examName || !description}
                className="w-full px-4 py-3 text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-150"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Uploading...
                  </div>
                ) : (
                  'Upload Questions'
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {activeTab === 'exams' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
            } rounded-lg shadow-md p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                My Uploads
              </h2>
              <button
                onClick={handleUploadsRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-[#2a2f3e] hover:bg-[#3a3f4e] text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh uploads"
              >
                <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg">
              <table className={`min-w-full divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                <thead className={isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}>
                  <tr>
                    {['Exam Name', 'Description', 'Status', 'Uploaded Date', 'Total Questions', 'Results', 'Actions', 'Exam Mode', 'Toggle Exam Mode'].map((header) => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode 
                    ? 'divide-gray-700 bg-[#1a1f2e]' 
                    : 'divide-gray-200 bg-white'
                }`}>
                  {uploads.map((upload) => (
                    <tr key={upload._id}>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {upload.examName}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {upload.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          upload.status === 'approved' 
                            ? isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-800'
                            : upload.status === 'rejected'
                            ? isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-800'
                            : isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {upload.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {upload.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {upload.status === 'approved' && (
                          <button
                            onClick={() => handleViewResults(upload._id)} // Call the function to view results
                            className="px-3 py-1 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                          >
                            View Results
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {upload.status === 'approved' && !upload.resultsReleased && (
                          <button
                            onClick={() => handleReleaseResults(upload._id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Release Results
                          </button>
                        )}
                        {upload.resultsReleased && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isDarkMode 
                              ? 'bg-green-900/20 text-green-300' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Results Released
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap`}>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          upload.examMode
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {upload.examMode ? 'Active' : 'Not Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleExamMode(upload._id)}
                          disabled={upload.status !== 'approved'}
                          className={`px-3 py-1 text-white text-sm rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            upload.examMode ? 'bg-red-600' : 'bg-green-600'
                          } ${upload.status !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {upload.examMode ? 'Disable Exam Mode' : 'Enable Exam Mode'}
                        </button>
                        {/* {upload.status !== 'approved' && (
                          <span className="text-xs text-red-500">Cannot toggle exam mode until approved</span>
                        )} */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Results Modal */}
        {showResultsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${
                isDarkMode ? 'bg-[#1a1f2e]' : 'bg-white'
              } rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col`}
            >
              <div className={`p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } flex justify-between items-center`}>
                <div className={`flex justify-between items-center`}>
                  <h3 className={`text-lg font-semibold mx-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedExam?.examName} - Results
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResultsRefresh}
                      disabled={isRefreshing}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-[#2a2f3e] hover:bg-[#3a3f4e] text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Refresh results"
                    >
                      <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={downloadResultsAsCSV}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-[#2a2f3e] hover:bg-[#3a3f4e] text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Download results as CSV"
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className={`${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {examResults.length === 0 ? (
                  <div className={`p-4 rounded-lg ${
                    isDarkMode 
                      ? 'bg-blue-900/20 text-blue-300' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    No results available yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      <thead className={`${isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'} sticky top-0`}>
                        <tr>
                          {['Student Name', 'Score', 'Correct Answers', 'Submission Date'].map((header) => (
                            <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isDarkMode 
                          ? 'divide-gray-700 bg-[#1a1f2e]' 
                          : 'divide-gray-200 bg-white'
                      }`}>
                        {examResults.map((result) => (
                          <tr key={result._id}>
                            <td className={`px-6 py-4 whitespace-nowrap ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {result.student?.name || 'Deleted User'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {result.score?.toFixed(2) || '0.00'}%
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {result.correctAnswers} / {result.totalQuestions}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {new Date(result.submittedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteDashboard;