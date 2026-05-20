'use client';

import React, { useState, useEffect } from 'react';
import { PulseSignal } from '@/lib/dealPulse';

interface PulseMeterProps {
  pulse: PulseSignal;
  size?: 'small' | 'medium' | 'large';
  compact?: boolean; // Minimal display for cards
}

export function PulseMeter({ pulse, size = 'medium' }: PulseMeterProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animate the pulse heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Size configurations
  const sizeConfig = {
    small: { container: 80, circle: 56, inner: 48, text: 16, bpmText: 12 },
    medium: { container: 120, circle: 84, inner: 72, text: 28, bpmText: 14 },
    large: { container: 160, circle: 112, inner: 96, text: 36, bpmText: 16 }
  };

  const config = sizeConfig[size];

  // Generate pulse wave path based on score
  const generatePulsePath = (score: number, phase: number) => {
    const points: string[] = [];
    const amplitude = (score / 100) * 8; // Higher score = bigger waves
    const frequency = 0.1;
    const phaseOffset = (phase / 100) * Math.PI * 2;

    for (let x = 0; x <= 100; x += 10) {
      const y = 50 + Math.sin((x * frequency) + phaseOffset) * amplitude;
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  // Determine ring color based on status
  const getStrokeColor = (status: string): string => {
    switch (status) {
      case 'flatlined':
        return '#6B7280';
      case 'weak':
        return '#EF4444';
      case 'normal':
        return '#F59E0B';
      case 'strong':
        return '#10B981';
      case 'accelerating':
        return '#0047FF';
      default:
        return '#6B7280';
    }
  };

  const strokeColor = getStrokeColor(pulse.status);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      {/* Pulse Meter Circle */}
      <div style={{
        position: 'relative',
        width: `${config.container}px`,
        height: `${config.container}px`
      }}>
        {/* Background circle */}
        <svg
          width={config.container}
          height={config.container}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* Outer ring - static background */}
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={config.circle / 2}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
          />

          {/* Pulse ring - animated based on score */}
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={config.circle / 2}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={`${(pulse.score / 100) * (Math.PI * config.circle)} ${Math.PI * config.circle}`}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.3s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: `${config.container / 2}px ${config.container / 2}px`
            }}
          />

          {/* Inner pulsing circle (heartbeat effect) */}
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={config.inner / 2}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1"
            opacity={0.3 + (Math.sin(animationPhase / 50 * Math.PI) * 0.3)}
            style={{
              transition: 'opacity 0.1s linear'
            }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {/* Score number */}
          <div style={{
            fontSize: `${config.text}px`,
            fontWeight: '700',
            color: strokeColor,
            fontFamily: '"DM Mono", monospace',
            lineHeight: 1
          }}>
            {pulse.score}
          </div>

          {/* BPM label */}
          <div style={{
            fontSize: `${config.bpmText}px`,
            fontWeight: '500',
            color: '#9CA3AF',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            {pulse.bpm} bpm
          </div>
        </div>
      </div>

      {/* Status label */}
      <div style={{
        fontSize: '13px',
        fontWeight: '600',
        color: strokeColor,
        textAlign: 'center',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        {pulse.status === 'flatlined' && '🔴 Flatlined'}
        {pulse.status === 'weak' && '⚠️ Weak Pulse'}
        {pulse.status === 'normal' && '⏻ Normal Pulse'}
        {pulse.status === 'strong' && '💪 Strong'}
        {pulse.status === 'accelerating' && '🚀 Accelerating'}
      </div>

      {/* Reasonings */}
      <div style={{
        width: '100%',
        fontSize: '12px',
        color: '#4B5563',
        textAlign: 'center',
        fontFamily: 'DM Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {pulse.reasonings.map((reason, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
}
