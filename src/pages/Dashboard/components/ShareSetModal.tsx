import React from 'react';

interface ShareSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopy: () => void;
  isLinkCopied: boolean;
}

const ShareSetModal: React.FC<ShareSetModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  onCopy,
  isLinkCopied
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-200">Compartilhar Set</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Link do seu set:
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-slate-700 border border-slate-600 rounded-l-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={onCopy}
                disabled={isLinkCopied}
                className={`${isLinkCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'} px-4 py-2 rounded-r-lg text-sm font-medium transition-colors`}
              >
                {isLinkCopied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Visualizar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSetModal;