'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    'OAuthSignin': 'Error connecting to the OAuth provider.',
    'OAuthCallback': 'Error in the OAuth callback.',
    'OAuthCreateAccount': 'Could not create OAuth account.',
    'EmailCreateAccount': 'Could not create email account.',
    'Callback': 'Error in callback handler route.',
    'OAuthAccountNotLinked': 'Email on account is already linked to another provider.',
    'EmailSignInError': 'Check your email address.',
    'CredentialsSignin': 'Sign in failed. Check the details you provided.',
    'default': 'An error occurred during sign in.',
    'AccessDenied': 'You do not have permission to sign in.',
  };

  const message = error && errorMessages[error] ? errorMessages[error] : errorMessages['default'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dealbook</h1>
            <p className="text-slate-600 text-sm">
              AI-powered presales deal intelligence
            </p>
          </div>

          {/* Error Content */}
          <div className="text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold text-slate-900">
              Sign In Error
            </h2>
            <p className="text-slate-600">
              {message}
            </p>
            {error && (
              <p className="text-xs text-slate-500 font-mono">
                Error: {error}
              </p>
            )}
          </div>

          {/* Back to Sign In */}
          <Link
            href="/auth/signin"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all text-center block"
          >
            Back to Sign In
          </Link>

          {/* Back to Home */}
          <Link
            href="/"
            className="w-full px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-50 transition-all text-center block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
