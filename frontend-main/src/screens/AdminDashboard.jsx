import { useState, useEffect } from 'react';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { showToast } from '../utils/toast';
import Loader from '../components/Loader';
import AdminUserCreate from './AdminUserCreate';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FaTrash, FaSearch, FaSync } from 'react-icons/fa';
import ScreenWrapper from '../components/ScreenWrapper';

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('student');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminDashboardTab') || 'dashboard';
  });
  const [processingType, setProcessingType] = useState(null);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  // Add backend URL
  const BACKEND_URL = 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/requests`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/dashboard`, { withCredentials: true })
      ]);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/users/create`,
        {
          name,
          email,
          userType
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        showToast.success(`Successfully created ${userType} account. Credentials sent to user's email.`);
        
        // Reset form
        setName('');
        setEmail('');
        setUserType('student');
        
        // Fetch updated user list
        await fetchUsers();

        // Switch to users tab
        setActiveTab('users');
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAdminComment('Approved by admin');
    setShowModal(true);
    setProcessingType('approve');
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowModal(true);
    setProcessingType('reject');
  };

  // Handle request status update (for exam requests)
  const handleRequestStatusUpdate = async () => {  
    if (!selectedRequest) return;

    setActionLoading(true);
    const status = processingType === 'approve' ? 'approved' : 'rejected';
    setProcessingStatus(status === 'approved' ? 'Encrypting and uploading to IPFS...' : 'Processing request...');

    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/requests/${selectedRequest._id}`,
        {
          status,
          adminComment
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data) {
        setRequests(requests.map(req =>
          req._id === selectedRequest._id
            ? {
                ...req,
                status: response.data.status,
                ipfsHash: response.data.ipfsHash,
                ipfsEncryptionKey: response.data.ipfsEncryptionKey
              }
            : req
        ));

        if (status === 'approved' && response.data.ipfsHash) {
          showToast.success(`Request approved and uploaded to IPFS\nHash: ${response.data.ipfsHash.slice(0, 10)}...`);
        } else {
          showToast.success(`Request ${status} successfully`);
        }

        await fetchData();
        setShowModal(false);
        setSelectedRequest(null);
        setAdminComment('');
        setProcessingType(null);
      }
    } catch (error) {
      console.error('Status update error:', error);
      showToast.error(error.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setActionLoading(false);
      setProcessingStatus('');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        withCredentials: true
      });
      
      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Failed to fetch users');
      setUserError('Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (users) {
      setFilteredUsers(
        users.filter(user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [users, searchTerm]);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(
          `${BACKEND_URL}/api/admin/users/${userId}`,
          { withCredentials: true }
        );
        fetchUsers(); // Refresh user list
        showToast.success('User deleted successfully');
      } catch (error) {
        showToast.error('Failed to delete user');
      }
    }
  };

  // Add refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      showToast.success('Data refreshed successfully');
    } catch (error) {
      showToast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add this function near your other handlers
  const handleUserListRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
      showToast.success('User list refreshed successfully');
    } catch (error) {
      showToast.error('Failed to refresh user list');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update tab handler to save to localStorage
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('adminDashboardTab', tab);
  };

  const refreshRequests = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/requests`, { withCredentials: true });
      setRequests(response.data);
      showToast.success('Requests refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing requests:', error);
      showToast.error('Failed to refresh requests');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="glass-light px-2.5 py-1 rounded-full text-yellow-400 text-xs font-medium">Pending</span>;
      case 'approved':
        return <span className="glass-light px-2.5 py-1 rounded-full text-green-400 text-xs font-medium">Approved</span>;
      case 'rejected':
        return <span className="glass-light px-2.5 py-1 rounded-full text-red-400 text-xs font-medium">Rejected</span>;
      default:
        return <span className="glass-light px-2.5 py-1 rounded-full text-white/70 text-xs font-medium">Unknown</span>;
    }
  };

  console.log('Current requests:', requests);
  console.log('Current stats:', stats);

  // Render dashboard tab
  const renderDashboard = () => {
    if (loading) {
      return <div className="flex justify-center py-20"><Loader /></div>;
    }
    
    if (!stats) {
      return (
        <div className="text-center py-10">
          <p className="text-white/70">No dashboard data available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white/80 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{stats.totalUsers || 0}</p>
            <div className="mt-2">
              <span className="text-sm text-white/60">Active accounts</span>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white/80 mb-2">Exams Conducted</h3>
            <p className="text-3xl font-bold text-white">{stats.totalExams || 0}</p>
            <div className="mt-2">
              <span className="text-sm text-white/60">Across all institutes</span>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white/80 mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-white">{stats.pendingRequests || 0}</p>
            <div className="mt-2">
              <span className="text-sm text-white/60">Waiting for approval</span>
            </div>
          </div>
        </div>
        
        {/* Requests Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">Recent Requests</h3>
            <button 
              onClick={refreshRequests}
              className="glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {requests && requests.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Institute</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Exam Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {requests.slice(0, 5).map((request) => (
                    <tr key={request._id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {request.institute?.name || 'Unknown Institute'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {request.examName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(request)}
                              className="glass-button px-3 py-1 rounded-lg text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="glass px-3 py-1 rounded-lg text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-white/50">
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70">No requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render users tab
  const renderUsersTab = () => {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex flex-wrap justify-between items-center px-6 py-4 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">Users</h3>
            <div className="flex items-center mt-2 sm:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-white/40" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass py-2 pl-10 pr-4 rounded-lg text-white placeholder-white/40 w-full sm:w-60"
                />
              </div>
              <button 
                onClick={handleUserListRefresh}
                className="glass p-2 rounded-full ml-2 text-white/70 hover:text-white transition-colors"
                disabled={isRefreshing}
              >
                <FaSync className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {userLoading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : (
              <>
                {filteredUsers && filteredUsers.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">User Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            <span className={`glass-light px-2.5 py-1 rounded-full text-xs capitalize`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="glass text-red-400 p-2 rounded-full hover:bg-white/10 transition-colors"
                              title="Delete user"
                            >
                              <FaTrash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-white/70">No users found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render create user tab
  const renderCreateUserTab = () => {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-6">Create New User</h3>
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
            />
          </div>
          
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-white/80 mb-1">
              User Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="glass w-full px-4 py-3 rounded-lg text-white"
            >
              <option value="student">Student</option>
              <option value="institute">Institute</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full py-3 px-4 rounded-lg text-white font-medium"
            >
              {isLoading ? <Loader small /> : 'Create User'}
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
    );
  };

  // Request Processing Modal
  const renderModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div onClick={(e) => e.stopPropagation()} className="glass-card max-w-lg w-full mx-4 p-6 rounded-xl relative">
          <h3 className="text-xl font-bold text-white mb-4">
            {processingType === 'approve' ? 'Approve Request' : 'Reject Request'}
          </h3>
          
          {selectedRequest && (
            <div className="mb-4">
              <p className="text-white/80 mb-1">
                <span className="font-medium">Exam:</span> {selectedRequest.examName}
              </p>
              <p className="text-white/80">
                <span className="font-medium">Institute:</span> {selectedRequest.institute?.name || 'Unknown'}
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="adminComment" className="block text-sm font-medium text-white/80 mb-1">
              Comment
            </label>
            <textarea
              id="adminComment"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="glass w-full px-4 py-3 rounded-lg text-white placeholder-white/50"
              rows="3"
            />
          </div>
          
          {processingStatus && (
            <div className="mb-4 p-3 glass-light rounded-lg">
              <p className="text-white/80 flex items-center">
                <span className="mr-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </span>
                {processingStatus}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedRequest(null);
                setAdminComment('');
                setProcessingType(null);
              }}
              className="glass px-4 py-2 rounded-lg text-white"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleRequestStatusUpdate}
              disabled={actionLoading}
              className={`glass-button px-4 py-2 rounded-lg text-white ${
                actionLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {actionLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                processingType === 'approve' ? 'Approve' : 'Reject'
              )}
            </button>
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
            Admin Dashboard
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
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
                onClick={() => handleTabSwitch('dashboard')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleTabSwitch('users')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => handleTabSwitch('create')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'create'
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Create User
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'create' && renderCreateUserTab()}
          </div>
        </div>
      </div>
      
      {/* Modal for request processing */}
      {renderModal()}
    </ScreenWrapper>
  );
};

export default AdminDashboard;