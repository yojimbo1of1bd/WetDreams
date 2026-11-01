import React, { useEffect, useRef } from 'react';

export default function GlassShatter({ isActive, originX, originY, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Web Audio Synthesized Glass Crunch & Fracture Sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      // 1. High frequency sharp fracture crack
      const crackOsc = audioCtx.createOscillator();
      const crackGain = audioCtx.createGain();
      crackOsc.type = 'triangle';
      crackOsc.frequency.setValueAtTime(3200, now);
      crackOsc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
      crackGain.gain.setValueAtTime(0.6, now);
      crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      crackOsc.connect(crackGain);
      crackGain.connect(audioCtx.destination);
      crackOsc.start(now);
      crackOsc.stop(now + 0.15);

      // 2. Tumble & shard crunch (noise buffer)
      const bufferSize = audioCtx.sampleRate * 0.4;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.1));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.0, now);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Audio shatter error:', e);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const epicX = originX || width / 2;
    const epicY = originY || height / 2;

    // Generate radial shards
    const shards = [];
    const shardCount = 42;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const nextAngle = ((i + 1) / shardCount) * Math.PI * 2;
      const dist1 = 40 + Math.random() * (Math.max(width, height) * 0.7);
      const dist2 = 40 + Math.random() * (Math.max(width, height) * 0.7);

      const speed = 6 + Math.random() * 14;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 3; // slight upward pop before gravity

      shards.push({
        p1: { x: epicX, y: epicY },
        p2: { x: epicX + Math.cos(angle) * dist1, y: epicY + Math.sin(angle) * dist1 },
        p3: { x: epicX + Math.cos(nextAngle) * dist2, y: epicY + Math.sin(nextAngle) * dist2 },
        cx: epicX,
        cy: epicY,
        vx,
        vy,
        rot: 0,
        vRot: (Math.random() - 0.5) * 0.12,
        opacity: 1,
        color: Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(220, 230, 242, 0.15)'
      });
    }

    let animId;
    let startTime = performance.now();

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Flash crack lines
      if (elapsed < 0.2) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - elapsed * 5})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(epicX, epicY);
          ctx.lineTo(epicX + Math.cos(a) * width, epicY + Math.sin(a) * height);
          ctx.stroke();
        }
      }

      // Draw flying shards
      for (const s of shards) {
        s.cx += s.vx;
        s.cy += s.vy;
        s.vy += 0.45; // gravity
        s.rot += s.vRot;
        s.opacity = Math.max(0, 1 - elapsed * 1.2);

        ctx.save();
        ctx.translate(s.cx - epicX, s.cy - epicY);
        ctx.rotate(s.rot);

        ctx.beginPath();
        ctx.moveTo(s.p1.x, s.p1.y);
        ctx.lineTo(s.p2.x, s.p2.y);
        ctx.lineTo(s.p3.x, s.p3.y);
        ctx.closePath();

        ctx.fillStyle = s.color;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      if (elapsed < 1.1) {
        animId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isActive, originX, originY, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}

