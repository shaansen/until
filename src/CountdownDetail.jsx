import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconPencil } from '@tabler/icons-react';
import { UNITS, targetDate, fmt, unitTotal, unitValues, remainderBelow } from './storage.js';
import './CountdownDetail.css';

export default function CountdownDetail({ event, onBack, onEdit }) {
  const [now, setNow] = useState(() => Date.now());
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(0);
  const [fontSize, setFontSize] = useState(120);
  const lastNav = useRef(0);
  const touch = useRef(null);

  const target = useMemo(() => targetDate(event), [event]);
  const diff = target.getTime() - now;
  const done = diff <= 0;

  // Only units the gap actually contains, largest first, so a 13-month countdown
  // opens on years and a two-hour one opens on hours.
  const visible = useMemo(
    () => UNITS.map((u, i) => i).filter((i) => unitTotal(i, now, target) >= 1),
    [now, target],
  );

  // Keep pos in range as units drop off over time.
  useEffect(() => {
    if (pos > visible.length - 1) setPos(Math.max(0, visible.length - 1));
  }, [visible.length, pos]);

  // Tick.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const current = visible[Math.min(pos, visible.length - 1)] ?? UNITS.length - 1;
  const { value: currentValue, label } = unitValues(current, now, target);
  const value = fmt(currentValue);
  const sub = remainderBelow(current, now, target);

  // Fit the big number to the screen.
  useLayoutEffect(() => {
    const compute = () => {
      const byW = (window.innerWidth * 0.88) / (value.length * 0.58);
      const byH = window.innerHeight * 0.4;
      setFontSize(Math.max(Math.min(byW, byH), 40));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [value]);

  function nav(delta) {
    const t = Date.now();
    if (t - lastNav.current < 450) return;
    const np = pos + delta;
    if (np < 0 || np >= visible.length) return;
    lastNav.current = t;
    setDir(delta > 0 ? 1 : -1);
    setPos(np);
  }

  // Keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nav(1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onTouchStart(e) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touch.current) return;
    const dy = touch.current.y - e.changedTouches[0].clientY;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) && dx > 0) onBack();
    else if (Math.abs(dy) > 40 && Math.abs(dy) >= Math.abs(dx)) nav(dy > 0 ? 1 : -1);
    touch.current = null;
  }

  return (
    <div
      className="detail"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={(e) => Math.abs(e.deltaY) >= 8 && nav(e.deltaY > 0 ? 1 : -1)}
    >
      <div className="top-bar">
        <ActionIcon variant="subtle" color="green" size="lg" radius="xl" onClick={onBack} aria-label="Back">
          <IconChevronLeft size={22} />
        </ActionIcon>
        <div className="detail-title">{event.title}</div>
        <ActionIcon variant="subtle" color="green" size="lg" radius="xl" onClick={onEdit} aria-label="Edit">
          <IconPencil size={20} />
        </ActionIcon>
      </div>

      <div className="stage">
        {done ? (
          <div className="congrats">
            <div className="congrats-text">It's time</div>
            <div className="congrats-sub">{event.title}</div>
          </div>
        ) : (
          <>
            <div className={`chevron top ${pos === 0 ? 'hidden' : ''}`}>
              <svg viewBox="0 0 18 10"><polyline points="1,9 9,1 17,9" /></svg>
            </div>

            <div className="unit-card" key={current} data-dir={dir}>
              <div className="ornament">{label}</div>
              <div className="big-num" style={{ fontSize: `${fontSize}px` }}>{value}</div>
              {sub !== null && <div className="sub-num">{sub}</div>}
            </div>

            <div className={`chevron bottom ${pos >= visible.length - 1 ? 'hidden' : ''}`}>
              <svg viewBox="0 0 18 10"><polyline points="1,1 9,9 17,1" /></svg>
            </div>
          </>
        )}
      </div>

      <div className="bottom-bar">
        {!done && (
          <div className="dots">
            {visible.map((u, i) => (
              <button
                key={u}
                className={`dot-item ${i === pos ? 'active' : ''}`}
                onClick={() => nav(i - pos)}
                aria-label={UNITS[u].short}
              >
                <span className="dot-pip" />
                <span className="dot-lbl">{UNITS[u].short}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
