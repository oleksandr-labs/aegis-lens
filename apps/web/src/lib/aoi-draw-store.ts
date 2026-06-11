import { useState, useEffect } from "react";

type DrawStore = { shape: string | null };
let _state: DrawStore = { shape: null };
const _listeners: Set<() => void> = new Set();

export function setAoiDraw(shape: string | null) {
  _state = { shape };
  _listeners.forEach((fn) => fn());
}

export function useAoiDraw() {
  const [state, setState] = useState(_state);
  useEffect(() => {
    const fn = () => setState({ ..._state });
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  }, []);
  return state;
}
