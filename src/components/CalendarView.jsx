import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DAYS, COLOR_MAP } from '../data/routines';
import { toDateStr } from '../hooks/useWorkoutLog';
import DayTypeModal from './DayTypeModal';

/**
 * 월간 캘린더 뷰
 * Props:
 *   getDayType  — (dateStr) => dayId | null
 *   setDayType  — (dateStr, dayId | null) => void
 *   dayMap      — { "YYYY-MM-DD": dayId }
 *   onNavigate  — ({ dayId, dateStr, weekOffset }) => void  캘린더→일지 이동
 */
export default function CalendarView({ getDayType, setDayType, dayMap, onNavigate }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
    const [modal, setModal] = useState(null); // { dateStr } | null

    // ── 달 이동 ────────────────────────────────────────────────────────────
    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    // ── 캘린더 날짜 배열 생성 ──────────────────────────────────────────────
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=일
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // 달력 앞 빈칸
    const blanks = Array.from({ length: firstDay });
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // dayId를 DAYS 배열 인덱스로 변환
    const dayById = Object.fromEntries(DAYS.map(d => [d.id, d]));
    const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'];

    // ── 날짜 클릭 ─────────────────────────────────────────────────────────
    const handleDateClick = (dateNum) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
        setModal({ dateStr });
    };

    // ── 팝업에서 타입 선택 ────────────────────────────────────────────────
    const handleSelect = (dayId) => {
        if (!modal) return;
        const { dateStr } = modal;

        if (dayId === null) {
            // 지정 해제
            setDayType(dateStr, null);
            setModal(null);
            return;
        }

        setDayType(dateStr, dayId);
        setModal(null);

        // 일지 뷰로 이동 — dateStr과 dayId만 전달
        onNavigate({ dayId, dateStr });
    };

    // ── 이번 달 통계 ──────────────────────────────────────────────────────
    const monthStats = DAYS.map(d => {
        const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
        const count = Object.entries(dayMap)
            .filter(([k, v]) => k.startsWith(prefix) && v === d.id).length;
        return { ...d, count };
    }).filter(d => d.count > 0);

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">

                {/* ── 월 헤더 ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between py-2">
                    <button onClick={prevMonth} title="이전 달"
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="text-center">
                        <p className="text-white font-bold">{viewYear}년 {MONTH_NAMES[viewMonth]}</p>
                    </div>
                    <button onClick={nextMonth} title="다음 달"
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* ── 요일 헤더 ────────────────────────────────────────── */}
                <div className="grid grid-cols-7 mb-1">
                    {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                        <div key={w} className={`text-center text-xs font-semibold py-1.5
                            ${i === 0 ? 'text-rose-400/70' : i === 6 ? 'text-sky-400/70' : 'text-white/30'}`}>
                            {w}
                        </div>
                    ))}
                </div>

                {/* ── 날짜 그리드 ──────────────────────────────────────── */}
                <div className="grid grid-cols-7 gap-1">
                    {/* 빈칸 */}
                    {blanks.map((_, i) => <div key={`b${i}`} />)}

                    {dates.map(dateNum => {
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                        const thisDate = new Date(viewYear, viewMonth, dateNum);
                        const isToday = thisDate.getTime() === today.getTime();
                        const dayId = getDayType(dateStr);
                        const dayInfo = dayId ? dayById[dayId] : null;
                        const c = dayInfo ? COLOR_MAP[dayInfo.color] : null;
                        const colIdx = (firstDay + dateNum - 1) % 7; // 0=일, 6=토

                        return (
                            <button
                                key={dateNum}
                                onClick={() => handleDateClick(dateNum)}
                                title={dayInfo ? `${dayInfo.label} — ${dayInfo.theme}` : '운동 타입 지정'}
                                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                                    transition-all duration-150 group
                                    ${c ? `${c.bg} border ${c.border}` : 'bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/15'}
                                    ${isToday ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-surface-900' : ''}`}
                            >
                                <span className={`text-xs font-bold leading-none
                                    ${isToday ? 'text-white' : c ? c.text : colIdx === 0 ? 'text-rose-400/80' : colIdx === 6 ? 'text-sky-400/80' : 'text-white/60'}
                                    group-hover:text-white transition-colors`}>
                                    {dateNum}
                                </span>
                                {dayInfo && (
                                    <span className="text-[10px] leading-none select-none">{dayInfo.emoji}</span>
                                )}
                                {isToday && !dayInfo && (
                                    <span className="w-1 h-1 rounded-full bg-white/50 mt-0.5" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── 이번 달 운동 요약 ────────────────────────────────── */}
                {monthStats.length > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarDays size={13} className="text-white/40" />
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">이번 달 운동 현황</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {monthStats.map(d => {
                                const c = COLOR_MAP[d.color];
                                return (
                                    <span key={d.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${c.badge} ${c.text} text-xs font-semibold`}>
                                        {d.emoji} {d.label}
                                        <span className="text-white/40 font-normal">{d.count}회</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── 안내 문구 (데이터가 없을 때) ────────────────────── */}
                {Object.keys(dayMap).length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                        <span className="text-4xl mb-3">📅</span>
                        <p className="text-white/40 text-sm">날짜를 탭하여 운동 타입을 지정하세요</p>
                        <p className="text-white/20 text-xs mt-1">지정 후 바로 해당 운동 일지로 이동합니다</p>
                    </div>
                )}
            </div>

            {/* ── 팝업 ─────────────────────────────────────────────────── */}
            {modal && (
                <DayTypeModal
                    dateStr={modal.dateStr}
                    currentId={getDayType(modal.dateStr)}
                    onSelect={handleSelect}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
