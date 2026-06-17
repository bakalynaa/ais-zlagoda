import { useEffect, useRef, useState } from 'react';
import { initIntroAnimation } from './introAnimation';
import './IntroScreen.css';

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startScreenRef = useRef<HTMLDivElement>(null);
  const wipeLeftRef = useRef<HTMLDivElement>(null);
  const wipeRightRef = useRef<HTMLDivElement>(null);
  const endScreenRef = useRef<HTMLDivElement>(null);
  const endTextRef = useRef<HTMLSpanElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    const screenRoot = screenRef.current;
    const canvas = canvasRef.current;
    const startScreen = startScreenRef.current;
    const wipeLeft = wipeLeftRef.current;
    const wipeRight = wipeRightRef.current;
    const endScreen = endScreenRef.current;
    const endText = endTextRef.current;

    if (!screenRoot || !canvas || !startScreen || !wipeLeft || !wipeRight || !endScreen || !endText) {
      return;
    }

    return initIntroAnimation(
      { screenRoot, canvas, startScreen, wipeLeft, wipeRight, endScreen, endText },
      {
        onReady: () => setIsReady(true),
        onExitReady: () => setLogoReady(true),
      },
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.key === 'Enter') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onComplete]);

  return (
    <div ref={screenRef} className="intro-screen" role="presentation">
      <div className="intro-viewport">
        <canvas ref={canvasRef} />
        <div className="intro-vignette" />
        <div className="intro-film-grade" aria-hidden="true" />
        <div className="intro-film-grain" aria-hidden="true" />
        <div className="intro-film-scanlines" aria-hidden="true" />
      </div>

      <div className="intro-letterbox intro-letterbox--top" aria-hidden="true" />
      <div className="intro-letterbox intro-letterbox--bottom" aria-hidden="true" />

      <div ref={wipeLeftRef} className="intro-wipe intro-wipe-left" />
      <div ref={wipeRightRef} className="intro-wipe intro-wipe-right" />

      <div ref={startScreenRef} className="intro-start-screen">
        <div className="intro-hint">
          {isReady ? 'Натисніть пробіл або клікніть, щоб почати' : 'Завантаження...'}
        </div>
      </div>

      <div ref={endScreenRef} className="intro-end-screen">
        <div className="intro-text-type">
          <span ref={endTextRef} className="intro-text-type__content" />
          <span className="intro-text-type__cursor">_</span>
        </div>
      </div>

      {isReady && !logoReady && <p className="intro-skip-hint">click Enter to skip</p>}
      {logoReady && <p className="intro-skip-hint intro-skip-hint--dark">press Enter to continue</p>}
    </div>
  );
}
