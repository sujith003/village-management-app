import { useCallback, useRef, useState } from "react";
import { ToastContext } from "./ToastContext.js";

// Lightweight in-app toast notification system. Replaces jarring
// browser alert() popups with a small, dismissible, non-blocking
// message that appears in the corner of the screen.

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = ++idCounter;

      setToasts((prev) => [...prev, { id, message, type }]);

      timers.current[id] = setTimeout(() => removeToast(id), duration);

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast-item toast-${item.type}`}
            onClick={() => removeToast(item.id)}
            role="status"
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
