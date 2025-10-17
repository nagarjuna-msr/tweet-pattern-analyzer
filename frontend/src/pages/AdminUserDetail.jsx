import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { 
  ArrowLeft, FileText, MessageSquare, Clock, CheckCircle, AlertCircle,
  Plus, X, ThumbsUp, Edit3, RefreshCw, User, Calendar
} from 'lucide-react';

export default function AdminUserDetail() {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [tweetText, setTweetText] = useState('');
  const [patternUsed, setPatternUsed] = useState('');
  const [reasoning, setReasoning] = useState('');
  
  // Analysis upload state
  const [analysisFile, setAnalysisFile] = useState(null);
  const [keyPatterns, setKeyPatterns] = useState([{ pattern_name: '', description: '' }]);

  // Fetch complete user details
  const { data: userDetails, isLoading, refetch } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const response = await adminAPI.getUserDetails(userId);
      return response.data;
    },
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  const createTweetMutation = useMutation({
    mutationFn: (data) => adminAPI.createTweet(data),
    onSuccess: () => {
      toast.success('Tweet created!');
      setShowTweetModal(false);
      setTweetText('');
      setPatternUsed('');
      setReasoning('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create tweet');
    },
  });

  const uploadAnalysisMutation = useMutation({
    mutationFn: async ({ submission_id, file, patterns }) => {
      let documentUrl = null;
      let documentType = null;

      // Step 1: Upload document if provided
      if (file) {
        const uploadResponse = await adminAPI.uploadDocument(submission_id, file);
        documentUrl = uploadResponse.data.document_url;
        documentType = uploadResponse.data.document_type;
      }

      // Step 2: Create analysis with patterns
      const analysisResponse = await adminAPI.createAnalysis({
        submission_id,
        key_patterns: patterns.filter(p => p.pattern_name && p.description),
        document_url: documentUrl,
        document_type: documentType,
      });

      return analysisResponse.data;
    },
    onSuccess: () => {
      toast.success('✅ Analysis uploaded successfully!');
      setShowAnalysisModal(false);
      setSelectedSubmission(null);
      setAnalysisFile(null);
      setKeyPatterns([{ pattern_name: '', description: '' }]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to upload analysis');
    },
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

  if (!userDetails) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">User not found</p>
        </div>
      </Layout>
    );
  }

  const { user, submissions, content_ideas } = userDetails;
  
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const completedSubmissions = submissions.filter(s => s.status === 'completed');
  const pendingContent = content_ideas.filter(c => c.status === 'pending');
  const completedContent = content_ideas.filter(c => c.status === 'completed');
  
  // Get all feedback history across all content (flatten all history entries)
  const allFeedback = content_ideas.flatMap(idea => 
    idea.tweets.flatMap(tweet => 
      (tweet.feedback_history || []).map(fh => ({
        ...fh,
        tweet_text: tweet.tweet_text,
        tweet_id: tweet.id,
        pattern_used: tweet.pattern_used,
        idea: idea
      }))
    )
  );

  const handleCreateTweet = () => {
    if (!selectedIdea || !tweetText) return;
    
    createTweetMutation.mutate({
      idea_id: selectedIdea.id,
      tweet_text: tweetText,
      pattern_used: patternUsed,
      reasoning: reasoning
    });
  };

  const handleUploadAnalysis = () => {
    if (!selectedSubmission) return;

    // Validate at least one pattern
    const validPatterns = keyPatterns.filter(p => p.pattern_name && p.description);
    if (validPatterns.length === 0) {
      toast.error('Please add at least one pattern');
      return;
    }

    uploadAnalysisMutation.mutate({
      submission_id: selectedSubmission.id,
      file: analysisFile,
      patterns: keyPatterns,
    });
  };

  const addPattern = () => {
    setKeyPatterns([...keyPatterns, { pattern_name: '', description: '' }]);
  };

  const removePattern = (index) => {
    setKeyPatterns(keyPatterns.filter((_, i) => i !== index));
  };

  const updatePattern = (index, field, value) => {
    const updated = [...keyPatterns];
    updated[index][field] = value;
    setKeyPatterns(updated);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link 
            to="/admin/users" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Users</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.email}</h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  {user.onboarding_data?.niche && (
                    <>
                      <span>•</span>
                      <span className="font-medium">{user.onboarding_data.niche}</span>
                    </>
                  )}
                  {user.onboarding_data?.goals && (
                    <>
                      <span>•</span>
                      <span>{user.onboarding_data.goals}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Profile Analyses</p>
            <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Content Ideas</p>
            <p className="text-2xl font-bold text-gray-900">{content_ideas.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <p className="text-sm text-amber-800 mb-1">Pending Work</p>
            <p className="text-2xl font-bold text-amber-900">{pendingSubmissions.length + pendingContent.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-800 mb-1">Feedback Received</p>
            <p className="text-2xl font-bold text-blue-900">{allFeedback.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-800 mb-1">Tweets Generated</p>
            <p className="text-2xl font-bold text-green-900">
              {content_ideas.reduce((sum, idea) => sum + idea.tweets.length, 0)}
            </p>
          </div>
        </div>

        {/* User Feedback Section */}
        {allFeedback.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="text-primary" size={24} />
              <span>User Feedback ({allFeedback.length})</span>
            </h2>

            <div className="space-y-3">
              {allFeedback.map((feedback) => {
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
                const label = feedbackLabels[feedback.feedback_type];
                
                return (
                  <div 
                    key={feedback.id} 
                    className={`rounded-lg border p-4 ${feedbackColors[feedback.feedback_type]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`font-semibold ${label.color}`}>
                            {label.icon} {label.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            • Tweet #{feedback.tweet_id} • Content Idea #{feedback.idea.id}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {new Date(feedback.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-2 border-l-4 border-gray-300">
                          <p className="text-xs text-gray-600 mb-1">Original Content:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">{feedback.idea.raw_content}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <p className="text-sm text-gray-900 mb-2">{feedback.tweet_text}</p>
                      {feedback.pattern_used && (
                        <p className="text-xs text-gray-600">Pattern: {feedback.pattern_used}</p>
                      )}
                    </div>
                    
                    {feedback.feedback_notes && (
                      <div className="bg-white rounded-lg p-3 border-l-4 border-primary">
                        <p className="text-xs font-medium text-gray-700 mb-1">User Notes:</p>
                        <p className="text-sm text-gray-900">{feedback.feedback_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Submissions Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="text-primary" size={24} />
            <span>Profile Analyses ({submissions.length})</span>
          </h2>

          {/* Pending Submissions */}
          {pendingSubmissions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">⏳ Pending ({pendingSubmissions.length})</h3>
              <div className="space-y-3">
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            NEEDS ANALYSIS
                          </span>
                          <span className="text-sm text-gray-600">
                            Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2">{sub.profile_urls.length} profiles:</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.profile_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs"
                              >
                                @{url.split('/').pop()}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setShowAnalysisModal(true);
                        }}
                        className="ml-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Upload Analysis
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Submissions */}
          {completedSubmissions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Completed ({completedSubmissions.length})</h3>
              <div className="space-y-3">
                {completedSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="text-green-600" size={18} />
                          <span className="font-medium text-gray-900">Analysis #{sub.id}</span>
                          <span className="text-sm text-gray-500">
                            • {new Date(sub.analysis.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {sub.analysis.key_patterns && sub.analysis.key_patterns.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {sub.analysis.key_patterns.length} patterns identified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Ideas & Tweets Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="text-primary" size={24} />
            <span>Content & Tweets ({content_ideas.length})</span>
          </h2>

          {/* Pending Content */}
          {pendingContent.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">⏳ Needs Tweets ({pendingContent.length})</h3>
              <div className="space-y-3">
                {pendingContent.map((idea) => (
                  <div key={idea.id} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            NEEDS TWEETS
                          </span>
                          <span className="text-sm text-gray-600">
                            Content Idea #{idea.id}
                          </span>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-800">{idea.raw_content}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedIdea(idea);
                          setShowTweetModal(true);
                        }}
                        className="ml-4 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Create Tweet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Content */}
          {completedContent.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Completed ({completedContent.length})</h3>
              <div className="space-y-4">
                {completedContent.map((idea) => (
                  <div key={idea.id} className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="text-green-600" size={18} />
                        <span className="font-medium text-gray-900">Content Idea #{idea.id}</span>
                        <span className="text-sm text-gray-500">
                          • {idea.tweets.length} tweet(s) generated
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        {idea.raw_content}
                      </div>
                    </div>

                    {/* Tweets for this idea */}
                    <div className="space-y-2">
                      {idea.tweets.map((tweet) => (
                        <div 
                          key={tweet.id} 
                          className={`rounded-lg border p-3 ${
                            tweet.feedback_history && tweet.feedback_history.length > 0
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs text-gray-500">Tweet #{tweet.id}</span>
                                {tweet.feedback_history && tweet.feedback_history.length > 0 && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    {tweet.feedback_history.length} feedback{tweet.feedback_history.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-900 mb-2">{tweet.tweet_text}</p>
                              {tweet.pattern_used && (
                                <p className="text-xs text-gray-600 mb-1">Pattern: {tweet.pattern_used}</p>
                              )}
                              
                              {/* Feedback History Timeline */}
                              {tweet.feedback_history && tweet.feedback_history.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-semibold text-gray-700">Feedback Timeline:</p>
                                  {tweet.feedback_history.map((fh, idx) => (
                                    <div key={fh.id} className="bg-white rounded p-2 text-xs">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium">
                                          {fh.feedback_type === 'use_this' && '👍 Saved'}
                                          {fh.feedback_type === 'tweak' && '✏️ Tweak'}
                                          {fh.feedback_type === 'regenerate' && '🔄 Regenerate'}
                                        </span>
                                        <span className="text-gray-400">
                                          {new Date(fh.created_at).toLocaleString()}
                                        </span>
                                        {idx === 0 && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                            LATEST
                                          </span>
                                        )}
                                      </div>
                                      {fh.feedback_notes && (
                                        <p className="text-gray-700 ml-4">{fh.feedback_notes}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedIdea(idea);
                        setShowTweetModal(true);
                      }}
                      className="mt-3 inline-flex items-center space-x-2 text-primary hover:text-primary-hover font-medium text-sm"
                    >
                      <Plus size={16} />
                      <span>Add More Tweets</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content_ideas.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No content submitted yet</p>
            </div>
          )}
        </div>

        {/* Upload Analysis Modal */}
        {showAnalysisModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Analysis for Submission #{selectedSubmission.id}
                </h3>
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedSubmission(null);
                    setAnalysisFile(null);
                    setKeyPatterns([{ pattern_name: '', description: '' }]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Submission Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">User: {userDetails.user.email}</p>
                <p className="text-sm text-gray-600 mb-2">{selectedSubmission.profile_urls.length} profiles:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.profile_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                    >
                      @{url.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>

              {/* Key Patterns Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Key Patterns * (at least 1 required)
                  </label>
                  <button
                    onClick={addPattern}
                    className="inline-flex items-center space-x-1 text-primary hover:text-primary-hover text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Pattern</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {keyPatterns.map((pattern, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Pattern {index + 1}</h4>
                        {keyPatterns.length > 1 && (
                          <button
                            onClick={() => removePattern(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pattern Name *
                          </label>
                          <input
                            type="text"
                            value={pattern.pattern_name}
                            onChange={(e) => updatePattern(index, 'pattern_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="e.g., Question-Hook Pattern"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            value={pattern.description}
                            onChange={(e) => updatePattern(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                            placeholder="Describe what makes this pattern work..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Document (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload detailed analysis (.md, .pdf, or .txt file)
                </p>
                <input
                  type="file"
                  accept=".md,.pdf,.txt"
                  onChange={(e) => setAnalysisFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-white
                    hover:file:bg-primary-hover
                    file:cursor-pointer cursor-pointer"
                />
                {analysisFile && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{analysisFile.name}</span>
                    <button
                      onClick={() => setAnalysisFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedSubmission(null);
                    setAnalysisFile(null);
                    setKeyPatterns([{ pattern_name: '', description: '' }]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={uploadAnalysisMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadAnalysis}
                  disabled={uploadAnalysisMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 font-medium"
                >
                  {uploadAnalysisMutation.isPending ? 'Uploading...' : 'Upload Analysis'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Tweet Modal */}
        {showTweetModal && selectedIdea && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Create Tweet for Content Idea #{selectedIdea.id}
                </h3>
                <button
                  onClick={() => {
                    setShowTweetModal(false);
                    setTweetText('');
                    setPatternUsed('');
                    setReasoning('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Content
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedIdea.raw_content}</p>
                </div>
              </div>

              <div className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why It Works (Reasoning)
                  </label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Explain why this tweet will work..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowTweetModal(false);
                    setTweetText('');
                    setPatternUsed('');
                    setReasoning('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTweet}
                  disabled={createTweetMutation.isPending || !tweetText.trim()}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50"
                >
                  {createTweetMutation.isPending ? 'Creating...' : 'Create Tweet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

