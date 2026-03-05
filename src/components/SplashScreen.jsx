import { useState, useEffect } from 'react';

// 스플래시 타임라인 (ms)
// 0 → 650ms  : 로고 등장 (splash-enter)
// 650 → 2000ms: 유지
// 2000 → 2550ms: 로고 퇴장 (splash-exit)
// 2550ms      : onDone 호출 → 로그인 화면

const ENTER_END  = 650;
const EXIT_START = 2000;
const DONE_AT    = 2550;

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'hold' | 'exit'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), ENTER_END);
        const t2 = setTimeout(() => setPhase('exit'), EXIT_START);
        const t3 = setTimeout(() => onDone(), DONE_AT);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    const logoClass =
        phase === 'enter' ? 'splash-enter' :
        phase === 'exit'  ? 'splash-exit'  : '';

    return (
        <div className="fixed inset-0 z-[999] bg-surface-900 flex flex-col items-center justify-center overflow-hidden">
            {/* 배경 글로우 (홀드 구간에만 천천히 맥동) */}
            <div className={`absolute w-[480px] h-[480px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none
                ${phase === 'hold' ? 'splash-glow' : 'opacity-0'}`} />

            {/* 로고 + 워드마크 */}
            <div className={`flex flex-col items-center gap-6 select-none ${logoClass}`}>

                {/* 이미지 로고 */}
                <img
                    src="/apexload_logo.png"
                    alt="ApexLoad logo"
                    draggable={false}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_0_36px_rgba(124,58,237,0.45)]"
                />

                {/* 태그라인 */}
                <p className="text-white/30 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium">
                    Track your overload. Own your progress.
                </p>
            </div>

            {/* 하단 로딩 바 */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-28 h-0.5 bg-white/8 rounded-full overflow-hidden">
                <div
                    className="h-full bg-violet-500/60 rounded-full transition-all duration-[2000ms] ease-in-out"
                    style={{ width: phase === 'enter' ? '0%' : phase === 'hold' ? '80%' : '100%' }}
                />
            </div>
        </div>
    );
}
