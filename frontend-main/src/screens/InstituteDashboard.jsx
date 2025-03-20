import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { showToast } from '../utils/toast';
import axiosInstance from '../utils/axiosConfig';
import { FaSync, FaDownload, FaUpload, FaEye, FaChartBar } from 'react-icons/fa';
import ScreenWrapper from '../components/ScreenWrapper';
import Loader from '../components/Loader';

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

  // Render upload form
  const renderUploadForm = () => {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-6">Upload New Exam</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="examName" className="block text-sm font-medium text-white/80 mb-1">
                Exam Name
              </label>
              <input
                type="text"
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Enter exam name"
                required
                className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter exam description"
                required
                rows="3"
                className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              />
            </div>
            
            <div>
              <label htmlFor="examDuration" className="block text-sm font-medium text-white/80 mb-1">
                Exam Duration (minutes)
              </label>
              <input
                type="number"
                id="examDuration"
                min="5"
                max="180"
                value={examDuration}
                onChange={handleExamDurationChange}
                placeholder="Enter duration in minutes"
                required
                className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              />
            </div>
            
            <div>
              <label htmlFor="fileUpload" className="block text-sm font-medium text-white/80 mb-1">
                Upload JSON File
              </label>
              <div className="glass w-full rounded-lg">
                <label className="flex flex-col items-center justify-center px-4 py-6 cursor-pointer">
                  <FaUpload className="text-white/60 w-8 h-8 mb-2" />
                  <span className="text-sm text-white/70">
                    {file ? file.name : 'Click to select a file'}
                  </span>
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  {file && (
                    <span className="mt-2 text-xs text-white/60">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  )}
                </label>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Only JSON files with the correct format are accepted
              </p>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !file || !examName || !description}
                className={`glass-button w-full py-3 px-4 rounded-lg text-white font-medium ${
                  loading || !file || !examName || !description ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? <Loader small /> : 'Upload Exam'}
              </button>
            </div>
            
            {error && (
              <div className="p-4 rounded-lg glass-card border border-red-400 text-white">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-lg glass-card border border-green-400 text-white">
                <p>{success}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

  // Render uploads list
  const renderUploadsList = () => {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Your Exams</h3>
          <button 
            onClick={handleUploadsRefresh}
            className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
            disabled={isRefreshing}
          >
            <FaSync className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : (
            <>
              {uploads && uploads.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Exam Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Exam Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {uploads.map((upload) => (
                      <tr key={upload._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                          {upload.examName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`glass-light px-2.5 py-1 rounded-full text-xs font-medium ${
                            upload.status === 'approved' ? 'text-green-400' :
                            upload.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                          {upload.ipfsHash ? (
                            <span className="font-mono">{upload.ipfsHash.substring(0, 8)}...</span>
                          ) : (
                            <span className="text-white/50">Not available</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewResults(upload._id)}
                              className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
                              title="View Results"
                            >
                              <FaEye size={14} />
                            </button>
                            {upload.results && upload.results.length > 0 && (
                              <button
                                onClick={() => handleToggleExamMode(upload._id)}
                                className={`glass p-2 rounded-full ${upload.resultsReleased ? 'text-green-400' : 'text-yellow-400'} hover:text-white transition-colors`}
                                title={upload.resultsReleased ? "Results Released" : "Release Results"}
                              >
                                <FaChartBar size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-white/70">No exams uploaded yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Results Modal
  const renderResultsModal = () => {
    if (!showResultsModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div onClick={(e) => e.stopPropagation()} className="glass-card max-w-4xl w-full mx-4 p-6 rounded-xl relative max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">
              Results: {selectedExam?.examName}
            </h3>
            
            <div className="flex space-x-2">
              <button
                onClick={handleResultsRefresh}
                className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
                disabled={isRefreshing}
              >
                <FaSync className={isRefreshing ? "animate-spin" : ""} />
              </button>
              
              <button
                onClick={() => downloadResultsAsCSV()}
                className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
                disabled={!examResults.length}
                title="Download as CSV"
              >
                <FaDownload />
              </button>
              
              <button
                onClick={() => setShowResultsModal(false)}
                className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
              >
                <span>×</span>
              </button>
            </div>
          </div>
          
          {selectedExam && (
            <div className="mb-4 flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm">
                  Status: <span className="text-white">{selectedExam.status}</span>
                </p>
                <p className="text-white/70 text-sm">
                  Total Submissions: <span className="text-white">{examResults.length}</span>
                </p>
              </div>
              
              <div>
                {examResults.length > 0 && !selectedExam.resultsReleased && (
                  <button
                    onClick={() => handleReleaseResults(selectedExam._id)}
                    className="glass-button px-4 py-2 rounded-lg text-white text-sm"
                    disabled={loading}
                  >
                    {loading ? <Loader small /> : 'Release Results to Students'}
                  </button>
                )}
                {selectedExam.resultsReleased && (
                  <span className="glass-light px-3 py-1.5 rounded-lg text-green-400 text-xs font-medium">
                    Results Released
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="overflow-auto flex-grow">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : (
              <>
                {examResults && examResults.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-black/30">
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Score (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Correct</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {examResults.map((result) => (
                        <tr key={result._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            {result.student?.name || 'Deleted User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              result.score >= 70 ? 'text-green-400' :
                              result.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {result.score?.toFixed(2) || '0.00'}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            {result.correctAnswers || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            {result.totalQuestions || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {result.submittedAt 
                              ? new Date(result.submittedAt).toLocaleString()
                              : 'N/A'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-white/70">No results found for this exam.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScreenWrapper>
      <div className="max-w-7xl mx-auto pb-12 px-4 pt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Institute Dashboard
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={fetchUploads}
              className="glass p-2.5 rounded-full text-white hover:text-white/80 transition-colors"
              title="Refresh"
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="glass-card rounded-xl overflow-hidden mb-8">
          <div className="border-b border-white/10">
            <nav className="flex">
              <button
                onClick={() => handleTabSwitch('upload')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'upload'
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Upload Exam
              </button>
              <button
                onClick={() => handleTabSwitch('exams')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'exams'
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                My Exams
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && renderUploadForm()}
            {activeTab === 'exams' && renderUploadsList()}
          </div>
        </div>
      </div>
      
      {/* Results Modal */}
      {renderResultsModal()}
    </ScreenWrapper>
  );
};

export default InstituteDashboard;