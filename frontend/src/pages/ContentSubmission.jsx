import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { contentAPI } from '@/lib/api';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';

export default function ContentSubmission() {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const submitMutation = useMutation({
    mutationFn: (raw_content) => contentAPI.submitContent(raw_content),
    onSuccess: (response) => {
      toast.success('Content submitted! We\'ll generate tweets based on your patterns.');
      navigate(`/content/${response.data.id}/tweets`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to submit content');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim().length >= 50) {
      submitMutation.mutate(content);
    }
  };

  const charCount = content.length;
  const minChars = 50;
  const maxChars = 10000;
  const canSubmit = charCount >= minChars && charCount <= maxChars;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Content Ideas</h1>
          <p className="text-gray-600">
            Paste your content ideas, blog posts, or thoughts. We'll transform them into engaging tweets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Your Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
              placeholder="Paste your content ideas, blog post snippets, or a brain dump of topics here...&#10;&#10;The more context you provide, the better we can craft relevant tweets that use your analyzed patterns."
            />
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                💡 Tip: Be as detailed as possible. Include key points, takeaways, or specific angles you want to cover.
              </p>
              <span className={`text-sm font-medium ${
                charCount < minChars ? 'text-gray-400' :
                charCount > maxChars ? 'text-red-600' :
                'text-green-600'
              }`}>
                {charCount} / {maxChars}
              </span>
            </div>

            {charCount > 0 && charCount < minChars && (
              <p className="mt-2 text-xs text-amber-600">
                Please add at least {minChars - charCount} more characters
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span><strong>2-10 ready-to-post tweets</strong> crafted from your content</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Each tweet applies a specific pattern from your niche analysis</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span><strong>"Why it Works"</strong> explanations for each tweet</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Ability to request tweaks or regenerations</span>
              </li>
            </ul>
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
                <span>Submit Content</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}


