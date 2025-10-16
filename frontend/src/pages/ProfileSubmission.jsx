import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { submissionsAPI } from '@/lib/api';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Loader2, Check, X } from 'lucide-react';

export default function ProfileSubmission() {
  const [urls, setUrls] = useState('');
  const navigate = useNavigate();

  const submitMutation = useMutation({
    mutationFn: (profile_urls) => submissionsAPI.submitProfiles(profile_urls),
    onSuccess: () => {
      toast.success('Profiles submitted! We\'ll notify you when analysis is ready.');
      navigate('/dashboard');
    },
    onError: (error) => {
      const message = error.response?.data?.detail;
      if (typeof message === 'string') {
        toast.error(message);
      } else if (Array.isArray(message)) {
        toast.error(message[0]?.msg || 'Submission failed');
      } else {
        toast.error('Failed to submit profiles');
      }
    },
  });

  const parseUrls = (text) => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const validateUrl = (url) => {
    return url.includes('twitter.com') || url.includes('x.com');
  };

  const urlList = parseUrls(urls);
  const validUrls = urlList.filter(validateUrl);
  const invalidUrls = urlList.filter((url) => !validateUrl(url));

  const canSubmit = validUrls.length >= 5 && validUrls.length <= 10 && invalidUrls.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      submitMutation.mutate(validUrls);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Profiles for Analysis</h1>
          <p className="text-gray-600">
            Paste 5-10 Twitter profile URLs from your niche that you admire or see as successful.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Profile URLs (one per line)
            </label>
            <textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none font-mono text-sm"
              placeholder="https://twitter.com/username1&#10;https://x.com/username2&#10;https://twitter.com/username3&#10;..."
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Tip: The more relevant the profiles are to your goals, the better the analysis will be.
            </p>

            {/* URL Validation Feedback */}
            {urlList.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Validation:</span>
                  <span className={`font-medium ${
                    validUrls.length >= 5 && validUrls.length <= 10 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {validUrls.length} / 5-10 valid URLs
                  </span>
                </div>

                {validUrls.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-900 mb-1">Valid URLs ({validUrls.length}):</p>
                        <div className="space-y-1">
                          {validUrls.map((url, idx) => (
                            <p key={idx} className="text-xs text-green-700 truncate">{url}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {invalidUrls.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <X className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-red-900 mb-1">Invalid URLs ({invalidUrls.length}):</p>
                        <div className="space-y-1">
                          {invalidUrls.map((url, idx) => (
                            <p key={idx} className="text-xs text-red-700 truncate">{url}</p>
                          ))}
                        </div>
                        <p className="text-xs text-red-600 mt-2">URLs must contain 'twitter.com' or 'x.com'</p>
                      </div>
                    </div>
                  </div>
                )}

                {validUrls.length < 5 && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Please add at least {5 - validUrls.length} more valid URL(s)
                  </p>
                )}

                {validUrls.length > 10 && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Please remove {validUrls.length - 10} URL(s) (maximum is 10)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start space-x-2">
                <span className="font-bold">1.</span>
                <span>We'll analyze the content patterns from these profiles</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">2.</span>
                <span>You'll receive pattern analysis within <strong>8 business hours</strong></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold">3.</span>
                <span>You can then submit your content ideas to generate tweets based on these patterns</span>
              </li>
            </ol>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit for Analysis</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


