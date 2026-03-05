import { useEffect } from 'react';
import { X } from 'lucide-react';
import { DAYS, COLOR_MAP } from '../data/routines';

/**
 * 날짜 클릭 시 나타나는 운동 타입 선택 팝업
 * Props:
 *   dateStr   — "YYYY-MM-DD"
 *   currentId — 이미 지정된 dayId (없으면 null)
 *   onSelect  — (dayId) => void
 *   onClose   — () => void
 */
export default function DayTypeModal({ dateStr, currentId, onSelect, onClose }) {
    // ESC 키 닫기
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // 날짜 포맷 (예: 2026년 3월 5일 목요일)
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
    const label = `${year}년 ${month}월 ${day}일 (${WEEKDAY[dateObj.getDay()]})`;

    return (
        /* 오버레이 */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={onClose}
        >
            {/* 배경 블러 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* 패널 */}
            <div
                className="relative z-10 w-full max-w-sm bg-surface-800 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
                    <div>
                        <p className="text-white font-bold text-sm">운동 타입 선택</p>
                        <p className="text-white/40 text-xs mt-0.5">{label}</p>
                    </div>
                    <button
                        onClick={onClose}
                        title="닫기"
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* 운동 타입 목록 */}
                <div className="p-4 space-y-2">
                    {DAYS.map(d => {
                        const c = COLOR_MAP[d.color];
                        const active = currentId === d.id;
                        return (
                            <button
                                key={d.id}
                                onClick={() => onSelect(d.id)}
                                title={`${d.label} — ${d.theme}`}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left
                                    ${active
                                        ? `${c.bg} ${c.border} ${c.text}`
                                        : 'bg-white/3 border-white/8 text-white/70 hover:bg-white/8 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl select-none w-7 text-center">{d.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm leading-tight">{d.label}</p>
                                    <p className="text-xs opacity-60 mt-0.5">{d.theme}</p>
                                </div>
                                {active && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.text} font-semibold flex-shrink-0`}>
                                        선택됨
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 초기화 버튼 (이미 타입이 지정된 경우만) */}
                {currentId && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={() => onSelect(null)}
                            title="이 날짜의 운동 타입 지정 해제"
                            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/15 border border-white/8 hover:border-rose-500/30 text-white/40 hover:text-rose-400 text-xs font-semibold transition-all"
                        >
                            타입 지정 해제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
