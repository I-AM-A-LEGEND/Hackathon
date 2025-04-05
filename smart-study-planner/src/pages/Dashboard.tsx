import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

interface StudyPlan {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  subject?: string;
  progress?: number;
  totalSessions?: number;
  completedSessions?: number;
}

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
};

const subjectIcons = {
  math: '📐',
  science: '🔬',
  history: '📚',
  language: '🗣️',
  computer: '💻',
  art: '🎨',
  music: '🎵',
  other: '📝',
};

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const router = useRouter();

  // Mock data for development
  const mockPlans: StudyPlan[] = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      description: 'Prepare for calculus exam covering differentiation and integration',
      startDate: '2023-06-01',
      endDate: '2023-06-15',
      status: 'in-progress',
      subject: 'math',
      progress: 65,
      totalSessions: 10,
      completedSessions: 6,
    },
    {
      id: 2,
      title: 'History Research Paper',
      description: 'Research and write a 10-page paper on World War II',
      startDate: '2023-05-20',
      endDate: '2023-06-10',
      status: 'completed',
      subject: 'history',
      progress: 100,
      totalSessions: 8,
      completedSessions: 8,
    },
    {
      id: 3,
      title: 'Programming Project',
      description: 'Build a web application using React and Node.js',
      startDate: '2023-06-05',
      endDate: '2023-06-30',
      status: 'pending',
      subject: 'computer',
      progress: 0,
      totalSessions: 12,
      completedSessions: 0,
    },
  ];

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // Fetch study plans from API
      const fetchStudyPlans = async () => {
        try {
          setIsLoading(true);
          // In a real app, this would be an API call
          // const response = await fetch(`/api/study-plans?userId=${session.user.id}`);
          // if (!response.ok) throw new Error('Failed to fetch study plans');
          // const data = await response.json();
          
          // Using mock data for now
          setTimeout(() => {
            setStudyPlans(mockPlans);
            setIsLoading(false);
          }, 800); // Simulate network delay
        } catch (error) {
          console.error('Error fetching study plans:', error);
          setError('Failed to load study plans. Please try again later.');
          setIsLoading(false);
        }
      };

      fetchStudyPlans();
    }
  }, [status, session]);

  const handleCreateStudyPlan = () => {
    router.push('/create-study-plan');
  };

  const handleViewStudyPlan = (id: number) => {
    router.push(`/study-plan?id=${id}`);
  };

  const handleDeleteStudyPlan = (id: number) => {
    // In a real app, this would be an API call
    setStudyPlans(studyPlans.filter(plan => plan.id !== id));
  };

  const handleUpdateStatus = (id: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setStudyPlans(
      studyPlans.map(plan => 
        plan.id === id ? { ...plan, status: newStatus } : plan
      )
    );
  };

  const filteredPlans = filterStatus === 'all' 
    ? studyPlans 
    : studyPlans.filter(plan => plan.status === filterStatus);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage your study plans and track your progress
              </p>
            </div>
            
            <button
              onClick={handleCreateStudyPlan}
              className="mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Study Plan
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-800">Total Plans</h3>
                <p className="text-3xl font-bold mt-2">{studyPlans.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Completed</h3>
                <p className="text-3xl font-bold mt-2">
                  {studyPlans.filter(plan => plan.status === 'completed').length}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">In Progress</h3>
                <p className="text-3xl font-bold mt-2">
                  {studyPlans.filter(plan => plan.status === 'in-progress').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                <p className="text-3xl font-bold mt-2">
                  {studyPlans.filter(plan => plan.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">My Study Plans</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md ${
                  filterStatus === 'all' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-4 py-2 rounded-md ${
                  filterStatus === 'in-progress' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-md ${
                  filterStatus === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                Pending
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 p-4 rounded-md text-red-800">
                {error}
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium mt-4">No study plans found</h3>
                <p className="text-gray-500 mt-2">
                  {filterStatus === 'all' 
                    ? "You don't have any study plans yet. Create your first one!" 
                    : `You don't have any ${filterStatus} study plans.`}
                </p>
                {filterStatus === 'all' && (
                  <button
                    onClick={handleCreateStudyPlan}
                    className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150"
                  >
                    Create Your First Study Plan
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3" role="img" aria-label={plan.subject || 'other'}>
                          {plan.subject && subjectIcons[plan.subject as keyof typeof subjectIcons] || subjectIcons.other}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 truncate" title={plan.title}>
                          {plan.title}
                        </h3>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[plan.status]}`}>
                        {plan.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-600 mb-4 line-clamp-2" title={plan.description}>
                        {plan.description}
                      </p>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Start:</span> {new Date(plan.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">End:</span> {new Date(plan.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {plan.progress !== undefined && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-medium text-gray-700">{plan.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          {plan.totalSessions && (
                            <p className="mt-1 text-xs text-gray-500">
                              {plan.completedSessions} of {plan.totalSessions} sessions completed
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex border-t border-gray-100">
                      <button
                        onClick={() => handleViewStudyPlan(plan.id)}
                        className="flex-1 py-3 text-indigo-600 font-medium hover:bg-indigo-50 transition duration-150"
                      >
                        View Details
                      </button>
                      <div className="border-l border-gray-100"></div>
                      <div className="relative group">
                        <button className="py-3 px-4 text-gray-500 hover:bg-gray-50 transition duration-150">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                          <button
                            onClick={() => handleUpdateStatus(
                              plan.id, 
                              plan.status === 'pending' ? 'in-progress' : 
                              plan.status === 'in-progress' ? 'completed' : 'pending'
                            )}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {plan.status === 'pending' ? 'Mark as In Progress' : 
                             plan.status === 'in-progress' ? 'Mark as Completed' : 
                             'Mark as Pending'}
                          </button>
                          <button
                            onClick={() => handleDeleteStudyPlan(plan.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DashboardPage; 