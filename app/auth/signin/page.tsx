'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', {
        redirect: true,
        callbackUrl: '/deals'
      });
    } catch (error) {
      console.error('Sign in error:', error);
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
              Welcome Back
            </h2>
            <p className="text-slate-600 text-sm">
              Sign in to manage your deals and track prospect interactions
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or continue with email</span>
            </div>
          </div>

          {/* Email Sign In (Future) */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <button
              className="w-full px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-medium text-sm"
              disabled
            >
              Sign in with Email (Coming Soon)
            </button>
          </div>

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
            <strong>Demo Account:</strong> Sign in with any Google account.
            <br />
            First-time users get admin access automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
