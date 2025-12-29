import { useEffect } from 'react';

function Modal({ isOpen, onClose, title, message, type = 'info', confirmText, cancelText, onConfirm }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800 border border-neutral-600 rounded-lg shadow-2xl max-w-md w-full animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-6 border-b border-neutral-600 ${
          type === 'error' ? 'bg-red-500/10' : 
          type === 'warning' ? 'bg-yellow-500/10' : 
          type === 'success' ? 'bg-primary/10' : ''
        }`}>
          <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
          <button 
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-600 bg-neutral-700/30">
          {onConfirm ? (
            <>
              <button 
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 rounded-lg transition-colors"
                onClick={onClose}
              >
                {cancelText || 'Cancel'}
              </button>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' :
                  type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-neutral-900' :
                  'bg-primary hover:bg-primary-light text-white'
                }`}
                onClick={handleConfirm}
              >
                {confirmText || 'Confirm'}
              </button>
            </>
          ) : (
            <button 
              className="px-4 py-2 bg-primary hover:bg-primary-light border border-primary text-white font-medium rounded-lg transition-colors"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
