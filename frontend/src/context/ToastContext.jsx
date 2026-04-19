import React, { createContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
export const ToastContext = createContext();

// Toast Container Component
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast Component
function Toast({ toast, onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    const baseClass = 'glass-card border shadow-lg pointer-events-auto';
    switch (type) {
      case 'success':
        return `${baseClass} border-emerald-500/30 bg-emerald-500/5`;
      case 'error':
        return `${baseClass} border-red-500/30 bg-red-500/5`;
      case 'warning':
        return `${baseClass} border-amber-500/30 bg-amber-500/5`;
      case 'info':
      default:
        return `${baseClass} border-blue-500/30 bg-blue-500/5`;
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 100 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`${getStyles(toast.type)} rounded-xl p-4 min-w-[320px] max-w-[400px]`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(toast.type)}
        </div>
        <div className="flex-1">
          {toast.title && (
            <h3 className={`font-semibold ${getTextColor(toast.type)} mb-1`}>
              {toast.title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        onAnimationComplete={onClose}
        className={`h-1 ${
          toast.type === 'success' ? 'bg-emerald-500' :
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'warning' ? 'bg-amber-500' :
          'bg-blue-500'
        } mt-3 origin-left`}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const {
      message,
      title = '',
      type = 'info',
      duration = 3000
    } = typeof options === 'string' ? { message: options } : options;

    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      title,
      type,
      duration
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') =>
      addToast({ message, title, type: 'success', duration: 3000 }),
    
    error: (message, title = 'Error') =>
      addToast({ message, title, type: 'error', duration: 4000 }),
    
    warning: (message, title = 'Warning') =>
      addToast({ message, title, type: 'warning', duration: 3500 }),
    
    info: (message, title = 'Info') =>
      addToast({ message, title, type: 'info', duration: 3000 }),
    
    custom: (options) => addToast(options),
    
    dismiss: (id) => removeToast(id),
    
    dismissAll: () => setToasts([])
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// useToast Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
