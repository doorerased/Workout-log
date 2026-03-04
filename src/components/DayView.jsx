import { useState } from 'react';
import { Plus, RotateCcw, TrendingUp, Lightbulb } from 'lucide-react';
import { COLOR_MAP } from '../data/routines';
import { genId } from '../hooks/useWorkoutLog';
import ExerciseCard from './ExerciseCard';
import TipDrawer from './TipDrawer';
import ProgressPanel from './ProgressPanel';

export default function DayView({
    day, weekKey, prevWeekKey,
    getRoutine, updateRoutine, resetRoutine, isCustomized,
    getLog, updateSet,
}) {
    const [showTip, setShowTip] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const c = COLOR_MAP[day.color];
    const exercises = getRoutine(day.id);

    const addExercise = (name = '새 종목', muscle = '근육군') => {
        const newEx = { id: genId(), name, muscle, sets: 3, reps: 12, type: 'support' };
        updateRoutine(day.id, [...exercises, newEx]);
    };
    const updateEx = (updated) => updateRoutine(day.id, exercises.map(e => e.id === updated.id ? updated : e));
    const removeEx = (id) => updateRoutine(day.id, exercises.filter(e => e.id !== id));
    const totalSets = exercises.reduce((s, e) => s + e.sets, 0);

    // 휴식일
    if (day.rest) return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
            <div className="text-7xl mb-5 select-none">😴</div>
            <h2 className="text-white font-bold text-2xl mb-2">휴식일</h2>
            <p className="text-white/40 text-center text-sm leading-relaxed max-w-[260px]">
                근육이 성장하는 날입니다.<br />충분한 수면과 영양에 집중하세요.
            </p>
            <button onClick={() => setShowTip(true)}
                className="mt-8 px-6 py-3 rounded-2xl bg-slate-500/15 border border-slate-500/30 text-slate-400 text-sm font-semibold hover:bg-slate-500/25 transition-colors flex items-center gap-2">
                <Lightbulb size={14} /> 휴식일 팁 보기
            </button>
            {showTip && <TipDrawer open={showTip} onClose={() => setShowTip(false)} dayId={day.id} color={day.color} onAddExercise={addExercise} />}
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 pt-4 pb-32 space-y-3">

                {/* Day Header */}
                <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex items-center justify-between animate-fade-in`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl select-none">{day.emoji}</span>
                            <span className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>{day.theme}</span>
                        </div>
                        <h2 className="text-white font-bold text-xl">{day.label}</h2>
                        <p className="text-white/40 text-xs mt-0.5">{exercises.length}개 종목 · {totalSets}총 세트</p>
                    </div>
                    {isCustomized(day.id) && (
                        <button onClick={() => resetRoutine(day.id)} title="기본 루틴으로 초기화"
                            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <RotateCcw size={11} /> 초기화
                        </button>
                    )}
                </div>

                {/* Exercise Cards */}
                {exercises.map(ex => (
                    <ExerciseCard
                        key={ex.id} ex={ex} dayId={day.id}
                        weekKey={weekKey} prevWeekKey={prevWeekKey}
                        getLog={getLog} updateSet={updateSet} color={day.color}
                        onUpdateEx={updateEx} onRemove={() => removeEx(ex.id)}
                    />
                ))}

                {/* Add Exercise */}
                <button onClick={() => addExercise()} title="새 종목 추가"
                    className={`w-full py-3.5 rounded-2xl border-2 border-dashed ${c.border} ${c.text}
            text-sm font-semibold flex items-center justify-center gap-2 hover:${c.bg} transition-colors`}>
                    <Plus size={14} /> 종목 추가
                </button>

                {/* Progress Toggle */}
                <button onClick={() => setShowProgress(p => !p)} title="점진적 과부하 통계 보기/숨기기"
                    className={`w-full py-3.5 rounded-2xl border ${c.border} bg-surface-800
            text-sm font-semibold text-white/60 hover:text-white flex items-center justify-center gap-2 transition-colors`}>
                    <TrendingUp size={14} />
                    {showProgress ? '과부하 체크 숨기기' : '📊 과부하 체크 보기'}
                </button>

                {showProgress && (
                    <ProgressPanel
                        dayId={day.id} weekKey={weekKey} prevWeekKey={prevWeekKey}
                        getRoutine={getRoutine} getLog={getLog} color={day.color}
                    />
                )}

                {/* Tip Button */}
                <button onClick={() => setShowTip(true)} title="대체 종목 및 운동 팁 보기"
                    className={`w-full py-3.5 rounded-2xl border ${c.border} bg-surface-800
            text-sm font-semibold ${c.text} flex items-center justify-center gap-2 hover:${c.bg} transition-colors`}>
                    <Lightbulb size={14} /> 대체 종목 &amp; 운동 팁
                </button>
            </div>

            {showTip && (
                <TipDrawer open={showTip} onClose={() => setShowTip(false)} dayId={day.id} color={day.color} onAddExercise={addExercise} />
            )}
        </div>
    );
}
