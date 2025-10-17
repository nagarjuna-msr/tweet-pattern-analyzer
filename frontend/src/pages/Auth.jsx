import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, Zap, Target, FileText, TrendingUp, Info, X } from 'lucide-react';

// Step component for the 4-step process
function Step({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80">{children}</p>
      </div>
    </div>
  );
}

// Native modal component (no external dependencies)
function WhyThisWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 text-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Why Replies Matter More Than Likes</h2>
            <p className="text-sm text-gray-400 mt-1">Based on analysis of 75,000+ viral tweets</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-300">
          <p className="text-base leading-relaxed">
            Twitter's algorithm keeps evolving—especially in the era of AI-generated content. They're actively filtering bots and boosting authentic voices. Here's what matters now:
          </p>

          {/* The Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center border-l-4 border-orange-500 pl-3">
              The Numbers
            </h3>
            <ul className="space-y-2 ml-6 text-sm">
              <li>• A reply where you engage back = <strong className="text-white">75x weight</strong></li>
              <li>• A like = <strong className="text-white">0.5x weight</strong></li>
              <li>• That's a <strong className="text-white">150:1 difference</strong></li>
            </ul>
            <p className="text-sm italic bg-gray-800/50 p-3 rounded border-l-4 border-primary">
              Most people optimize for likes. That's the wrong metric.
            </p>
          </div>

          {/* What We Analyze */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center border-l-4 border-orange-500 pl-3">
              What We Analyze
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Domain-specific viral patterns</p>
                  <p className="text-sm text-gray-400">What works in your niche isn't generic—word choice, topics, and tone matter</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Target audience dynamics</p>
                  <p className="text-sm text-gray-400">Different audiences respond to different structures and hooks</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Competitor tweet structures</p>
                  <p className="text-sm text-gray-400">We analyze what's actually working for successful accounts in your space</p>
                </div>
              </li>
            </ul>
          </div>

          {/* The Analysis System */}
          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-5 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center border-l-4 border-orange-500 pl-3">
              Our Analysis System
            </h3>
            <p className="text-sm leading-relaxed">
              We have a robust analysis system trained on 75,000+ viral tweets. It identifies patterns specific to your niche and target audience.
            </p>
            <p className="text-sm leading-relaxed">
              Right now, we're running the system manually for this MVP to ensure quality. We're starting with <strong className="text-white">5 spots</strong> to optimize the process before scaling.
            </p>
            <p className="text-sm leading-relaxed font-medium text-white">
              Why the right profiles matter: Domain-specific nuances, word choice, and audience behavior patterns are critical. Generic patterns don't work—you need patterns from accounts that resonate with your specific audience.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => authAPI.login(email, password),
    onSuccess: async (response) => {
      setToken(response.data.access_token);
      
      // Check if user is admin
      const userResponse = await authAPI.getMe();
      const user = userResponse.data;
      
      if (user.is_admin) {
        toast.success('Welcome, Admin!');
        navigate('/admin');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => authAPI.register(email, password),
    onSuccess: (response) => {
      setToken(response.data.access_token);
      toast.success('Account created successfully!');
      navigate('/onboarding');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Validate password for registration
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        toast.error('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        toast.error('Password must contain at least one number');
        return;
      }
    }
    
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Value Proposition (shown on both mobile and desktop) */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3 leading-tight">
            See What's Working.<br />
            Do More of It.
          </h1>
          <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg">
            Patterns from 75,000+ viral tweets. Applied to your authentic voice.
          </p>
          
          {/* Steps - Collapsible on mobile */}
          <div className="space-y-4 md:space-y-6">
            <Step icon={Target} title="Submit 5-10 Profiles That Work">
              Give us Twitter accounts in your niche that get good engagement. We'll deeply analyse their high engagement tweets and find why their tweets work.
            </Step>
            <Step icon={Zap} title="Get the Analysis Report">
              See which hooks get replies, thread structures that go viral—patterns that work and don't work in your niche.
            </Step>
            <Step icon={FileText} title="Turn Your Ideas Into Viral Tweets">
              Share what you want to say. We'll structure it using patterns that work, with your authentic voice.
            </Step>
            <Step icon={TrendingUp} title="Post and Track Results">
              The patterns work because they're based on what already gets replies. More replies = more reach.
            </Step>
          </div>
          
          {/* Modal trigger button - Dark theme with orange accent */}
          <button 
            onClick={() => setShowModal(true)}
            className="w-full text-left mt-6 md:mt-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 p-4 md:p-5 rounded-xl transition-all duration-300 group shadow-lg shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 border-2 border-orange-400"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-base md:text-lg">Why Replies Matter More Than Likes</h4>
                <p className="text-sm text-white/90 mt-0.5">The algorithm keeps changing. Here's what matters now.</p>
              </div>
              <span className="text-sm text-white/90 group-hover:text-white font-medium transition-colors">
                Read more →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for both mobile and desktop */}
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">Pattern Analyzer</h1>
            <p className="text-sm text-gray-600 mt-1">Content based on what works</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Min 8 characters, 1 uppercase, 1 number
                </p>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                <>{isLogin ? 'Login' : 'Create Account'}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-primary hover:text-primary-hover font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:text-primary-hover font-medium">
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <WhyThisWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}


