import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Upload, Plus, X } from 'lucide-react';

export default function AdminSubmissions() {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [keyPatterns, setKeyPatterns] = useState([{ name: '', explanation: '', example: '' }]);
  const queryClient = useQueryClient();

  // Fetch all submissions (admin can see all)
  const { data: allSubmissions, isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      // We'll need to create this endpoint
      const response = await fetch('http://localhost:8000/api/admin/submissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
    refetchInterval: 30000,
  });

  const uploadAnalysisMutation = useMutation({
    mutationFn: async (data) => {
      // First upload document if provided
      let documentUrl = null;
      if (documentFile) {
        const uploadResponse = await adminAPI.uploadDocument(data.submission_id, documentFile);
        documentUrl = uploadResponse.data.document_url;
      }

      // Then create analysis
      return adminAPI.createAnalysis({
        submission_id: data.submission_id,
        key_patterns: keyPatterns.filter(p => p.name && p.explanation),
        document_url: documentUrl,
        document_type: documentFile ? documentFile.name.split('.').pop() : null
      });
    },
    onSuccess: () => {
      toast.success('Analysis uploaded successfully!');
      setShowAnalysisModal(false);
      setSelectedSubmission(null);
      setDocumentFile(null);
      setKeyPatterns([{ name: '', explanation: '', example: '' }]);
      queryClient.invalidateQueries(['admin-submissions']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to upload analysis');
    },
  });

  const addPattern = () => {
    setKeyPatterns([...keyPatterns, { name: '', explanation: '', example: '' }]);
  };

  const removePattern = (index) => {
    setKeyPatterns(keyPatterns.filter((_, i) => i !== index));
  };

  const updatePattern = (index, field, value) => {
    const updated = [...keyPatterns];
    updated[index][field] = value;
    setKeyPatterns(updated);
  };

  const handleSubmitAnalysis = () => {
    if (!selectedSubmission) return;
    uploadAnalysisMutation.mutate({ submission_id: selectedSubmission.id });
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

  const pendingSubmissions = allSubmissions?.filter(s => s.status === 'pending') || [];
  const completedSubmissions = allSubmissions?.filter(s => s.status === 'completed') || [];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Submissions</h1>
          <p className="text-gray-600 mt-1">Process user profile submissions and upload analysis</p>
        </div>

        {/* Pending Submissions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Submissions ({pendingSubmissions.length})
          </h2>
          
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                        <span className="text-sm text-gray-500">
                          Submission #{submission.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        User: {submission.user_id} | Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expected delivery: {new Date(submission.expected_delivery_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowAnalysisModal(true);
                      }}
                      className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Upload size={18} />
                      <span>Upload Analysis</span>
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Profile URLs ({submission.profile_urls.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {submission.profile_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100"
                        >
                          {url.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Submissions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Completed Submissions ({completedSubmissions.length})
          </h2>
          
          {completedSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-sm">No completed submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSubmissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Completed
                    </span>
                    <span className="text-sm text-gray-500">Submission #{submission.id}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Completed: {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Upload Modal */}
      {showAnalysisModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Upload Analysis for Submission #{selectedSubmission.id}
              </h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Key Patterns */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Key Patterns (3-5 recommended)
                  </label>
                  <button
                    onClick={addPattern}
                    className="text-primary hover:text-primary-hover text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Add Pattern</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {keyPatterns.map((pattern, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      {keyPatterns.length > 1 && (
                        <button
                          onClick={() => removePattern(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      )}
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Pattern Name (e.g., Question-Tension-Promise)"
                          value={pattern.name}
                          onChange={(e) => updatePattern(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <textarea
                          placeholder="Explanation (2-3 sentences)"
                          value={pattern.explanation}
                          onChange={(e) => updatePattern(index, 'explanation', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                        <textarea
                          placeholder="Example tweet"
                          value={pattern.example}
                          onChange={(e) => updatePattern(index, 'example', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Analysis Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".md,.pdf,.txt"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-600">
                      {documentFile ? documentFile.name : 'Click to upload MD, PDF, or TXT'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAnalysis}
                disabled={uploadAnalysisMutation.isPending || keyPatterns.every(p => !p.name)}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadAnalysisMutation.isPending ? 'Uploading...' : 'Upload Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

