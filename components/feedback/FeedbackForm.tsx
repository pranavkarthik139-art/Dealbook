'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';

const FEATURES = [
  'Deal Kanban Pipeline',
  'Contact Management',
  'Activity Timeline',
  'Calendar Integration',
  'Deal Health Scoring',
  'Timezone Selector',
  'Theme Switcher',
  'Command Bar (Cmd+K)',
  'Dashboard Overview',
  'Email Auto-logging',
];

const MISSING_FEATURES = [
  'Team Collaboration',
  'Real-time Notifications',
  'Advanced Reporting',
  'Mobile App',
  'API Integration',
  'Bulk Operations',
  'Custom Fields',
  'Workflow Automation',
  'AI-powered Insights',
  'Salesforce Sync',
];

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    respondentName: '',
    respondentEmail: '',
    respondentRole: '',
    overallRating: '',
    likelyRecommend: '',
    likedFeatures: [] as string[],
    likedReasons: '',
    missingFeatures: [] as string[],
    featureRequests: '',
    painPoints: '',
    easeOfUse: '',
    designFeedback: '',
    comparingTo: '',
    advantages: '',
    disadvantages: '',
    additionalSuggestions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      setFormData({
        respondentName: '',
        respondentEmail: '',
        respondentRole: '',
        overallRating: '',
        likelyRecommend: '',
        likedFeatures: [],
        likedReasons: '',
        missingFeatures: [],
        featureRequests: '',
        painPoints: '',
        easeOfUse: '',
        designFeedback: '',
        comparingTo: '',
        advantages: '',
        disadvantages: '',
        additionalSuggestions: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (feature: string, type: 'liked' | 'missing') => {
    if (type === 'liked') {
      setFormData((prev) => ({
        ...prev,
        likedFeatures: prev.likedFeatures.includes(feature)
          ? prev.likedFeatures.filter((f) => f !== feature)
          : [...prev.likedFeatures, feature],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        missingFeatures: prev.missingFeatures.includes(feature)
          ? prev.missingFeatures.filter((f) => f !== feature)
          : [...prev.missingFeatures, feature],
      }));
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-10)' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            margin: '0 0 16px 0',
            color: 'var(--theme-text-primary)',
          }}
        >
          📋 Dealbook Product Feedback
        </h1>
        <p style={{ color: 'var(--theme-text-tertiary)', margin: '0', fontSize: '14px' }}>
          Help us improve! Share your thoughts on what you liked, what's missing, and what we should focus on.
        </p>
      </div>

      {submitted && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #10B981',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#047857',
            fontSize: '14px',
          }}
        >
          ✅ Thank you for your feedback! Your response has been recorded.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#B91C1C',
            fontSize: '14px',
          }}
        >
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Respondent Info */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            👤 Your Information
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <input
              type="text"
              placeholder="Your name"
              value={formData.respondentName}
              onChange={(e) => setFormData((prev) => ({ ...prev, respondentName: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <input
              type="email"
              placeholder="Your email"
              value={formData.respondentEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, respondentEmail: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <select
              value={formData.respondentRole}
              onChange={(e) => setFormData((prev) => ({ ...prev, respondentRole: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <option value="">Select your role...</option>
              <option value="sales_engineer">Sales Engineer</option>
              <option value="presales_lead">Presales Lead / Manager</option>
              <option value="admin">Admin</option>
              <option value="other">Other</option>
            </select>
          </div>
        </Card>

        {/* Overall Impression */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            ⭐ Overall Impression
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                How would you rate Dealbook overall? (1-5)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, overallRating: rating.toString() }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      border: formData.overallRating === rating.toString() ? '2px solid #0047FF' : '1px solid rgba(0, 0, 0, 0.08)',
                      backgroundColor: formData.overallRating === rating.toString() ? '#0047FF20' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 600,
                      transition: 'all 120ms ease',
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                How likely are you to recommend Dealbook? (0-10, 10 = very likely)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.likelyRecommend}
                onChange={(e) => setFormData((prev) => ({ ...prev, likelyRecommend: e.target.value }))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--theme-text-tertiary)', marginTop: '8px' }}>
                {formData.likelyRecommend ? `${formData.likelyRecommend}/10` : 'Select a score'}
              </div>
            </div>
          </div>
        </Card>

        {/* What They Liked */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            👍 What Did You Like?
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
              Select features you liked (check all that apply):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {FEATURES.map((feature) => (
                <label key={feature} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.likedFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature, 'liked')}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px' }}>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Why did you like these features? Any specific use cases?"
            value={formData.likedReasons}
            onChange={(e) => setFormData((prev) => ({ ...prev, likedReasons: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
        </Card>

        {/* Ease of Use */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            🎨 Usability & Design
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
              How easy is it to use Dealbook? (1-5, 5 = very easy)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, easeOfUse: score.toString() }))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    border: formData.easeOfUse === score.toString() ? '2px solid #0047FF' : '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: formData.easeOfUse === score.toString() ? '#0047FF20' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    transition: 'all 120ms ease',
                  }}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Any feedback on the design, layout, or user experience? What could be improved?"
            value={formData.designFeedback}
            onChange={(e) => setFormData((prev) => ({ ...prev, designFeedback: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
        </Card>

        {/* What's Missing */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            💭 What's Missing?
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
              Features you'd like to see (check all that apply):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {MISSING_FEATURES.map((feature) => (
                <label key={feature} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.missingFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature, 'missing')}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px' }}>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Describe other features or improvements you'd like to see..."
            value={formData.featureRequests}
            onChange={(e) => setFormData((prev) => ({ ...prev, featureRequests: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
        </Card>

        {/* Pain Points */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            ⚠️ Pain Points
          </h2>
          <textarea
            placeholder="What are the biggest challenges or pain points you experienced while using Dealbook?"
            value={formData.painPoints}
            onChange={(e) => setFormData((prev) => ({ ...prev, painPoints: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
        </Card>

        {/* Comparison */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            🏆 How Does It Compare?
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
              Are you comparing this to another tool? If yes, which one?
            </label>
            <input
              type="text"
              placeholder="e.g., Salesforce, HubSpot, Pipedrive, etc."
              value={formData.comparingTo}
              onChange={(e) => setFormData((prev) => ({ ...prev, comparingTo: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <textarea
              placeholder="What advantages does Dealbook have over other tools?"
              value={formData.advantages}
              onChange={(e) => setFormData((prev) => ({ ...prev, advantages: e.target.value }))}
              style={{
                minHeight: '80px',
                padding: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              placeholder="What disadvantages or missing features compared to other tools?"
              value={formData.disadvantages}
              onChange={(e) => setFormData((prev) => ({ ...prev, disadvantages: e.target.value }))}
              style={{
                minHeight: '80px',
                padding: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </Card>

        {/* Additional Suggestions */}
        <Card>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 16px 0' }}>
            💡 Additional Suggestions
          </h2>
          <textarea
            placeholder="Any other feedback, ideas, or suggestions for the Dealbook team?"
            value={formData.additionalSuggestions}
            onChange={(e) => setFormData((prev) => ({ ...prev, additionalSuggestions: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
        </Card>

        {/* Submit Button */}
        <div style={{ marginTop: '32px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#0047FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#0039CC';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0047FF';
            }}
          >
            {isSubmitting ? '⏳ Submitting...' : '✅ Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
