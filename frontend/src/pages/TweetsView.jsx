import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI } from '@/lib/api';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { ThumbsUp, Edit3, RefreshCw, X } from 'lucide-react';

export default function TweetsView() {
  const { ideaId } = useParams();
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: tweets, isLoading } = useQuery({
    queryKey: ['tweets', ideaId],
    queryFn: async () => {
      const response = await contentAPI.getTweets(ideaId);
      return response.data;
    },
    enabled: !!ideaId,
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ tweetId, feedbackType, notes }) =>
      contentAPI.submitFeedback(tweetId, feedbackType, notes),
    onSuccess: () => {
      toast.success('Feedback submitted!');
      setFeedbackModal(null);
      setFeedbackNotes('');
      queryClient.invalidateQueries(['tweets', ideaId]);
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const handleFeedback = (tweetId, feedbackType) => {
    if (feedbackType === 'use_this') {
      feedbackMutation.mutate({ tweetId, feedbackType, notes: null });
    } else {
      setFeedbackModal({ tweetId, feedbackType });
    }
  };

  const submitFeedback = () => {
    if (feedbackModal) {
      feedbackMutation.mutate({
        tweetId: feedbackModal.tweetId,
        feedbackType: feedbackModal.feedbackType,
        notes: feedbackNotes,
      });
    }
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generated Tweets</h1>
          <p className="text-gray-600">Review and provide feedback on your tweets</p>
        </div>

        {tweets && tweets.length > 0 ? (
          <div className="space-y-6">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Tweet Preview */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">Your Name</span>
                        <span className="text-gray-500">@username</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500">Now</span>
                      </div>
                      <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                        {tweet.tweet_text}
                      </p>
                      <div className="flex items-center space-x-6 mt-3 text-gray-500 text-sm">
                        <span>💬 Reply</span>
                        <span>🔄 Retweet</span>
                        <span>💙 Like</span>
                        <span>📊 View</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why it Works */}
                {(tweet.pattern_used || tweet.reasoning) && (
                  <div className="bg-blue-50 p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Why it Works</h4>
                    {tweet.pattern_used && (
                      <p className="text-sm text-blue-800 mb-1">
                        <span className="font-medium">Pattern:</span> {tweet.pattern_used}
                      </p>
                    )}
                    {tweet.reasoning && (
                      <p className="text-sm text-blue-800">{tweet.reasoning}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleFeedback(tweet.id, 'use_this')}
                    disabled={tweet.feedback_type === 'use_this'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp size={16} />
                    <span>{tweet.feedback_type === 'use_this' ? 'Saved' : 'Save This'}</span>
                  </button>
                  <button
                    onClick={() => handleFeedback(tweet.id, 'tweak')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Request Tweak</span>
                  </button>
                  <button
                    onClick={() => handleFeedback(tweet.id, 'regenerate')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <RefreshCw size={16} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No tweets generated yet. Please check back shortly.</p>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feedbackModal.feedbackType === 'tweak' ? 'Request Tweak' : 'Regenerate Tweet'}
                </h3>
                <button
                  onClick={() => setFeedbackModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {feedbackModal.feedbackType === 'tweak'
                  ? 'Tell us what you\'d like to change about this tweet:'
                  : 'Let us know what you\'d like in the regenerated version:'}
              </p>

              <textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none mb-4"
                placeholder="E.g., Make it more casual, add a question, focus on X benefit..."
              />

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFeedbackModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={feedbackMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-75"
                >
                  {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


