import { useState, useEffect, useRef } from 'react';

const useTypewriter = (strings, speed = 70, deleteSpeed = 40, pauseMs = 1800) => {
  const [displayText, setDisplayText] = useState('');
  const stateRef = useRef({ idx: 0, pos: 0, deleting: false });

  useEffect(() => {
    if (!strings.length) return;
    let timeout;

    const tick = () => {
      const { idx, pos, deleting } = stateRef.current;
      const current = strings[idx];

      if (!deleting) {
        const nextPos = pos + 1;
        stateRef.current = { idx, pos: nextPos, deleting: nextPos >= current.length };
        setDisplayText(current.slice(0, nextPos));
        timeout = setTimeout(tick, nextPos >= current.length ? pauseMs : speed);
      } else {
        const nextPos = pos - 1;
        const done = nextPos <= 0;
        stateRef.current = {
          idx: done ? (idx + 1) % strings.length : idx,
          pos: done ? 0 : nextPos,
          deleting: !done,
        };
        setDisplayText(current.slice(0, nextPos));
        timeout = setTimeout(tick, done ? speed : deleteSpeed);
      }
    };

    timeout = setTimeout(tick, speed);
    return () => clearTimeout(timeout);
  }, [strings, speed, deleteSpeed, pauseMs]);

  return displayText;
};

export default useTypewriter;
