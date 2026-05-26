/**
 * Google Meet Integration - Fetch transcripts and generate insights with Claude AI
 * Alternative to Gong: Self-hosted transcript analysis using Claude LLM
 */

import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface MeetingTranscript {
  meetingId: string;
  title: string;
  date: Date;
  duration: number; // minutes
  participants: string[];
  transcript: string;
  recordingUrl?: string;
}

interface CallInsight {
  summary: string; // 2-3 sentence summary of the call
  sentiment: number; // 0-100 sentiment score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyTopics: string[]; // Main topics discussed
  actionItems: string[]; // Action items from the call
  concerns: string[]; // Any concerns or blockers mentioned
  opportunities: string[]; // Upsell or expansion opportunities
}

/**
 * Fetch Google Meet transcript from Google Drive
 * Requires OAuth access to Google Drive and recording transcript file
 */
export async function fetchMeetingTranscript(
  accessToken: string,
  recordingId: string
): Promise<MeetingTranscript | null> {
  try {
    const drive = google.drive({ version: 'v3', auth: accessToken });

    // Find transcript file associated with the recording
    // Google Meet creates a folder with the meeting ID, containing the transcript
    const response = await drive.files.list({
      q: `name contains "${recordingId}" and mimeType = "application/vnd.google-apps.document"`,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id, name, createdTime, webViewLink)',
    });

    if (!response.data.files || response.data.files.length === 0) {
      console.warn(`[Google Meet] No transcript found for recording ${recordingId}`);
      return null;
    }

    const transcriptFile = response.data.files[0];

    // Fetch the transcript content
    const content = await drive.files.export({
      fileId: transcriptFile.id!,
      mimeType: 'text/plain',
    });

    return {
      meetingId: recordingId,
      title: transcriptFile.name || 'Meeting',
      date: new Date(transcriptFile.createdTime || new Date()),
      duration: 0, // Could be extracted from filename
      participants: [],
      transcript: content.data as string,
      recordingUrl: transcriptFile.webViewLink || undefined,
    };
  } catch (error) {
    console.error('[Google Meet] Error fetching transcript:', error);
    return null;
  }
}

/**
 * Generate insights from meeting transcript using Claude AI
 * Analyzes sentiment, identifies risks, extracts action items, etc.
 */
export async function generateCallInsights(transcript: MeetingTranscript): Promise<CallInsight> {
  try {
    const prompt = `
You are a presales call analyst. Analyze the following meeting transcript and provide structured insights.

TRANSCRIPT:
${transcript.transcript}

Provide your analysis in JSON format with these fields:
{
  "summary": "2-3 sentence summary of the call in presales context",
  "sentiment": <0-100 number indicating overall positivity/enthusiasm>,
  "riskLevel": "low|medium|high|critical",
  "keyTopics": ["topic1", "topic2"],
  "actionItems": ["action1", "action2"],
  "concerns": ["concern1", "concern2"],
  "opportunities": ["opportunity1", "opportunity2"]
}

Guidelines:
- Summary: Focus on deal relevance (decision-making progress, objections, next steps)
- Sentiment: 0=very negative, 50=neutral, 100=very positive. High sentiment = stakeholder enthusiasm
- Risk Level: critical=deal at risk, high=concerning signs, medium=minor issues, low=healthy call
- Key Topics: Extract main discussion areas (e.g., "pricing concerns", "timeline questions", "technical feasibility")
- Action Items: Next steps explicitly mentioned (e.g., "send proposal by Friday")
- Concerns: Objections, risks, or blockers raised
- Opportunities: Upsell, expansion, or next-stage opportunities mentioned

Return ONLY valid JSON, no other text.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const insights = JSON.parse(content.text) as CallInsight;

    // Validate sentiment is in range
    insights.sentiment = Math.max(0, Math.min(100, insights.sentiment));

    return insights;
  } catch (error) {
    console.error('[Google Meet] Error generating insights:', error);

    // Return default insights if Claude fails
    return {
      summary: 'Unable to generate summary. Transcript analysis failed.',
      sentiment: 50,
      riskLevel: 'medium',
      keyTopics: [],
      actionItems: [],
      concerns: ['Transcript analysis error'],
      opportunities: [],
    };
  }
}

/**
 * Get color for sentiment score (for UI display)
 */
export function getSentimentColor(sentiment: number): string {
  if (sentiment >= 80) return '#10B981'; // Green - very positive
  if (sentiment >= 60) return '#3B82F6'; // Blue - positive
  if (sentiment >= 40) return '#F59E0B'; // Amber - neutral/mixed
  return '#EF4444'; // Red - negative
}

/**
 * Get color for risk level
 */
export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical':
      return '#DC2626'; // Red
    case 'high':
      return '#EF4444'; // Light red
    case 'medium':
      return '#F59E0B'; // Amber
    case 'low':
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Mock transcript for testing (when Google Meet API not available)
 */
export function generateMockTranscript(): MeetingTranscript {
  return {
    meetingId: 'mock-' + Date.now().toString(),
    title: 'Acme Corp - Product Demo',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 45,
    participants: ['sarah@acmecorp.com', 'john@acmecorp.com'],
    transcript: `
[00:00] Sarah: Hi team, thanks for joining. We're excited to see the product demo today.
[00:30] John: Great! We've prepared a comprehensive walkthrough focusing on your integration requirements.
[01:00] Sarah: Perfect. One of our main concerns is how it integrates with our existing Kubernetes infrastructure.
[02:00] John: That's a critical point. We have native K8s support with Helm charts. Let me show you...
[05:00] Sarah: This looks really promising. How does the API scaling work under load?
[06:00] John: We auto-scale based on request volume. We've tested up to 10k requests per second without degradation.
[08:00] Sarah: Excellent. What about pricing? We need to understand the cost per environment.
[09:00] John: We have flexible pricing: per-environment or usage-based. Happy to discuss based on your scale.
[10:00] Sarah: That works. We'd need to validate this with our finance team before moving forward.
[11:00] John: Absolutely. We can prepare a detailed proposal with pricing scenarios.
[12:00] Sarah: One concern - how long is the implementation timeline? We need to go live by Q3.
[13:00] John: With your current setup, we estimate 8-12 weeks. We can accelerate with additional resources.
[14:00] Sarah: That's tight but potentially doable. We'd need to see a detailed project plan.
[15:00] John: I'll send you our standard implementation timeline and can customize it based on your needs.
[16:00] Sarah: Great. Mike from our team should join the next call to discuss the technical handoff.
[17:00] John: Perfect. I'll send calendar invites for the next meeting. Would next week work?
[18:00] Sarah: Yes, next Wednesday afternoon works for us. Send the invites and proposal details.
[19:00] John: Will do. Thanks for the great discussion. Looking forward to moving forward!
[20:00] Sarah: Thank you! Talk soon.
    `,
  };
}
