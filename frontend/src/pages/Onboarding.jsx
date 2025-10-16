import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const [niche, setNiche] = useState('');
  const [goals, setGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const navigate = useNavigate();

  const onboardingMutation = useMutation({
    mutationFn: (data) => authAPI.updateOnboarding(data),
    onSuccess: () => {
      toast.success('Profile complete! Let\'s get started.');
      navigate('/dashboard'); // Go to user dashboard after onboarding
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to save onboarding data');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation.mutate({
      niche,
      goals,
      experience_level: experienceLevel,
    });
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Let's personalize your experience</h1>
          <p className="text-gray-600">
            This helps us provide better analysis and recommendations for your specific needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Niche */}
          <div>
            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
              What's your niche or industry? *
            </label>
            <input
              type="text"
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="e.g., SaaS, Fitness, Marketing, Design..."
            />
            <p className="mt-1 text-xs text-gray-500">
              This helps us analyze relevant profiles in your space
            </p>
          </div>

          {/* Goals */}
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
              What's your main goal on Twitter? *
            </label>
            <select
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
            >
              <option value="">Select a goal...</option>
              <option value="grow_following">Grow my following</option>
              <option value="drive_sales">Drive sales & conversions</option>
              <option value="build_authority">Build authority & thought leadership</option>
              <option value="networking">Networking & partnerships</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Your Twitter experience level? *
            </label>
            <select
              id="experience"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
            >
              <option value="">Select experience level...</option>
              <option value="beginner">Beginner (just starting)</option>
              <option value="intermediate">Intermediate (posting regularly)</option>
              <option value="advanced">Advanced (experienced content creator)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={onboardingMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {onboardingMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


