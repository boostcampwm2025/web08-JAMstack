import { Bird, Fish, Rabbit } from 'lucide-react';
import { useState } from 'react';

const ANIMATIONS = {
  // 물고기
  swim: `
    @keyframes move-swim {
      0% {
        transform: translateX(-60px) translateY(10px) rotate(-15deg) scale(0.9);
        opacity: 0;
      }
      10% { opacity: 0.4; }  
      25% {
        transform: translateX(50px) translateY(-15px) rotate(5deg) scale(1);
      }
      50% {
        transform: translateX(160px) translateY(10px) rotate(-5deg) scale(1);
      }
      75% {
        transform: translateX(270px) translateY(-10px) rotate(5deg) scale(1);
      }
      90% { opacity: 0.4; }
      100% {
        transform: translateX(400px) translateY(5px) rotate(-10deg) scale(0.9);
        opacity: 0;
      }
    }
  `,

  // 토끼
  hop: `
    @keyframes move-hop {
      0% {
        transform: translateX(-60px) translateY(0) scale(1, 0.8); /* 시작 전 납작 */
        opacity: 0;
      }
      5% { opacity: 0.4; }
      15% {
        transform: translateX(30px) translateY(-25px) rotate(-10deg) scale(0.9, 1.1); /* 공중: 길어짐 */
      }
      30% {
        transform: translateX(100px) translateY(0) rotate(0deg) scale(1.1, 0.8); /* 착지: 납작해짐 */
      }
      45% {
        transform: translateX(160px) translateY(-15px) rotate(-5deg) scale(0.95, 1.05);
      }
      60% {
        transform: translateX(220px) translateY(0) rotate(0deg) scale(1.05, 0.95);
      }
      75% {
        transform: translateX(290px) translateY(-20px) rotate(-8deg) scale(0.9, 1.1);
      }
      90% { opacity: 0.4; }
      100% {
        transform: translateX(400px) translateY(0) scale(1, 1);
        opacity: 0;
      }
    }
  `,

  // 펭귄
  slide: `
    @keyframes move-slide {
      0% {
        /* 시작: 약간 뒤로 당겼다가 (Anticipation) */
        transform: translateX(-60px) rotate(90deg) scale(0.9);
        opacity: 0;
      }
      10% { opacity: 0.4; }
      20% {
        transform: translateX(20px) rotate(85deg) translateY(0);
      }
      50% {
        transform: translateX(180px) rotate(95deg) translateY(-10px); /* 살짝 뜸 */
      }
      100% {
        transform: translateX(420px) rotate(90deg) translateY(0) scale(0.9);
        opacity: 0;
      }
    }
  `,
};

const VARIANTS = [
  {
    id: 'fish',
    icon: Fish,
    animationCss: ANIMATIONS.swim,
    animationName: 'move-swim',
    duration: '8s',
    yOffset: '0px',
  },
  {
    id: 'rabbit',
    icon: Rabbit,
    animationCss: ANIMATIONS.hop,
    animationName: 'move-hop',
    duration: '7s',
    yOffset: '2px',
  },
  {
    id: 'penguin',
    icon: Bird,
    animationCss: ANIMATIONS.slide,
    animationName: 'move-slide',
    duration: '7s',
    yOffset: '4px',
  },
];

export function ProfileBannerAnimation() {
  const [index, setIndex] = useState(0);

  const variant = VARIANTS[index];
  const Icon = variant.icon;

  const handleNextAnimation = () => {
    setIndex((prev) => (prev + 1) % VARIANTS.length);
  };

  return (
    <>
      <style>{variant.animationCss}</style>
      <div
        className="pointer-events-none absolute top-1/2 left-0 text-white/50 select-none"
        style={{
          marginTop: variant.yOffset,
          animation: `${variant.animationName} ${variant.duration} linear infinite`,
        }}
        onAnimationIteration={handleNextAnimation}
      >
        <Icon size={28} strokeWidth={2} />
      </div>
    </>
  );
}
