import { useState, useEffect } from 'react';

const ENTER_END  = 700;
const EXIT_START = 2100;
const DONE_AT    = 2700;

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), ENTER_END);
        const t2 = setTimeout(() => setPhase('exit'), EXIT_START);
        const t3 = setTimeout(() => onDone(), DONE_AT);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    const wrapClass =
        phase === 'enter' ? 'splash-enter' :
        phase === 'exit'  ? 'splash-exit'  : '';

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
             style={{ background: '#000000' }}>

            {/* 배경 레드 글로우 (hold 구간) */}
            <div
                className="absolute w-[600px] h-[200px] rounded-full pointer-events-none transition-opacity duration-700"
                style={{
                    background: 'radial-gradient(ellipse, rgba(220,38,38,0.18) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    opacity: phase === 'hold' ? 1 : 0,
                }}
            />

            {/* 로고 텍스트 */}
            <div className={`select-none ${wrapClass}`}>
                <span
                    className="font-black tracking-tighter"
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        color: '#dc2626',
                        textShadow: '0 0 40px rgba(220,38,38,0.7), 0 0 80px rgba(220,38,38,0.35)',
                    }}
                >
                    Apex
                </span>
                <span
                    className="font-black tracking-tighter"
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        color: '#ef4444',
                        textShadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.25)',
                    }}
                >
                    Load
                </span>
            </div>

            {/* 하단 로딩 바 */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-px bg-white/8 overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{
                        background: 'linear-gradient(to right, #dc2626, #ef4444)',
                        width: phase === 'enter' ? '0%' : phase === 'hold' ? '75%' : '100%',
                        transition: 'width 2s ease-in-out',
                    }}
                />
            </div>
        </div>
    );
}
