import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Lock, ShieldCheck, ArrowRight, Delete, Moon, Sun } from 'lucide-react';

interface PinLockScreenProps {
  isPinSet: boolean;
  onSuccess: (token: string) => void;
  onSetup: (pin: string) => Promise<string>;
  onUnlock: (pin: string) => Promise<string>;
  themeMode?: 'light' | 'dark' | 'auto';
  onToggleTheme?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  isPinSet,
  onSuccess,
  onSetup,
  onUnlock,
  themeMode,
  onToggleTheme,
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
        const token = await onUnlock(pinToSubmit);
        onSuccess(token);
      } else {
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
    <div className="min-h-screen w-screen bg-[#F6F9F7] dark:bg-[#101815] flex flex-col items-center justify-center p-4 text-[#16231F] dark:text-[#F2F7F4] select-none transition-colors duration-150 relative">
      
      {/* Theme Toggle in top-right */}
      {onToggleTheme && (
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] text-[#5D7168] dark:text-[#B2C1B8] hover:text-[#087F5B] dark:hover:text-[#25C993] transition-colors shadow-xs"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <span className="dark:hidden">
              <Moon className="w-4 h-4" />
            </span>
            <span className="hidden dark:inline">
              <Sun className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      <div className="w-full max-w-sm bg-white dark:bg-[#17211D] border border-[#DCE7E1] dark:border-[#2D3D35] rounded-3xl p-8 shadow-sm flex flex-col items-center text-center transition-colors duration-150">
        
        {/* Brand Logo & Lock Indicator */}
        <div className="relative mb-5">
          <BrandLogo size={56} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E5F5EF] dark:bg-[#1D3830] border-2 border-white dark:border-[#17211D] flex items-center justify-center text-[#087F5B] dark:text-[#25C993]">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#16231F] dark:text-[#F2F7F4] mb-1">
          {isPinSet
            ? 'WhatsSchedule is Locked'
            : step === 'setup'
            ? 'Set Up Master Security PIN'
            : 'Confirm Master PIN'}
        </h2>

        <p className="text-xs text-[#5D7168] dark:text-[#8A9A91] max-w-xs mb-6 leading-relaxed">
          {isPinSet
            ? 'Enter your 4 to 6 digit Master PIN to unlock your WhatsApp scheduler on this browser.'
            : step === 'setup'
            ? 'Create a secure Master PIN to prevent other Chrome profiles or users from accessing your WhatsApp session.'
            : 'Re-enter your Master PIN to confirm.'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="w-full p-2.5 mb-4 bg-[#B42318]/10 dark:bg-[#FF938B]/15 border border-[#B42318]/20 dark:border-[#FF938B]/30 rounded-xl text-xs text-[#B42318] dark:text-[#FF938B] font-medium">
            {error}
          </div>
        )}

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#087F5B] dark:bg-[#25C993] scale-110 shadow-xs'
                    : 'bg-[#F0F5F2] dark:bg-[#1E2B25] border border-[#DCE7E1] dark:border-[#2D3D35]'
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
              className="h-14 rounded-2xl bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] active:scale-95 text-lg font-semibold text-[#16231F] dark:text-[#F2F7F4] transition-all border border-[#DCE7E1]/80 dark:border-[#2D3D35] shadow-2xs flex items-center justify-center"
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
                className="w-full h-14 rounded-2xl bg-[#087F5B] hover:bg-[#06684B] dark:bg-[#25C993] dark:hover:bg-[#46D9A6] active:scale-95 text-white dark:text-[#0D3027] transition-all shadow-xs flex items-center justify-center font-bold"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] active:scale-95 text-lg font-semibold text-[#16231F] dark:text-[#F2F7F4] transition-all border border-[#DCE7E1]/80 dark:border-[#2D3D35] shadow-2xs flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-[#F0F5F2] hover:bg-[#E5F5EF] dark:bg-[#1E2B25] dark:hover:bg-[#253931] active:scale-95 text-[#788980] hover:text-[#16231F] dark:hover:text-[#F2F7F4] transition-all border border-[#DCE7E1]/80 dark:border-[#2D3D35] shadow-2xs flex items-center justify-center"
            title="Delete"
            aria-label="Delete last digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#788980] dark:text-[#8A9A91]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#25C993]" />
          <span>Zero-Knowledge Local Salt & PBKDF2 Hashing</span>
        </div>
      </div>
    </div>
  );
};
