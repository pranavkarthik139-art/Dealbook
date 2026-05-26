'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Handle demo login with credentials provider
  const handleDemoLogin = async () => {
    await signIn('credentials', {
      email: 'demo@dealbook.com',
      password: 'demo123',
      redirect: true,
      callbackUrl: '/dashboard',
    });
  };

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--paper)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-light)', fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if redirecting
  if (status === 'authenticated') {
    return null;
  }

  const stats = [
    { label: '10+ hours', desc: 'saved per week per SE' },
    { label: '3x faster', desc: 'deal visibility' },
    { label: '25% higher', desc: 'win rates' },
  ];

  const useCases = [
    {
      title: 'Stop Losing Deal Context',
      problem: 'Your calls, emails, and updates are scattered across Gmail, Google Calendar, and Slack. You spend 15 minutes per deal gathering context.',
      solution: 'Dealbook auto-syncs Google Calendar, emails, and activity into one unified deal dashboard. All context is one click away.',
      feature: 'Auto Activity Logging',
    },
    {
      title: 'Never Miss a Stalled Deal',
      problem: 'Without visibility, deals sit idle for weeks. By the time you notice, the prospect has moved on.',
      solution: 'Deal Health Scoring automatically flags at-risk deals based on activity velocity, engagement, and timeline. Get alerts before it\'s too late.',
      feature: 'Deal Health Scoring',
    },
    {
      title: 'Prep for Calls in 30 Seconds',
      problem: 'You spend 15-20 minutes before each call searching for context: last conversation, company info, POC names, next steps.',
      solution: 'Smart Call Prep delivers relevant deal context 10 minutes before your call. Everything you need is right there.',
      feature: 'Smart Call Prep',
    },
    {
      title: 'Actually Know Your Pipeline',
      problem: 'Your forecast is a guess. You don\'t know which deals will close or when. Managers ask "when is Acme closing?" and you don\'t have an answer.',
      solution: 'Dealbook forecasts deal close dates based on actual activity patterns. Move deals through your pipeline transparently.',
      feature: 'Deal Pipeline + Forecasting',
    },
    {
      title: 'Build Team Alignment',
      problem: 'Sales Engineers and Presales Leads have different views of deal status. Information gets lost in email threads and Slack.',
      solution: 'Role-based collaboration gives managers visibility into all deals while SEs focus on theirs. Work from the same source of truth.',
      feature: 'Team Collaboration',
    },
    {
      title: 'Stop Manual Data Entry',
      problem: 'You spend 2+ hours a week logging calls, creating tasks, and updating deal status manually.',
      solution: 'Process Templates + Automation create standard workflows. Trigger actions automatically when deals move through stages.',
      feature: 'Automation & Templates',
    },
  ];

  const tooltips = {
    dealHealth: 'Health Score = (Activity Velocity × 40%) + (Gong Sentiment × 35%) + (Stakeholder Engagement × 25%). Activity = call/email frequency in last 14 days. Gong Sentiment = avg sentiment from call transcripts. Engagement = contact response rate + participation.',
    activityTimeline: 'Auto-synced from: Google Calendar, Gmail (daily), Gong (all calls with transcripts), Dealbook tasks. Deduplication via event IDs. Real-time updates.',
    callPrep: 'Triggers 10 min before meeting. Shows: deal context, last 3 communications, stakeholder roles, open tasks, deal milestones, Gong sentiment from previous calls.',
    kanban: 'Pipeline stages: Demo → POC → Validation → Closed. Configurable per deal type via templates. Auto-creates milestone tasks on stage entry.',
    gongIntegration: 'Syncs all calls (inbound/outbound) with full transcripts. Sentiment analysis per call. Risk indicators from call content. Auto-matches to deals by participant emails.',
  };

  const InfoIcon = ({ tooltipKey }: { tooltipKey: string }) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'var(--cobalt)',
        color: 'white',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'help',
        marginLeft: '8px',
        position: 'relative',
      }}
      onMouseEnter={() => setHoveredTooltip(tooltipKey)}
      onMouseLeave={() => setHoveredTooltip(null)}
    >
      ?
      {hoveredTooltip === tooltipKey && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ink)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            lineHeight: '1.6',
            whiteSpace: 'normal',
            width: '280px',
            marginBottom: '8px',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--line)',
          }}
        >
          {tooltips[tooltipKey as keyof typeof tooltips]}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--ink)',
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--paper)',
      color: 'var(--ink)',
    }}>
      {/* Navigation */}
      <nav style={{
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '48px',
        paddingRight: '48px',
        borderBottom: '1px solid var(--line-light)',
        backgroundColor: 'var(--paper)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: '"Playfair Display", serif',
          color: 'var(--ink)',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          Dealbook
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDemoLogin}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'var(--cobalt)',
              border: '1.5px solid var(--cobalt)',
              borderRadius: '7px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✨ Try Demo
          </button>
          <button
            onClick={() => signIn('google')}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔐 Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 48px',
        textAlign: 'center',
        backgroundColor: 'var(--paper)',
        borderBottom: '1px solid var(--line-light)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--cobalt)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '20px',
          }}>
            ✨ For Presales Teams Drowning in Deal Context
          </p>

          <h1 style={{
            fontSize: '64px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            color: 'var(--ink)',
            margin: '0 0 24px 0',
            lineHeight: 1.15,
            letterSpacing: '-2px',
          }}>
            Stop Losing Deals to Poor Visibility
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'var(--ink-light)',
            margin: '0 0 32px 0',
            lineHeight: 1.8,
            maxWidth: '700px',
            margin: '0 auto 32px auto',
          }}>
            Dealbook brings together every interaction with your deals: calls, emails, tasks, and calendar events. See exactly where each deal stands. Never miss a stalled opportunity.
          </p>

          <button
            onClick={() => signIn('google')}
            style={{
              padding: '14px 40px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: 'var(--shadow-md)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            Start Free • No Credit Card
          </button>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
            marginTop: '80px',
            maxWidth: '600px',
            margin: '80px auto 0 auto',
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--cobalt)',
                  margin: '0 0 8px 0',
                }}>
                  {stat.label}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--ink-lighter)',
                  margin: 0,
                }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{
        padding: '120px 48px',
        backgroundColor: 'var(--paper)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: '0 0 16px 0',
              letterSpacing: '-1px',
            }}>
              Real Problems, Real Solutions
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--ink-light)',
              margin: 0,
            }}>
              How teams like yours use Dealbook to close deals faster
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px',
          }}>
            {useCases.map((useCase, i) => (
              <div
                key={i}
                style={{
                  padding: '32px',
                  backgroundColor: 'var(--paper-alt)',
                  border: '1px solid var(--line-light)',
                  borderRadius: '12px',
                  transition: 'all 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--line-light)';
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: 'var(--cobalt)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}>
                  {useCase.feature}
                </div>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: '0 0 16px 0',
                }}>
                  {useCase.title}
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-lighter)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 6px 0',
                  }}>
                    The Problem
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--ink-light)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    {useCase.problem}
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--cobalt)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 6px 0',
                  }}>
                    ✓ The Solution
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}>
                    {useCase.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section style={{
        padding: '80px 48px',
        backgroundColor: 'var(--paper-alt)',
        borderTop: '1px solid var(--line-light)',
        borderBottom: '1px solid var(--line-light)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-1px',
            }}>
              Powered by Your Data
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {[
              { icon: '📅', name: 'Google Calendar', desc: 'Calls & meetings' },
              { icon: '📧', name: 'Gmail', desc: 'Email sync' },
              { icon: '📞', name: 'Gong', desc: 'Call transcripts & sentiment' },
              { icon: '📊', name: 'Dealbook', desc: 'Manual updates' },
            ].map((source, i) => (
              <div
                key={i}
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--line-light)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '28px', margin: '0 0 8px 0' }}>{source.icon}</p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: '0 0 4px 0',
                }}>
                  {source.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--ink-lighter)',
                  margin: 0,
                }}>
                  {source.desc}
                </p>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--ink-lighter)',
            marginTop: '40px',
            fontStyle: 'italic',
          }}>
            All data synced automatically in real-time. No manual logging needed.
          </p>
        </div>
      </section>

      {/* See It In Action Section */}
      <section style={{
        padding: '120px 48px',
        backgroundColor: 'var(--paper)',
        borderTop: '1px solid var(--line-light)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: '0 0 16px 0',
              letterSpacing: '-1px',
            }}>
              See It In Action
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--ink-light)',
              margin: 0,
            }}>
              Visual walkthroughs of Dealbook's core features
            </p>
          </div>

          {/* Feature Showcase 1: Kanban Pipeline */}
          <div style={{
            marginBottom: '60px',
            padding: '40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '16px',
            border: '1px solid var(--line-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                📊 Kanban Pipeline
              </h3>
              <InfoIcon tooltipKey="kanban" />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}>
              {[
                { stage: 'Demo', color: '#6366F1', deals: ['Acme Corp', 'TechStart Inc'] },
                { stage: 'POC', color: '#8B5CF6', deals: ['Global Systems'] },
                { stage: 'Validation', color: '#F59E0B', deals: ['NextGen AI', 'DataFlow'] },
                { stage: 'Closed', color: '#10B981', deals: ['Innovate Pro'] },
              ].map((pipeline, i) => (
                <div key={i}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: pipeline.color,
                    color: 'white',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    {pipeline.stage}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pipeline.deals.map((deal, j) => (
                      <div
                        key={j}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--paper)',
                          border: '1px solid var(--line-light)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--ink)',
                          cursor: 'grab',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{deal}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-lighter)' }}>$150K • 5d ago</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Showcase 2: Deal Health Scoring */}
          <div style={{
            marginBottom: '60px',
            padding: '40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '16px',
            border: '1px solid var(--line-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                ❤️ Deal Health Scoring
              </h3>
              <InfoIcon tooltipKey="dealHealth" />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}>
              {[
                { name: 'Acme Corp', health: 85, status: 'On Track', color: '#10B981', activity: 'Call 2h ago', prob: '80%', gongScore: '92/100' },
                { name: 'TechStart Inc', health: 45, status: 'At Risk', color: '#F59E0B', activity: '5 days ago', prob: '35%', gongScore: '68/100' },
                { name: 'DataFlow', health: 72, status: 'Healthy', color: '#3B82F6', activity: '6h ago', prob: '65%', gongScore: '81/100' },
              ].map((deal, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--line-light)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: '8px',
                    }}>
                      {deal.name}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: deal.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 700,
                      }}>
                        {deal.health}
                      </div>
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: deal.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {deal.status}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--ink-lighter)',
                          marginTop: '4px',
                        }}>
                          {deal.activity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--line-light)',
                    fontSize: '12px',
                    color: 'var(--ink)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Close Probability:</span>
                      <span style={{ fontWeight: 600, color: deal.color }}>{deal.prob}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gong Sentiment:</span>
                      <span style={{ fontWeight: 600, color: '#6366F1' }}>{deal.gongScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Showcase 3: Gong Integration */}
          <div style={{
            marginBottom: '60px',
            padding: '40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '16px',
            border: '1px solid var(--line-light)',
            borderLeft: '4px solid #6366F1',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                🎙️ Gong Intelligence
              </h3>
              <InfoIcon tooltipKey="gongIntegration" />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}>
              {[
                {
                  title: 'Call Transcript',
                  items: [
                    '📞 Sarah (CTO) asked about scalability',
                    '🎯 Mentioned budget constraints',
                    '✅ Positive response to roadmap',
                  ],
                  sentiment: 'Positive',
                  sentimentColor: '#10B981',
                },
                {
                  title: 'Key Insights',
                  items: [
                    '⚠️ Concern: Integration complexity',
                    '📈 Opportunity: 3-month POC',
                    '💰 Budget approval needed Q2',
                  ],
                  sentiment: 'Actionable',
                  sentimentColor: '#F59E0B',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--line-light)',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: '12px',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    {item.items.map((line, j) => (
                      <div key={j} style={{ fontSize: '12px', color: 'var(--ink-light)' }}>
                        {line}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--line-light)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: item.sentimentColor,
                  }}>
                    {item.sentiment}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Showcase 4: Activity Timeline */}
          <div style={{
            marginBottom: '60px',
            padding: '40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '16px',
            border: '1px solid var(--line-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                🤖 Activity Timeline
              </h3>
              <InfoIcon tooltipKey="activityTimeline" />
            </div>

            <div style={{
              maxWidth: '600px',
            }}>
              {[
                { icon: '📞', action: 'Gong Call', desc: 'Demo call with Sarah (CTO) • 92/100 sentiment', time: '2 hours ago', color: '#6366F1' },
                { icon: '📧', action: 'Email', desc: 'Follow-up sent to sarah@acmecorp.com', time: '1 day ago', color: '#8B5CF6' },
                { icon: '✅', action: 'Task', desc: 'Send proposal document', time: '2 days ago', color: '#10B981' },
                { icon: '📅', action: 'Meeting', desc: 'Q&A session scheduled • Auto-logged from Google Calendar', time: '3 days ago', color: '#F59E0B' },
                { icon: '📊', action: 'Deal Update', desc: 'Moved from Demo to POC', time: '1 week ago', color: '#3B82F6' },
              ].map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: '16px',
                    marginBottom: '16px',
                    borderBottom: i < 4 ? '1px solid var(--line-light)' : 'none',
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    minWidth: '32px',
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: activity.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                    }}>
                      {activity.action}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      marginBottom: '4px',
                    }}>
                      {activity.desc}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--ink-lighter)',
                    }}>
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Showcase 5: Smart Call Prep */}
          <div style={{
            padding: '40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '16px',
            border: '1px solid var(--line-light)',
            borderLeft: '4px solid var(--cobalt)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}>
                📞 Smart Call Prep
              </h3>
              <InfoIcon tooltipKey="callPrep" />
            </div>

            <div style={{
              maxWidth: '600px',
              padding: '24px',
              backgroundColor: 'var(--paper)',
              borderRadius: '12px',
              border: '1px solid var(--line-light)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}>
                    Call with Acme Corp
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--ink-lighter)',
                  }}>
                    Demo Call • Sarah (CTO)
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--cobalt)',
                }}>
                  10:00 AM
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--paper-alt)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>📊 Last Call</div>
                <div style={{ color: 'var(--ink-light)', marginBottom: '4px' }}>Gong Sentiment: 92/100 (Very Positive)</div>
                <div style={{ color: 'var(--ink-lighter)', fontSize: '12px' }}>Email sent 2 days ago about POC timeline</div>
              </div>

              <div style={{
                backgroundColor: 'var(--paper-alt)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>👥 Key Stakeholders</div>
                <div style={{ color: 'var(--ink-light)' }}>Sarah (CTO) • Last contacted 2d ago</div>
              </div>

              <div style={{
                backgroundColor: 'var(--paper-alt)',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>🎯 Next Steps</div>
                <div style={{ color: 'var(--ink-light)' }}>Review POC agenda • Send demo link</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section style={{
        padding: '120px 48px',
        backgroundColor: 'var(--paper)',
        borderTop: '1px solid var(--line-light)',
        borderBottom: '1px solid var(--line-light)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-1px',
            }}>
              Built on Real Presales Workflows
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {[
              {
                icon: '📊',
                title: 'Kanban Pipeline',
                desc: 'Drag-and-drop deals through your pipeline. See exactly where each deal stands.',
              },
              {
                icon: '❤️',
                title: 'Deal Health Scoring',
                desc: 'Automatic health calculation shows which deals need your attention right now.',
              },
              {
                icon: '🤖',
                title: 'Auto Activity Logging',
                desc: 'Google Calendar + Gmail + Gong sync. Every call, email, and meeting is logged automatically.',
              },
              {
                icon: '📞',
                title: 'Smart Call Prep',
                desc: '10 minutes before a call, get all the context you need to prep effectively.',
              },
              {
                icon: '👥',
                title: 'Contact Management',
                desc: 'Track all stakeholders in a deal. Know who\'s involved and their last interaction.',
              },
              {
                icon: '🎯',
                title: 'Process Templates',
                desc: 'Standardize your deal workflow. Templates auto-create tasks and next steps.',
              },
              {
                icon: '⚡',
                title: 'Smart Automation',
                desc: 'Auto-trigger actions when deals move stages. No manual updates needed.',
              },
              {
                icon: '🎨',
                title: '5 Premium Themes',
                desc: 'Light, Dark, Cobalt, Emerald, Slate. Customize to match your team\'s style.',
              },
              {
                icon: '📈',
                title: 'Pipeline Forecasting',
                desc: 'Real-time forecast based on deal health, stage, and historical close rates.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--paper-alt)',
                  border: '1px solid var(--line-light)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>
                  {feature.icon}
                </p>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: '0 0 8px 0',
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--ink-light)',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 48px',
        textAlign: 'center',
        backgroundColor: 'var(--paper)',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            color: 'var(--ink)',
            margin: '0 0 20px 0',
            letterSpacing: '-1px',
          }}>
            Ready to Stop Losing Deals?
          </h2>

          <p style={{
            fontSize: '17px',
            color: 'var(--ink-light)',
            margin: '0 0 32px 0',
            lineHeight: 1.8,
          }}>
            Join presales teams who've cut their deal cycle time in half and improved their win rates by 25%.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handleDemoLogin}
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: 'var(--cobalt)',
                border: '2px solid var(--cobalt)',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--cobalt)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✨ See the Demo
            </button>
            <button
              onClick={() => signIn('google')}
              style={{
                padding: '16px 48px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-md)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              Sign In with Google
            </button>
          </div>

          <p style={{
            fontSize: '13px',
            color: 'var(--ink-lighter)',
            margin: '12px 0 0 0',
          }}>
            No credit card required. Set up in 5 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 48px',
        borderTop: '1px solid var(--line-light)',
        backgroundColor: 'var(--paper-alt)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--ink-lighter)',
      }}>
        <p style={{ margin: 0 }}>
          © 2026 Dealbook. Built by presales engineers, for presales engineers.
        </p>
      </footer>
    </div>
  );
}
