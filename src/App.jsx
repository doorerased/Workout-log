import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Save, RefreshCw } from 'lucide-react';
import { DAYS, COLOR_MAP } from './data/routines';
import { useWorkoutLog, toDateStr } from './hooks/useWorkoutLog';
import DayView from './components/DayView';
import CalendarView from './components/CalendarView';
import DayTypeModal from './components/DayTypeModal';

export default function App() {
  // ── 뷰 상태 ────────────────────────────────────────────────────────────
  const [view, setView] = useState('calendar'); // 'calendar' | 'journal'
  const [currentEntry, setCurrentEntry] = useState(null); // { dateStr, dayId }
  const [saveToast, setSaveToast] = useState(false);
  const [changeTypeModal, setChangeTypeModal] = useState(false);

  const {
    getRoutine, updateRoutine, resetRoutine, isCustomized,
    getLog, updateSet, getPrevDateStr,
    getDayType, setDayType, dayMap,
    forceSave,
  } = useWorkoutLog();

  // ── 캘린더 → 일지 이동 ────────────────────────────────────────────────
  const handleCalendarNavigate = useCallback(({ dayId, dateStr }) => {
    setCurrentEntry({ dateStr, dayId });
    setView('journal');
  }, []);

  // ── 일지 → 캘린더 뒤로 가기 ──────────────────────────────────────────
  const handleBack = () => {
    setCurrentEntry(null);
    setView('calendar');
  };

  // ── 루틴 변경 (일지 뷰 헤더 버튼) ────────────────────────────────────
  const handleChangeType = (newDayId) => {
    if (!currentEntry) return;
    setChangeTypeModal(false);
    if (newDayId === null) {
      // 타입 해제 → 캘린더로 복귀
      setDayType(currentEntry.dateStr, null);
      handleBack();
      return;
    }
    setDayType(currentEntry.dateStr, newDayId);
    setCurrentEntry(prev => ({ ...prev, dayId: newDayId }));
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

            {/* 왼쪽: 뒤로가기 or 캘린더 타이틀 */}
            {view === 'journal' ? (
              <button onClick={handleBack} title="캘린더로 돌아가기"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-semibold">
                <ChevronLeft size={14} /> 캘린더
              </button>
            ) : (
              <div className="px-1">
                <p className="text-white/40 text-xs font-semibold">🏋️ PPL 운동 일지</p>
              </div>
            )}

            {/* 가운데: 제목 */}
            <div className="text-center select-none">
              {view === 'journal' && currentEntry ? (
                <>
                  <p className="text-white font-bold text-sm tracking-tight">🏋️ PPL 운동 일지</p>
                  <p className="text-white/35 text-xs mt-0.5">{currentEntry.dateStr}</p>
                </>
              ) : (
                <p className="text-white/60 font-bold text-sm">운동 캘린더</p>
              )}
            </div>

            {/* 오른쪽: 저장 버튼(일지) or 공백 */}
            {view === 'journal' ? (
              <button
                onClick={() => { forceSave(); setSaveToast(true); setTimeout(() => setSaveToast(false), 2000); }}
                title="저장 (Ctrl+S)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs font-semibold">
                <Save size={13} /> 저장
              </button>
            ) : (
              <div className="w-[72px]" />
            )}
          </div>

          {/* 일지 뷰: 루틴 이름 + 변경 버튼 서브헤더 */}
          {view === 'journal' && currentDay && (
            <div className="flex items-center gap-2 py-2 border-t border-white/5">
              <span className="text-lg select-none">{currentDay.emoji}</span>
              <span className={`text-sm font-bold ${COLOR_MAP[currentDay.color].text}`}>
                {currentDay.label}
              </span>
              <span className="text-white/30 text-xs">— {currentDay.theme}</span>
              <button
                onClick={() => setChangeTypeModal(true)}
                title="이 날짜의 루틴 변경"
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70 transition-all text-xs">
                <RefreshCw size={10} /> 변경
              </button>
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

      {/* ── 루틴 변경 팝업 ───────────────────────────────────────────────── */}
      {changeTypeModal && currentEntry && (
        <DayTypeModal
          dateStr={currentEntry.dateStr}
          currentId={currentEntry.dayId}
          onSelect={handleChangeType}
          onClose={() => setChangeTypeModal(false)}
        />
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
