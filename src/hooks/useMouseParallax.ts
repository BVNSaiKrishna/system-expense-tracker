import { useState, useEffect } from 'react';

export const useMouseParallax = (strength = 15) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Map mouse cursor positions relative to center of viewport (-0.5 to 0.5)
      const xOffset = e.clientX / window.innerWidth - 0.5;
      const yOffset = e.clientY / window.innerHeight - 0.5;

      setCoords({
        x: xOffset * strength,
        y: yOffset * strength,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength]);

  return coords;
};
export default useMouseParallax;
