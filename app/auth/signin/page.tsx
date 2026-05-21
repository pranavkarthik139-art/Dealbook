'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const result = await signIn('credentials', {
      email: 'demo@dealbook.com',
      password: 'demo123',
      redirect: false,
    });
    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError('Demo login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          {/* Logo / Branding */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dealbook</h1>
            <p className="text-slate-600 text-sm">
              AI-powered presales deal intelligence
            </p>
          </div>

          {/* Tagline */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Sign In
            </h2>
            <p className="text-slate-600 text-sm">
              Manage your deals and track prospect interactions
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or try demo</span>
            </div>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Try Demo Account'}
          </button>

          {/* Footer */}
          <p className="text-xs text-slate-500 text-center">
            By signing in, you agree to our{' '}
            <a href="#" className="text-slate-700 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-slate-700 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur">
          <p className="text-xs text-slate-300 text-center">
            <strong>Demo Account:</strong>
            <br />
            Email: demo@dealbook.com
            <br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
}
