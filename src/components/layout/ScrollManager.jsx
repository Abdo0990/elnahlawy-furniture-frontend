import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    let frameId;
    let attempts = 0;

    const scrollToTarget = () => {
      const targetId = decodeURIComponent(location.hash.replace('#', ''));
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (attempts < 60) {
        attempts += 1;
        frameId = window.requestAnimationFrame(scrollToTarget);
      }
    };

    const timerId = window.setTimeout(() => {
      if (location.hash) {
        scrollToTarget();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, location.hash ? 280 : 0);

    return () => {
      window.clearTimeout(timerId);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [location.key, location.hash]);

  return null;
}

export default ScrollManager;
