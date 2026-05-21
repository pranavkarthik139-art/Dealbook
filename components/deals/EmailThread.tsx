'use client';

import { useEffect, useState } from 'react';
import { formatEmailDate, extractEmailAddress } from '@/lib/email-utils';

interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  isIncoming: boolean;
}

interface EmailThreadProps {
  dealId: number;
  prospectEmail?: string;
}

export function EmailThread({ dealId, prospectEmail }: EmailThreadProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        const response = await fetch(`/api/deals/${dealId}/emails`);
        const data = await response.json();

        if (data.emails) {
          // Convert date strings to Date objects
          const parsedEmails = data.emails.map((e: any) => ({
            ...e,
            date: new Date(e.date),
          }));
          setEmails(parsedEmails);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();
  }, [dealId]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading emails...</div>;
  }

  if (emails.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">
          {prospectEmail ? `No emails yet with ${prospectEmail}` : 'No emails found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Email Thread ({emails.length})</h3>

      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
          >
            {/* Email Header */}
            <button
              onClick={() =>
                setExpandedEmailId(
                  expandedEmailId === email.id ? null : email.id
                )
              }
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-start gap-3 cursor-pointer"
            >
              {/* Direction Indicator */}
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  email.isIncoming ? 'bg-blue-500' : 'bg-green-500'
                }`}
              />

              {/* Email Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {email.subject}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      From: {extractEmailAddress(email.from)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatEmailDate(email.date)}
                  </span>
                </div>
                {!expandedEmailId && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                    {email.snippet}
                  </p>
                )}
              </div>

              {/* Expand/Collapse Arrow */}
              <div className="flex-shrink-0">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedEmailId === email.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </button>

            {/* Email Body (Expanded) */}
            {expandedEmailId === email.id && (
              <div className="border-t border-gray-200 p-4 bg-white">
                {/* Email Metadata */}
                <div className="mb-4 pb-4 border-b border-gray-100 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">From:</span> {email.from}
                  </p>
                  <p>
                    <span className="font-medium">To:</span> {email.to.join(', ')}
                  </p>
                  {email.cc && email.cc.length > 0 && (
                    <p>
                      <span className="font-medium">Cc:</span> {email.cc.join(', ')}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {email.date.toLocaleString()}
                  </p>
                </div>

                {/* Email Body */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 font-mono max-h-96 overflow-y-auto">
                    {email.body}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Reply
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                    Forward
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-700 font-medium ml-auto">
                    View in Gmail
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
