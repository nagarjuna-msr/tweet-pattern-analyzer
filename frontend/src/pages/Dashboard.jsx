import { useQuery } from '@tanstack/react-query';
import { submissionsAPI, contentAPI, authAPI } from '@/lib/api';
import { Link, Navigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Plus, MessageSquare, ArrowRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '@/components/Layout';
import { useState } from 'react';

export default function Dashboard() {
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [showAllContent, setShowAllContent] = useState(false);

  // ✅ FIX: ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  // Check if user is admin
  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await authAPI.getMe();
      return response.data;
    },
  });

  // Fetch submissions (disabled if admin)
  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await submissionsAPI.getMySubmissions();
      return response.data;
    },
    refetchInterval: 30000,
    enabled: !!currentUser && !currentUser.is_admin, // Only run if user exists and is not admin
  });

  // Fetch content ideas (disabled if admin)
  const { data: contentIdeas, isLoading: loadingContent } = useQuery({
    queryKey: ['my-content-brief'],
    queryFn: async () => {
      const response = await contentAPI.getMyIdeas();
      return response.data;
    },
    refetchInterval: 30000,
    enabled: !!currentUser && !currentUser.is_admin, // Only run if user exists and is not admin
  });

  // ✅ NOW safe to return early - all hooks have been called
  // Redirect admin users to admin panel
  if (currentUser?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  const isLoading = loadingUser || loadingSubmissions || loadingContent;

  // Determine user state
  const hasSubmissions = submissions && submissions.length > 0;
  const hasContent = contentIdeas && contentIdeas.length > 0;
  const isFirstTime = !hasSubmissions && !hasContent;
  const latestSubmission = submissions?.[0];
  const latestContent = contentIdeas?.[0];
  const hasPending = latestSubmission?.status === 'pending' || latestSubmission?.status === 'processing' ||
                     latestContent?.status === 'pending';

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // STATE 1: First-Time User
  if (isFirstTime) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Pattern Analyzer!</h1>
            <p className="text-lg text-gray-600">Let's get you started with analyzing your Twitter patterns</p>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Submit Twitter Profiles</h3>
                  <p className="text-sm text-gray-600">Share Twitter handles you want analyzed (competitors, inspirations, etc.)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Get Pattern Analysis</h3>
                  <p className="text-sm text-gray-600">Receive detailed analysis of viral tweet patterns and content strategies</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Submit Your Content</h3>
                  <p className="text-sm text-gray-600">Share your ideas, thoughts, or content you want to tweet about</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Get Optimized Tweets</h3>
                  <p className="text-sm text-gray-600">Receive 5 tweet variations based on proven viral patterns</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profiles/submit"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5 mr-2" />
              Get Started - Analyze Profiles
            </Link>

            <Link
              to="/content/submit"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Skip to Submit Content
            </Link>
          </div>

          {/* Helpful Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> We recommend starting with profile analysis for better tweet optimization
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // STATE 2 & 3: Active/Experienced User
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Track your submissions and results</p>
        </div>

        {/* Latest Profile Analysis */}
        {latestSubmission && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Latest Profile Analysis</h2>
                  <p className="text-sm text-gray-500">
                    Submitted {new Date(latestSubmission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(latestSubmission.status)}
              </div>

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
                </div>
              </div>

              {latestSubmission.status === 'completed' && latestSubmission.analysis_id && (
                <Link
                  to={`/analysis/${latestSubmission.id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Analysis
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              )}

              {(latestSubmission.status === 'pending' || latestSubmission.status === 'processing') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ⏳ Your analysis is in progress. You'll be notified when it's ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Latest Content Submission */}
        {latestContent && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Latest Content Submission</h2>
                  <p className="text-sm text-gray-500">
                    Submitted {new Date(latestContent.created_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(latestContent.status)}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {latestContent.raw_content}
                </p>
              </div>

              {latestContent.status === 'completed' && latestContent.tweet_count > 0 && (
                <Link
                  to={`/content/${latestContent.id}/tweets`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View {latestContent.tweet_count} Tweets
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              )}

              {latestContent.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ⏳ Your tweets are being generated. You'll be notified when they're ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/profiles/submit"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Submit New Profiles
          </Link>

          <Link
            to="/content/submit"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Submit Content
          </Link>
        </div>

        {!hasSubmissions && hasContent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Your tweets work better with pattern analysis! Consider submitting Twitter profiles first.
            </p>
          </div>
        )}

        {/* All Submissions (Collapsible) */}
        {submissions && submissions.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowAllSubmissions(!showAllSubmissions)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  All Profile Analyses ({submissions.length})
                </span>
              </div>
              {showAllSubmissions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAllSubmissions && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.profile_urls.length} profiles
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      {submission.status === 'completed' && (
                        <Link
                          to={`/analysis/${submission.id}`}
                          className="text-primary hover:text-primary/80 font-medium text-sm"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Content (Collapsible) */}
        {contentIdeas && contentIdeas.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowAllContent(!showAllContent)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  All Content Submissions ({contentIdeas.length})
                </span>
              </div>
              {showAllContent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAllContent && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {contentIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {idea.raw_content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(idea.status)}
                      {idea.status === 'completed' && idea.tweet_count > 0 && (
                        <Link
                          to={`/content/${idea.id}/tweets`}
                          className="text-primary hover:text-primary/80 font-medium text-sm whitespace-nowrap"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
