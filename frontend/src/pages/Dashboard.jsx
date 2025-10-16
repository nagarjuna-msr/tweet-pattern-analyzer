import { useQuery } from '@tanstack/react-query';
import { submissionsAPI, contentAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Plus, MessageSquare, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Dashboard() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await submissionsAPI.getMySubmissions();
      return response.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { data: contentIdeas } = useQuery({
    queryKey: ['my-content-brief'],
    queryFn: async () => {
      const response = await contentAPI.getMyIdeas();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
        <Icon size={14} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getTimeRemaining = (expectedDelivery) => {
    if (!expectedDelivery) return null;
    
    const now = new Date();
    const delivery = new Date(expectedDelivery);
    const diff = delivery - now;
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const latestSubmission = submissions?.[0];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Track your submissions and analysis results</p>
        </div>

        {/* Latest Submission Status Card */}
        {latestSubmission && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Latest Submission</h2>
                  <p className="text-sm text-gray-500">
                    Submitted {new Date(latestSubmission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(latestSubmission.status)}
              </div>

              {/* Progress Timeline */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['pending', 'processing', 'completed'].includes(latestSubmission.status)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <CheckCircle size={16} />
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      ['processing', 'completed'].includes(latestSubmission.status)
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['processing', 'completed'].includes(latestSubmission.status)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Clock size={16} />
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      latestSubmission.status === 'completed'
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      latestSubmission.status === 'completed'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Submitted</span>
                    <span>Analyzing</span>
                    <span>Complete</span>
                  </div>
                </div>
              </div>

              {/* Profiles List */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Profiles ({latestSubmission.profile_urls.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {latestSubmission.profile_urls.slice(0, 5).map((url, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {url.split('/').pop()}
                    </span>
                  ))}
                  {latestSubmission.profile_urls.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-sm">
                      +{latestSubmission.profile_urls.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Countdown or Action */}
              {latestSubmission.status === 'completed' ? (
                <Link
                  to={`/analysis/${latestSubmission.id}`}
                  className="block w-full bg-primary hover:bg-primary-hover text-white text-center font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  View Analysis Results →
                </Link>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Expected Delivery: {new Date(latestSubmission.expected_delivery_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700">
                    {getTimeRemaining(latestSubmission.expected_delivery_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Content & Tweets Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="text-green-600" size={24} />
                <span>My Content & Tweets</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {contentIdeas?.length > 0 
                  ? `${contentIdeas.length} content submission(s)`
                  : 'No content submitted yet'
                }
              </p>
            </div>
            <Link
              to="/my-content"
              className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {contentIdeas && contentIdeas.length > 0 ? (
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Latest submission:</p>
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {contentIdeas[0].raw_content.substring(0, 150)}...
                  </p>
                </div>
                <div className="ml-4">
                  {contentIdeas[0].status === 'completed' ? (
                    <Link
                      to={`/content/${contentIdeas[0].id}/tweets`}
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <CheckCircle size={18} />
                      <span>View Tweets</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Clock size={16} />
                      <span>In Progress</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Submit your content ideas to get AI-generated tweets</p>
              <Link
                to="/content/submit"
                className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Submit Content</span>
              </Link>
            </div>
          )}
        </div>

        {/* All Submissions List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Requests</h2>
          {submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  to={submission.status === 'completed' ? `/analysis/${submission.id}` : `/dashboard`}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-400" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">
                          Analysis #{submission.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {submission.profile_urls.length} profiles analyzed
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis requests yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by submitting Twitter profiles from your niche for pattern analysis
              </p>
              <Link
                to="/profiles/submit"
                className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Submit Profiles for Analysis</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


