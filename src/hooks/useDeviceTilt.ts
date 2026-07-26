import { useState, useEffect } from 'react';

export const useDeviceTilt = (strength = 12) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e;
      if (beta === null || gamma === null) return;

      // Normalize tilts
      // gamma represents roll (left/right tilt) from -90 to 90
      // beta represents pitch (front/back tilt) from -180 to 180 (normal hold pitch is around 45deg)
      const x = (gamma / 45) * strength; 
      const y = ((beta - 45) / 45) * strength; // Center hold angle around 45 degrees

      // Clamp limits to prevent wild shifts
      setCoords({
        x: Math.max(-strength, Math.min(strength, x)),
        y: Math.max(-strength, Math.min(strength, y)),
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [strength]);

  return coords;
};
export default useDeviceTilt;
