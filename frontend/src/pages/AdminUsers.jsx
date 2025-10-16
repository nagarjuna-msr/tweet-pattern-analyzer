import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { User, AlertCircle, FileText, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const usersWithPending = users?.filter(u => u.has_pending_work) || [];
  const activeUsers = users?.filter(u => !u.has_pending_work && (u.submission_count > 0 || u.content_count > 0)) || [];
  const inactiveUsers = users?.filter(u => u.submission_count === 0 && u.content_count === 0) || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">View all users and their activity</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-1">
              <User className="text-gray-400" size={20} />
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
          </div>
          
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="text-amber-600" size={20} />
              <p className="text-sm text-amber-800">Pending Work</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">{usersWithPending.length}</p>
          </div>

          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-sm text-green-800">Active Users</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{activeUsers.length}</p>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-1">
              <User className="text-gray-400" size={20} />
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{inactiveUsers.length}</p>
          </div>
        </div>

        {/* Users with Pending Work */}
        {usersWithPending.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="text-amber-600" size={24} />
              <span>Needs Attention ({usersWithPending.length})</span>
            </h2>
            
            <div className="space-y-3">
              {usersWithPending.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="block bg-amber-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.email}</h3>
                          <p className="text-sm text-gray-600">
                            {user.onboarding_data?.niche || 'No niche specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.pending_submissions > 0 && (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <FileText size={12} />
                            <span>{user.pending_submissions} pending profile analysis</span>
                          </span>
                        )}
                        {user.pending_content > 0 && (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            <MessageSquare size={12} />
                            <span>{user.pending_content} content needs tweets</span>
                          </span>
                        )}
                        {user.feedback_count > 0 && (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            <span>💬</span>
                            <span>{user.feedback_count} feedback</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Details →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Users ({activeUsers.length})
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {activeUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.email}</h3>
                        <p className="text-sm text-gray-600">
                          {user.onboarding_data?.niche || 'No niche'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FileText size={14} />
                      <span>{user.submission_count} analyses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={14} />
                      <span>{user.content_count} content</span>
                    </div>
                    {user.feedback_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{user.feedback_count} feedback</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Users */}
        {inactiveUsers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Inactive Users ({inactiveUsers.length})
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {inactiveUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

