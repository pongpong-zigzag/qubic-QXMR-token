import React, { useEffect, useRef } from 'react';
import { QxmrIconText } from './QxmrIconText';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Starfield animation
    const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let animationFrameId: number;
      let stars: { x: number; y: number; z: number; o: number }[] = [];
      const STAR_COUNT = 120;
      const STAR_SPEED = 1.0;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // Initialize stars
      const initStars = () => {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
          // x and y in [-width/2, width/2] and [-height/2, height/2]
          stars.push({
            x: (Math.random() - 0.5) * canvas.width,
            y: (Math.random() - 0.5) * canvas.height,
            z: Math.random() * canvas.width,
            o: 0.7 + Math.random() * 0.3
          });
        }
      };
      initStars();

      const draw = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < STAR_COUNT; i++) {
          let star = stars[i];
          star.z -= STAR_SPEED;
          if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * canvas.width;
            star.y = (Math.random() - 0.5) * canvas.height;
            star.z = canvas.width;
          }
          let k = 128.0 / star.z;
          let sx = star.x * k + canvas.width / 2;
          let sy = star.y * k + canvas.height / 2;
          if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) {
            star.x = (Math.random() - 0.5) * canvas.width;
            star.y = (Math.random() - 0.5) * canvas.height;
            star.z = canvas.width;
          } else {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(78, 224, 252, ${star.o})`;
            ctx.shadowColor = '#4EE0FC';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        animationFrameId = requestAnimationFrame(draw);
      };
      draw();

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 500);
      containerRef.current.style.opacity = opacity.toString();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas
        id="starfield-canvas"
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        aria-hidden="true"
      ></canvas>
      <div ref={containerRef} className="container mx-auto px-4 z-10 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          <QxmrIconText text="QXMR" className="justify-center" />
          <span className="block mt-2 text-2xl md:text-3xl lg:text-4xl font-light text-electricLight">Forged in Epoch 161.</span>
          <span className="block mt-4 text-2xl md:text-3xl tracking-wider font-light text-electric/80">
            Historic. Defiant. Unforgettable.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-electricLight/80 max-w-2xl mx-auto mt-8 font-mono">
          This one's for the believers. The HODLERs. The diamond hands. The fanatics. The stakers. The loyalists. The visionaries. For those who stood by when the world watched in silence — 
          and Epoch 161 made history.
        </p>
        <p className="text-lg md:text-xl text-electricLight/80 max-w-2xl mx-auto mt-8 font-mono">
          But…
        </p>
        <p className="text-lg md:text-xl text-electricLight/80 max-w-2xl mx-auto mt-8 font-mono">
          This one’s also for the haters. The paper hands. The skeptics. The FUDDERS. The doubters. The non-believers. You said it couldn’t be done, it wouldn’t work.
          You couldn’t deliver..
        </p>
        <p className="text-lg md:text-xl text-electricLight/80 max-w-2xl mx-auto mt-8 font-mono">
          Thanks for the rocket fuel.
        </p>
        
      </div>
    </div>
  );
};