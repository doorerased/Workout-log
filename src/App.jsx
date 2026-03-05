import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, CalendarDays, BookOpen, Save } from 'lucide-react';
import { DAYS, COLOR_MAP } from './data/routines';
import { useWorkoutLog, toDateStr } from './hooks/useWorkoutLog';
import DayView from './components/DayView';
import CalendarView from './components/CalendarView';

export default function App() {
  // ── 뷰 상태 ────────────────────────────────────────────────────────────
  // 초기 화면은 캘린더
  const [view, setView] = useState('calendar'); // 'calendar' | 'journal'

  // 현재 열려 있는 일지: { dateStr, dayId }
  const [currentEntry, setCurrentEntry] = useState(null);

  // 저장 토스트 표시
  const [saveToast, setSaveToast] = useState(false);

  const {
    getRoutine, updateRoutine, resetRoutine, isCustomized,
    getLog, updateSet, getPrevDateStr,
    getDayType, setDayType, dayMap,
    forceSave,
  } = useWorkoutLog();

  // ── 캘린더에서 날짜+타입 선택 → 일지 뷰로 이동 ──────────────────────
  const handleCalendarNavigate = useCallback(({ dayId, dateStr }) => {
    setCurrentEntry({ dateStr, dayId });
    setView('journal');
  }, []);

  // ── 일지 → 캘린더로 뒤로 가기 ────────────────────────────────────────
  const handleBack = () => {
    setCurrentEntry(null);
    setView('calendar');
  };

  // ── Ctrl+S 저장 ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        forceSave();
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [forceSave]);

  // ── 현재 일지 정보 계산 ───────────────────────────────────────────────
  const currentDay = currentEntry ? DAYS.find(d => d.id === currentEntry.dayId) : null;
  const prevDateStr = currentEntry
    ? getPrevDateStr(currentEntry.dateStr, currentEntry.dayId)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-900">

      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface-900/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between py-3">

            {/* 왼쪽: 뒤로가기(일지 뷰) or 캘린더 아이콘 */}
            {view === 'journal' ? (
              <button
                onClick={handleBack}
                title="캘린더로 돌아가기"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-semibold"
              >
                <ChevronLeft size={14} />
                캘린더
              </button>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <CalendarDays size={16} className="text-white/40" />
                <span className="text-white/40 text-xs font-semibold">캘린더</span>
              </div>
            )}

            {/* 가운데: 앱 타이틀 */}
            <div className="text-center select-none">
              <p className="text-white font-bold text-sm tracking-tight">🏋️ PPL 운동 일지</p>
              {view === 'journal' && currentEntry && (
                <p className="text-white/35 text-xs mt-0.5">{currentEntry.dateStr}</p>
              )}
            </div>

            {/* 오른쪽: 저장 버튼(일지 뷰) or 빈 공간 */}
            {view === 'journal' ? (
              <button
                onClick={() => { forceSave(); setSaveToast(true); setTimeout(() => setSaveToast(false), 2000); }}
                title="저장 (Ctrl+S)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-semibold"
              >
                <Save size={13} />
                저장
              </button>
            ) : (
              <div className="w-[72px]" />
            )}
          </div>

          {/* 일지 뷰: 루틴 정보 서브헤더 */}
          {view === 'journal' && currentDay && (
            <div className={`flex items-center gap-2 py-2 border-t border-white/5`}>
              <span className="text-lg select-none">{currentDay.emoji}</span>
              <span className={`text-sm font-bold ${COLOR_MAP[currentDay.color].text}`}>
                {currentDay.label}
              </span>
              <span className="text-white/30 text-xs">— {currentDay.theme}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      {view === 'calendar' ? (
        <CalendarView
          getDayType={getDayType}
          setDayType={setDayType}
          dayMap={dayMap}
          onNavigate={handleCalendarNavigate}
        />
      ) : (
        currentDay && currentEntry ? (
          <DayView
            day={currentDay}
            dateStr={currentEntry.dateStr}
            prevDateStr={prevDateStr}
            getRoutine={getRoutine}
            updateRoutine={updateRoutine}
            resetRoutine={resetRoutine}
            isCustomized={isCustomized}
            getLog={getLog}
            updateSet={updateSet}
          />
        ) : null
      )}

      {/* ── Ctrl+S 저장 토스트 ───────────────────────────────────────────── */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-800 border border-white/10 shadow-2xl backdrop-blur-xl">
            <Save size={14} className="text-emerald-400" />
            <span className="text-white text-sm font-semibold">저장되었습니다</span>
          </div>
        </div>
      )}
    </div>
  );
}
