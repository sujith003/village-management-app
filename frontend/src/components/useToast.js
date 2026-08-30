import { useContext } from "react";
import { ToastContext } from "./ToastContext.js";

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    // Fail safe rather than crashing the whole app if a component ever
    // renders outside the provider during development.
    return {
      success: (msg) => console.log("[toast:success]", msg),
      error: (msg) => console.error("[toast:error]", msg),
      info: (msg) => console.log("[toast:info]", msg),
    };
  }

  return context;
}
