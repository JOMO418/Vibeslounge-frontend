import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'manager') {
        navigate('/manager', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Loading toast
    const loadingToast = toast.loading('Authenticating...');

    try {
      const result = await login(email, password);

      toast.dismiss(loadingToast);

      if (result.success) {
        // Success toast with custom styling
        toast.success(
          `Welcome back, ${result.user.email}!`,
          {
            icon: '👋',
            style: {
              background: 'hsl(0 0% 10%)',
              color: 'hsl(0 0% 98%)',
              border: '1px solid hsl(45 93% 47%)',
            },
            duration: 3000,
          }
        );

        // Small delay for smooth transition
        setTimeout(() => {
          if (result.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (result.user.role === 'manager') {
            navigate('/manager', { replace: true });
          }
        }, 500);
      } else {
        toast.error(result.message || 'Invalid credentials', {
          style: {
            background: 'hsl(0 0% 10%)',
            color: 'hsl(0 84% 60%)',
            border: '1px solid hsl(0 84% 60%)',
          },
        });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        toast.error('Invalid email or password', {
          style: {
            background: 'hsl(0 0% 10%)',
            color: 'hsl(0 84% 60%)',
            border: '1px solid hsl(0 84% 60%)',
          },
        });
      } else if (err.response?.status === 429) {
        toast.error('Too many attempts. Please try again later', {
          duration: 5000,
        });
      } else if (!err.response) {
        toast.error('Network error. Please check your connection', {
          duration: 4000,
        });
      } else {
        toast.error('Login failed. Please try again', {
          style: {
            background: 'hsl(0 0% 10%)',
            color: 'hsl(0 84% 60%)',
            border: '1px solid hsl(0 84% 60%)',
          },
        });
      }
      
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 transition-opacity duration-500"
      style={{ 
        backgroundColor: 'hsl(0 0% 4%)',
        opacity: mounted ? 1 : 0 
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'hsl(45 93% 47%)' }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'hsl(45 93% 47%)' }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back to Home Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all hover:gap-3"
          style={{ 
            color: 'hsl(0 0% 70%)',
            backgroundColor: 'hsl(0 0% 10%)',
            border: '1px solid hsl(0 0% 17%)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(0 0% 15%)';
            e.currentTarget.style.color = 'hsl(45 93% 47%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(0 0% 10%)';
            e.currentTarget.style.color = 'hsl(0 0% 70%)';
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'hsl(45 93% 47% / 0.1)', border: '2px solid hsl(45 93% 47%)' }}>
            <Lock className="h-8 w-8" style={{ color: 'hsl(45 93% 47%)' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(0 0% 98%)' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'hsl(0 0% 54%)' }}>Sign in to access your dashboard</p>
        </div>

        {/* Login Form Card */}
        <div 
          className="p-8 rounded-xl shadow-2xl transition-all duration-300"
          style={{ 
            backgroundColor: 'hsl(0 0% 10%)', 
            border: '1px solid hsl(0 0% 17%)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: 'hsl(0 0% 54%)' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-sm transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 6%)', 
                    border: '1px solid hsl(0 0% 17%)', 
                    color: 'hsl(0 0% 98%)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'hsl(45 93% 47%)'}
                  onBlur={(e) => e.target.style.borderColor = 'hsl(0 0% 17%)'}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: 'hsl(0 0% 54%)' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-lg text-sm transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 6%)', 
                    border: '1px solid hsl(0 0% 17%)', 
                    color: 'hsl(0 0% 98%)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'hsl(45 93% 47%)'}
                  onBlur={(e) => e.target.style.borderColor = 'hsl(0 0% 17%)'}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: 'hsl(0 0% 54%)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(45 93% 47%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(0 0% 54%)'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              style={{ 
                backgroundColor: loading ? 'hsl(0 0% 20%)' : 'hsl(45 93% 47%)', 
                color: 'hsl(0 0% 0%)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'hsl(45 93% 42%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'hsl(45 93% 47%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid hsl(0 0% 17%)' }}>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
              <Lock className="h-4 w-4" />
              <span>Secure staff portal access</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
          <p>
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;