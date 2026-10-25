import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Lock, ShieldCheck, KeyRound, ArrowRight, Delete } from 'lucide-react';

interface PinLockScreenProps {
  isPinSet: boolean;
  onSuccess: (token: string) => void;
  onSetup: (pin: string) => Promise<string>;
  onUnlock: (pin: string) => Promise<string>;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  isPinSet,
  onSuccess,
  onSetup,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'setup' | 'confirm'>(isPinSet ? 'enter' : 'setup');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDigit = (digit: string) => {
    setError(null);
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);

      // Auto-submit if 6 digits or allow 4 digits submit
      if (nextPin.length === 6) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const submitPin = async (pinToSubmit: string) => {
    if (pinToSubmit.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isPinSet) {
        // Unlock
        const token = await onUnlock(pinToSubmit);
        onSuccess(token);
      } else {
        // Initial setup
        if (step === 'setup') {
          setConfirmPin(pinToSubmit);
          setPin('');
          setStep('confirm');
          setLoading(false);
          return;
        } else if (step === 'confirm') {
          if (pinToSubmit !== confirmPin) {
            setError('PINs do not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('setup');
            setLoading(false);
            return;
          }
          const token = await onSetup(pinToSubmit);
          onSuccess(token);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Incorrect Master PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0c1317] flex flex-col items-center justify-center p-4 text-[#e9edef] select-none">
      <div className="w-full max-w-sm bg-[#111b21] border border-[#222d34] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        
        {/* Brand Logo & Lock Icon */}
        <div className="relative mb-5">
          <BrandLogo size={56} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#202c33] border-2 border-[#111b21] flex items-center justify-center text-[#25D366]">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-1">
          {isPinSet
            ? 'WhatsSchedule is Locked'
            : step === 'setup'
            ? 'Set Up Master Security PIN'
            : 'Confirm Master PIN'}
        </h2>

        <p className="text-xs text-[#8696a0] max-w-xs mb-6 leading-relaxed">
          {isPinSet
            ? 'Enter your 4 to 6 digit Master PIN to unlock your WhatsApp scheduler on this browser.'
            : step === 'setup'
            ? 'Create a secure Master PIN to prevent other Chrome profiles or users from accessing your WhatsApp session.'
            : 'Re-enter your Master PIN to confirm.'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="w-full p-2.5 mb-4 bg-[#ea4335]/15 border border-[#ea4335]/30 rounded-xl text-xs text-[#ea4335] font-medium">
            {error}
          </div>
        )}

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#00a884] scale-110 shadow-[0_0_8px_rgba(0,168,132,0.6)]'
                    : 'bg-[#202c33] border border-[#2a3942]'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric Keypad (1 to 9, 0, Backspace) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-lg font-semibold text-white transition-all border border-[#2a3942]/60 shadow-sm flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          <div className="flex items-center justify-center">
            {pin.length >= 4 && (
              <button
                type="button"
                onClick={() => submitPin(pin)}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#00a884] hover:bg-[#02bd94] active:scale-95 text-xs font-bold text-white transition-all shadow flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-lg font-semibold text-white transition-all border border-[#2a3942]/60 shadow-sm flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-[#8696a0] hover:text-white transition-all border border-[#2a3942]/60 shadow-sm flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#8696a0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
          <span>Zero-Knowledge Local Salt & PBKDF2 Hashing</span>
        </div>
      </div>
    </div>
  );
};
