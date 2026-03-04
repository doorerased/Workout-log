import { useState } from 'react';
import { Check, Pencil, Trash2, ChevronDown, Plus, Minus } from 'lucide-react';
import { COLOR_MAP } from '../data/routines';
import { calcVolume } from '../hooks/useWorkoutLog';

// ── 과부하 뱃지 ────────────────────────────────────────────────────────────
function OverloadBadge({ current, prev }) {
    if (!prev || prev === 0 || current === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    if (pct > 0) return (
        <span title={`이전 주 대비 +${pct}% 볼륨 증가`}
            className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
            ▲ {pct}%
        </span>
    );
    if (pct < 0) return (
        <span title={`이전 주 대비 ${Math.abs(pct)}% 볼륨 감소`}
            className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold">
            ▼ {Math.abs(pct)}%
        </span>
    );
    return (
        <span title="이전 주와 동일한 볼륨"
            className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
            — 유지
        </span>
    );
}

// ── 세트 행 ────────────────────────────────────────────────────────────────
function SetRow({ setIdx, data, onChange, color }) {
    const c = COLOR_MAP[color];
    return (
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors ${data.done ? 'bg-white/5' : ''}`}>
            {/* 완료 체크 */}
            <button
                title="세트 완료 체크"
                onClick={() => onChange('done', !data.done)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${data.done ? `${c.btn} border-transparent` : 'border-white/30 hover:border-white/60'}`}
            >
                {data.done && <Check size={10} strokeWidth={3} className="text-white" />}
            </button>
            <span className="text-white/30 text-xs w-4 text-center select-none">{setIdx + 1}</span>

            {/* 반복 횟수 */}
            <div className="flex-1 relative">
                <input
                    type="number" min="0" value={data.reps}
                    onChange={e => onChange('reps', e.target.value)}
                    placeholder="횟수"
                    title="반복 횟수 입력"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-center
            outline-none focus:ring-2 ${c.ring} transition-all placeholder:text-white/20
            ${data.done ? 'opacity-50' : ''}`}
                />
                <span className="absolute right-2 top-1.5 text-white/25 text-xs pointer-events-none">회</span>
            </div>

            {/* 중량 */}
            <div className="flex-1 relative">
                <input
                    type="number" min="0" step="0.5" value={data.weight}
                    onChange={e => onChange('weight', e.target.value)}
                    placeholder="중량"
                    title="사용 중량 입력"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-center
            outline-none focus:ring-2 ${c.ring} transition-all placeholder:text-white/20
            ${data.done ? 'opacity-50' : ''}`}
                />
                <span className="absolute right-2 top-1.5 text-white/25 text-xs pointer-events-none">kg</span>
            </div>
        </div>
    );
}

// ── 종목 카드 ─────────────────────────────────────────────────────────────
const TYPE_LABELS = {
    focus: { label: '🎯 Focus', cls: '' },
    support: { label: '⚙️ 보조', cls: '' },
    arm: { label: '💪 팔', cls: '' },
    calf: { label: '🦶 종아리', cls: '' },
};

export default function ExerciseCard({
    ex, dayId, weekKey, prevWeekKey, getLog, updateSet, onUpdateEx, onRemove, color,
}) {
    const [expanded, setExpanded] = useState(true);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ name: ex.name, sets: ex.sets, reps: ex.reps });

    const c = COLOR_MAP[color];
    const logData = getLog(weekKey, dayId)[ex.id] ?? [];
    const prevData = getLog(prevWeekKey, dayId)[ex.id] ?? [];
    const currVol = calcVolume(logData);
    const prevVol = calcVolume(prevData);

    const sets = Array.from({ length: ex.sets }, (_, i) => logData[i] ?? { done: false, reps: '', weight: '' });
    const done = sets.filter(s => s.done).length;
    const tl = TYPE_LABELS[ex.type] ?? TYPE_LABELS.support;

    const saveEdit = () => { onUpdateEx({ ...ex, ...draft, sets: Number(draft.sets), reps: Number(draft.reps) }); setEditing(false); };

    return (
        <div className={`rounded-2xl border ${c.border} bg-surface-800 overflow-hidden animate-slide-up`}>
            {/* Card Header */}
            <div className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="space-y-2">
                            <input
                                value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                                title="종목 이름 수정"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none"
                                placeholder="종목명"
                            />
                            <div className="flex gap-2">
                                <label className="flex-1">
                                    <span className="text-white/40 text-xs block mb-1">세트 수</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setDraft(p => ({ ...p, sets: Math.max(1, p.sets - 1) }))}
                                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                                            <Minus size={12} />
                                        </button>
                                        <span className="flex-1 text-center text-white font-bold">{draft.sets}</span>
                                        <button onClick={() => setDraft(p => ({ ...p, sets: Math.min(10, p.sets + 1) }))}
                                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </label>
                                <label className="flex-1">
                                    <span className="text-white/40 text-xs block mb-1">기본 반복</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setDraft(p => ({ ...p, reps: Math.max(1, p.reps - 1) }))}
                                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                                            <Minus size={12} />
                                        </button>
                                        <span className="flex-1 text-center text-white font-bold">{draft.reps}</span>
                                        <button onClick={() => setDraft(p => ({ ...p, reps: Math.min(50, p.reps + 1) }))}
                                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={saveEdit} className={`flex-1 py-2 rounded-xl text-xs font-bold text-white ${c.btn} hover:opacity-90 transition-opacity`}>저장</button>
                                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white/50 bg-white/10 hover:bg-white/15 transition-colors">취소</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.text} font-medium`}>{tl.label}</span>
                                <span className="text-white/30 text-xs">{ex.muscle}</span>
                                <OverloadBadge current={currVol} prev={prevVol} />
                            </div>
                            <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{ex.name}</h3>
                            <p className="text-white/35 text-xs mt-0.5">{ex.sets}세트 × {ex.reps}회 기준 · 완료 {done}/{ex.sets}</p>
                        </>
                    )}
                </div>

                {!editing && (
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        <button onClick={() => { setDraft({ name: ex.name, sets: ex.sets, reps: ex.reps }); setEditing(true); }}
                            title="종목 편집" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                            <Pencil size={11} />
                        </button>
                        <button onClick={onRemove} title="종목 삭제"
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all">
                            <Trash2 size={11} />
                        </button>
                        <button onClick={() => setExpanded(p => !p)} title={expanded ? '접기' : '세트 펼치기'}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                            <ChevronDown size={12} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                )}
            </div>

            {/* Set Rows */}
            {expanded && !editing && (
                <div className="px-4 pb-4 space-y-1">
                    {sets.map((s, i) => (
                        <SetRow
                            key={i} setIdx={i} data={s} color={color}
                            onChange={(field, val) => updateSet(weekKey, dayId, ex.id, i, field, val)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
