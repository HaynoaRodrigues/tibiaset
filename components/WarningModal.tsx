import React, { useState } from 'react';

interface WarningModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ 
  isOpen, 
  title = "Warning", 
  message, 
  onConfirm, 
  onCancel 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm flex flex-col transform transition-all scale-100">
        
        {/* Header with Red Accent */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-red-900/20 to-transparent rounded-t-lg">
          <div className="p-2 bg-red-900/30 rounded-full border border-red-500/30 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-100 rpg-font tracking-wide">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            {message}
          </p>

          {/* Checkbox */}
          <div className="mt-6 flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 peer-checked:bg-yellow-600 peer-checked:border-yellow-500 transition-all"></div>
                <svg
                  className="absolute w-3 h-3 text-white top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors select-none">
                Don't show this warning again
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(dontShowAgain)}
            className="px-4 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-600 border border-red-600 hover:border-red-500 rounded shadow-lg shadow-red-900/20 transition-all active:scale-95"
          >
            Switch & Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;