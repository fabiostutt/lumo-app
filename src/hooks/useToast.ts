"use client";

import { useEffect, useRef, useState } from "react";

const TOAST_DURATION_MS = 3000;

// Controla o show/hide de um <Toast /> — 3s visível, depois o próprio Toast
// anima a saída (duration-300) reagindo a `show` virar false.
export function useToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(nextMessage: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(nextMessage);
    setShow(true);
    timeoutRef.current = setTimeout(() => setShow(false), TOAST_DURATION_MS);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { show, message, showToast };
}
