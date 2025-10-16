import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analysisAPI, submissionsAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { Download, FileText, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function AnalysisResults() {
  const { submissionId } = useParams();

  const { data: submission } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      const response = await submissionsAPI.getSubmission(submissionId);
      return response.data;
    },
  });

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis', submissionId],
    queryFn: async () => {
      const response = await analysisAPI.getAnalysis(submissionId);
      return response.data;
    },
    enabled: !!submissionId,
    retry: 1,
  });

  const handleDownload = () => {
    if (analysis?.document_url) {
      window.open(analysis.document_url, '_blank');
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

  if (error || !analysis) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">
            {error ? 'Analysis not yet available' : 'Analysis not found'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your analysis is being processed. Check back in a few hours!
          </p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-primary hover:text-primary-hover font-medium"
          >
            <span>← Back to Dashboard</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pattern Analysis Results</h1>
              <p className="text-gray-600">
                Completed {new Date(analysis.completed_at).toLocaleDateString()}
              </p>
            </div>
            {analysis.document_url && (
              <button
                onClick={handleDownload}
                className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Download size={18} />
                <span>Download Full Analysis</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Patterns Grid */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-gray-900">Key Patterns</h2>
          </div>

          {analysis.key_patterns && analysis.key_patterns.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.key_patterns.map((pattern, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pattern.name}</h3>
                <p className="text-gray-600 mb-4">{pattern.explanation}</p>
                
                {pattern.example && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">EXAMPLE:</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{pattern.example}</p>
                    
                    {/* Mock engagement metrics */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span>💙 2.4K</span>
                      <span>🔄 340</span>
                      <span>💬 89</span>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No patterns available in this analysis yet</p>
            </div>
          )}
        </div>

        {/* Submitted Profiles */}
        {submission && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Analyzed Profiles</h3>
            <div className="flex flex-wrap gap-2">
              {submission.profile_urls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  @{url.split('/').pop()}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


