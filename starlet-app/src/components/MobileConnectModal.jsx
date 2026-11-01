import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Wifi, QrCode, Copy, Check, ExternalLink } from 'lucide-react';

export default function MobileConnectModal({ isOpen, onClose }) {
  const [lanInfo, setLanInfo] = useState({
    localIp: 'Detecting...',
    port: 8000,
    portalUrl: window.location.href
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/lan-info')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLanInfo(data);
        }
      })
      .catch(() => {
        // Fallback: use current window location
        const host = window.location.hostname;
        const port = window.location.port || '8000';
        setLanInfo({
          localIp: host,
          port: parseInt(port, 10),
          portalUrl: `http://${host}:${port}/starlet-app/dist/index.html`
        });
      });
  }, [isOpen]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(lanInfo.portalUrl)}&bgcolor=151019&color=fce5a9`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(lanInfo.portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative z-10 w-full max-w-md bg-[#140e16] rounded-3xl border border-[var(--accent)]/40 p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#b38634] p-[1px] shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#100a12] rounded-2xl flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-[var(--accent)]" />
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl font-bold text-white">
            Connect Phone via Wi-Fi
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Stream the entire Starlet VIP archive directly on your iPhone, Android, or iPad over your home Wi-Fi network.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-3.5 bg-[#1a111c] rounded-2xl border-2 border-[var(--accent)]/40 shadow-inner flex flex-col items-center">
          <img
            src={qrImageUrl}
            alt="Scan QR code for phone access"
            className="w-48 h-48 rounded-xl object-contain"
          />
          <span className="text-[10px] font-mono text-[var(--accent)] mt-2 font-bold flex items-center gap-1">
            <QrCode className="w-3 h-3" /> Point phone camera to connect
          </span>
        </div>

        {/* Direct URL Display & Copy */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between gap-2 bg-black/60 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
            <span className="truncate">{lanInfo.portalUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-light)] transition-colors flex-shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            Make sure your phone is connected to the same Wi-Fi router.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

