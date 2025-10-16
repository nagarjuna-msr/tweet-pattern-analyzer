import { useQuery } from '@tanstack/react-query';
import { contentAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

export default function MyContent() {
  const { data: myIdeas, isLoading } = useQuery({
    queryKey: ['my-content-ideas'],
    queryFn: async () => {
      const response = await contentAPI.getMyIdeas();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const getStatusBadge = (status, tweetCount) => {
    if (status === 'completed' && tweetCount > 0) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={14} />
          <span>{tweetCount} tweets ready</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock size={14} />
        <span>Pending</span>
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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Content & Tweets</h1>
          <p className="text-gray-600 mt-1">Track your content submissions and generated tweets</p>
        </div>

        {myIdeas && myIdeas.length > 0 ? (
          <div className="space-y-4">
            {myIdeas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusBadge(idea.status, idea.tweet_count || 0)}
                      <span className="text-sm text-gray-500">
                        Submitted {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Your Content:</p>
                      <p className="text-sm text-gray-800">
                        {idea.raw_content.length > 200 
                          ? `${idea.raw_content.substring(0, 200)}...` 
                          : idea.raw_content
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {idea.status === 'completed' ? (
                  <Link
                    to={`/content/${idea.id}/tweets`}
                    className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <span>View Generated Tweets</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      ⏳ Your tweets are being crafted. We'll notify you when they're ready!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content submitted yet</h3>
            <p className="text-gray-600 mb-6">
              Submit your content ideas to get tweets based on proven patterns
            </p>
            <Link
              to="/content/submit"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <span>Submit Content Ideas</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

