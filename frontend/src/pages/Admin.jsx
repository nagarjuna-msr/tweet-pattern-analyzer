import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Users, AlertCircle, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';

export default function Admin() {
  // Fetch all users with stats
  const { data: users } = useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    refetchInterval: 30000,
  });

  const usersWithPendingWork = users?.filter(u => u.has_pending_work) || [];
  const totalPendingSubmissions = users?.reduce((sum, u) => sum + u.pending_submissions, 0) || 0;
  const totalPendingContent = users?.reduce((sum, u) => sum + u.pending_content, 0) || 0;
  const totalFeedback = users?.reduce((sum, u) => sum + u.feedback_count, 0) || 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of all user activity and pending work</p>
        </div>

        {/* Alert if there's pending work */}
        {usersWithPendingWork.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={32} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  {usersWithPendingWork.length} User{usersWithPendingWork.length > 1 ? 's' : ''} Need{usersWithPendingWork.length === 1 ? 's' : ''} Attention
                </h3>
                <p className="text-amber-800 mb-4">
                  {totalPendingSubmissions > 0 && `${totalPendingSubmissions} profile analysis pending`}
                  {totalPendingSubmissions > 0 && totalPendingContent > 0 && ' • '}
                  {totalPendingContent > 0 && `${totalPendingContent} content ideas need tweets`}
                </p>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <span>View All Users</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{users?.length || 0}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-900 mb-1">{usersWithPendingWork.length}</p>
            <p className="text-sm text-amber-800">Pending Work</p>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <MessageCircle size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-1">{totalFeedback}</p>
            <p className="text-sm text-blue-800">User Feedback</p>
          </div>

          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-900 mb-1">
              {users?.filter(u => !u.has_pending_work && (u.submission_count > 0 || u.content_count > 0)).length || 0}
            </p>
            <p className="text-sm text-green-800">Active Users</p>
          </div>
        </div>

        {/* Main Action Card */}
        <Link 
          to="/admin/users" 
          className="block bg-gradient-to-br from-primary to-primary-hover rounded-xl p-8 text-white hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Manage Users</h2>
              <p className="text-primary-light mb-4">
                View all users, see their activity, and manage pending work
              </p>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Go to Users</span>
                <ArrowRight size={20} />
              </div>
            </div>
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Users size={48} />
            </div>
          </div>
        </Link>

        {/* Quick Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">How to Use User-Centric Admin</h2>
          <ol className="space-y-3 text-sm text-blue-900">
            <li className="flex items-start space-x-2">
              <span className="font-bold flex-shrink-0">1.</span>
              <span>Click "Manage Users" to see all users</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold flex-shrink-0">2.</span>
              <span>Users with pending work appear at the top in amber</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold flex-shrink-0">3.</span>
              <span>Click any user to see their complete history (submissions, content, feedback)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold flex-shrink-0">4.</span>
              <span>Upload analysis or create tweets directly from the user's page</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold flex-shrink-0">5.</span>
              <span>See all user feedback in context with the original content</span>
            </li>
          </ol>
        </div>

        {/* Users Needing Attention (Quick Preview) */}
        {usersWithPendingWork.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Preview: Users Needing Attention
            </h2>
            <div className="space-y-3">
              {usersWithPendingWork.slice(0, 3).map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="block bg-white border border-amber-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {user.pending_submissions > 0 && (
                            <span className="text-amber-700">{user.pending_submissions} pending analysis</span>
                          )}
                          {user.pending_content > 0 && (
                            <span className="text-amber-700">{user.pending_content} needs tweets</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="text-gray-400" size={20} />
                  </div>
                </Link>
              ))}
              {usersWithPendingWork.length > 3 && (
                <Link 
                  to="/admin/users"
                  className="block text-center py-3 text-primary hover:text-primary-hover font-medium"
                >
                  View {usersWithPendingWork.length - 3} more users →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
