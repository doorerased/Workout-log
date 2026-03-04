import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS, COLOR_MAP } from './data/routines';
import { useWorkoutLog, getWeekKey } from './hooks/useWorkoutLog';
import DayView from './components/DayView';

export default function App() {
  // 오늘이 몇 번째 인덱스인지 (월=0 … 일=6, Workout의 Rest는 3번째)
  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const [dayIdx, setDayIdx] = useState(todayIdx);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekKey = getWeekKey(weekOffset);
  const prevWeekKey = getWeekKey(weekOffset - 1);

  const { getRoutine, updateRoutine, resetRoutine, isCustomized, getLog, updateSet } = useWorkoutLog();

  const weekLabel =
    weekOffset === 0 ? '이번 주'
      : weekOffset === -1 ? '지난 주'
        : `${Math.abs(weekOffset)}주 전`;

  const day = DAYS[dayIdx];
  const c = COLOR_MAP[day.color];

  return (
    <div className="min-h-screen flex flex-col bg-surface-900">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface-900/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4">

          {/* Week Navigator */}
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <button onClick={() => setWeekOffset(p => p - 1)} title="이전 주"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>

            <div className="text-center select-none">
              <p className="text-white font-bold text-sm tracking-tight">🏋️ PPL 운동 일지</p>
              <p className="text-white/35 text-xs mt-0.5">{weekLabel}</p>
            </div>

            <button
              onClick={() => setWeekOffset(p => Math.min(0, p + 1))}
              disabled={weekOffset === 0}
              title="다음 주"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day Tabs — horizontal scroll */}
          <div className="flex gap-1 py-2.5 overflow-x-auto scrollbar-hide">
            {DAYS.map((d, i) => {
              const dc = COLOR_MAP[d.color];
              const active = i === dayIdx;
              return (
                <button key={d.id} onClick={() => setDayIdx(i)}
                  title={`${d.label} — ${d.theme}`}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
                    transition-all whitespace-nowrap
                    ${active ? `${dc.btn} text-white shadow-lg` : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                  <span className="text-sm leading-none">{d.emoji}</span>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <DayView
        day={day}
        weekKey={weekKey}
        prevWeekKey={prevWeekKey}
        getRoutine={getRoutine}
        updateRoutine={updateRoutine}
        resetRoutine={resetRoutine}
        isCustomized={isCustomized}
        getLog={getLog}
        updateSet={updateSet}
      />
    </div>
  );
}
