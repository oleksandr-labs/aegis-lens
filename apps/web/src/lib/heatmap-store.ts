import { useState, useEffect } from "react";

let _visible = false;
const _listeners: Set<() => void> = new Set();

export function setHeatmap(v: boolean) {
  _visible = v;
  _listeners.forEach((fn) => fn());
}

export function getHeatmap() {
  return _visible;
}

export function useHeatmap() {
  const [v, setV] = useState(_visible);
  useEffect(() => {
    const fn = () => setV(_visible);
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  }, []);
  return v;
}
