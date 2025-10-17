import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, contentAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Plus, X, MessageCircle, RefreshCw } from 'lucide-react';

export default function AdminContent() {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [patternUsed, setPatternUsed] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [selectedIdeaForFeedback, setSelectedIdeaForFeedback] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all content ideas
  const { data: allIdeas, isLoading } = useQuery({
    queryKey: ['admin-content-ideas'],
    queryFn: async () => {
      const response = await adminAPI.getContentIdeas();
      return response.data;
    },
    refetchInterval: 30000,
    retry: 2,
  });

  // Fetch tweets for a specific idea (on-demand)
  const { data: selectedIdeaTweets, isLoading: loadingTweets, refetch: refetchTweets } = useQuery({
    queryKey: ['idea-tweets', selectedIdeaForFeedback],
    queryFn: async () => {
      if (!selectedIdeaForFeedback) return [];
      
      const response = await contentAPI.getTweets(selectedIdeaForFeedback);
      return response.data;
    },
    enabled: !!selectedIdeaForFeedback,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const createTweetMutation = useMutation({
    mutationFn: (data) => adminAPI.createTweet(data),
    onSuccess: () => {
      toast.success('Tweet created successfully!');
      resetForm();
      queryClient.invalidateQueries(['admin-content-ideas']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create tweet');
    },
  });

  const deleteTweetMutation = useMutation({
    mutationFn: (tweetId) => adminAPI.deleteTweet(tweetId),
    onSuccess: () => {
      toast.success('Tweet deleted');
      queryClient.invalidateQueries(['admin-content-ideas']);
    },
  });

  const resetForm = () => {
    setShowTweetModal(false);
    setSelectedIdea(null);
    setTweetText('');
    setPatternUsed('');
    setReasoning('');
  };

  const handleCreateTweet = () => {
    if (!selectedIdea || !tweetText) return;
    
    createTweetMutation.mutate({
      idea_id: selectedIdea.id,
      tweet_text: tweetText,
      pattern_used: patternUsed,
      reasoning: reasoning
    });
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

  const pendingIdeas = allIdeas?.filter(i => i.status === 'pending') || [];
  const completedIdeas = allIdeas?.filter(i => i.status === 'completed') || [];

  // Get tweets with feedback from selected idea
  const tweetsWithFeedback = selectedIdeaTweets?.filter(t => t.feedback_type) || [];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Content & Tweets</h1>
          <p className="text-gray-600 mt-1">Create tweets for user content submissions</p>
        </div>

        {/* User Feedback Section */}
        {completedIdeas.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <MessageCircle className="text-primary" size={24} />
                <span>User Feedback</span>
              </h2>
              {selectedIdeaForFeedback && (
                <button
                  onClick={() => refetchTweets()}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Select a completed content idea to view user feedback on tweets (auto-refreshes every 10 seconds):
              </p>
              
              <div className="flex flex-wrap gap-2">
                {completedIdeas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdeaForFeedback(idea.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedIdeaForFeedback === idea.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Content Idea #{idea.id} {idea.tweet_count > 0 && `(${idea.tweet_count} tweets)`}
                  </button>
                ))}
              </div>

              {/* Show feedback for selected idea */}
              {selectedIdeaForFeedback && (
                <div className="mt-4">
                  {loadingTweets ? (
                    <div className="bg-white rounded-lg p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading feedback...</p>
                    </div>
                  ) : tweetsWithFeedback.length > 0 ? (
                    <div className="space-y-3">
                      {tweetsWithFeedback.map((tweet) => {
                        const feedbackColors = {
                          use_this: 'bg-green-50 border-green-200',
                          tweak: 'bg-blue-50 border-blue-200',
                          regenerate: 'bg-amber-50 border-amber-200'
                        };
                        const feedbackLabels = {
                          use_this: { icon: '👍', label: 'Saved', color: 'text-green-800' },
                          tweak: { icon: '✏️', label: 'Tweak Requested', color: 'text-blue-800' },
                          regenerate: { icon: '🔄', label: 'Regenerate Requested', color: 'text-amber-800' }
                        };
                        const feedback = feedbackLabels[tweet.feedback_type];
                        
                        return (
                          <div 
                            key={tweet.id} 
                            className={`rounded-lg border p-4 ${feedbackColors[tweet.feedback_type]}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${feedback.color}`}>
                                  {feedback.icon} {feedback.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Tweet #{tweet.id}
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 mb-2">
                              <p className="text-sm text-gray-900">{tweet.tweet_text}</p>
                              {tweet.pattern_used && (
                                <p className="text-xs text-gray-600 mt-2">Pattern: {tweet.pattern_used}</p>
                              )}
                            </div>
                            
                            {tweet.feedback_notes && (
                              <div className="bg-white rounded-lg p-3 border-l-4 border-gray-400">
                                <p className="text-xs font-medium text-gray-700 mb-1">User Notes:</p>
                                <p className="text-sm text-gray-900">{tweet.feedback_notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600">No feedback yet for this content idea</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Content Ideas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Content Ideas ({pendingIdeas.length})
          </h2>
          
          {pendingIdeas.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No pending content ideas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIdeas.map((idea) => (
                <div key={idea.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                        <span className="text-sm text-gray-500">
                          Content Idea #{idea.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        User ID: {idea.user_id} | Submitted: {new Date(idea.created_at).toLocaleString()}
                        {idea.tweet_count > 0 && ` | ${idea.tweet_count} tweet(s) created`}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.raw_content}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedIdea(idea);
                        setShowTweetModal(true);
                      }}
                      className="ml-4 inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                      <span>Create Tweet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Ideas with Tweets */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Completed Content ({completedIdeas.length})
          </h2>
          
          {completedIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Completed
                </span>
                <span className="text-sm text-gray-500">Content Idea #{idea.id}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                User ID: {idea.user_id} | {idea.tweet_count || 0} tweet(s) generated
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Tweet Modal */}
      {showTweetModal && selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Create Tweet for Idea #{selectedIdea.id}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Generate 2-10 tweets based on patterns</p>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Original Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Content
              </label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedIdea.raw_content}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tweet Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tweet Text * (max 280 characters)
                </label>
                <textarea
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  maxLength={280}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Your tweet text here..."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {tweetText.length} / 280
                </p>
              </div>

              {/* Pattern Used */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern Used
                </label>
                <input
                  type="text"
                  value={patternUsed}
                  onChange={(e) => setPatternUsed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Question-Tension-Promise"
                />
              </div>

              {/* Reasoning */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why It Works (Reasoning)
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Explain why this tweet will work based on the pattern analysis..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTweet}
                disabled={createTweetMutation.isPending || !tweetText.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTweetMutation.isPending ? 'Creating...' : 'Create Tweet'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Tip: Create multiple tweets (2-10) for the same content idea by repeating this process
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}

