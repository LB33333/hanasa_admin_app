import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// 부모(모달/드로어 등)의 overflow-y-auto에 잘리지 않도록 body에 포탈로 렌더링한다.
export function FloatingDropdown({
  anchorRef,
  open,
  maxHeight = 288,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  maxHeight?: number;
  children: React.ReactNode;
}) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) {
      return;
    }
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef]);

  if (!open || !rect) {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-50 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={{ top: rect.top, left: rect.left, width: rect.width, maxHeight }}
    >
      {children}
    </div>,
    document.body,
  );
}
