import { useState } from 'react';
import { Check, Pencil, Trash2, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { COLOR_MAP } from '../data/routines';
import { calcVolume } from '../hooks/useWorkoutLog';

// ── 상수: 선택 가능한 범위 ────────────────────────────────────────────────
const SETS_OPTIONS  = Array.from({ length: 11 }, (_, i) => i);          // 0~10
const REPS_OPTIONS  = Array.from({ length: 31 }, (_, i) => i);          // 0~30
const WEIGHT_OPTIONS = Array.from({ length: 41 }, (_, i) => i * 5);    // 0~200 (5kg 단위)

// ── 타입 목록 ─────────────────────────────────────────────────────────────
const TYPE_LIST = [
    { value: 'focus',   label: '🎯 Focus' },
    { value: 'support', label: '⚙️ 보조' },
    { value: 'arm',     label: '💪 팔' },
    { value: 'calf',    label: '🦶 종아리' },
];
const TYPE_LABELS = Object.fromEntries(TYPE_LIST.map(t => [t.value, t]));

// ── SelectOrInput: 목록에서 선택 또는 직접 입력 ───────────────────────────
function SelectOrInput({ value, options, unit = '', onChange, ring = 'focus:ring-white/20', disabled = false }) {
    const numVal = value === '' || value === null || value === undefined ? '' : Number(value);
    const inList = numVal === '' ? false : options.includes(numVal);
    const [custom, setCustom] = useState(!inList && numVal !== '');

    const baseCls = `w-full bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-white text-xs text-center outline-none focus:ring-2 ${ring} transition-all disabled:opacity-40`;

    if (custom) {
        return (
            <div className="flex items-center gap-1 w-full">
                <input
                    type="number" min="0" step={unit === 'kg' ? 2.5 : 1}
                    value={value} disabled={disabled}
                    onChange={e => onChange(e.target.value)}
                    placeholder="직접"
                    className={baseCls + ' flex-1'}
                />
                {unit && <span className="text-white/25 text-[10px] flex-shrink-0">{unit}</span>}
                <button onClick={() => setCustom(false)}
                    className="text-white/25 text-[10px] hover:text-white/50 flex-shrink-0 leading-none">목록</button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 w-full">
            <select
                value={numVal === '' ? '' : String(numVal)}
                disabled={disabled}
                onChange={e => {
                    if (e.target.value === '__d') { setCustom(true); onChange(''); return; }
                    onChange(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className={baseCls + ' flex-1 appearance-none cursor-pointer'}
                style={{ WebkitAppearance: 'none' }}
            >
                <option value="" style={{ background: '#1a1a2e' }}>-</option>
                {options.map(o => (
                    <option key={o} value={String(o)} style={{ background: '#1a1a2e' }}>
                        {o}{unit}
                    </option>
                ))}
                <option value="__d" style={{ background: '#1a1a2e' }}>✏️ 직접 입력</option>
            </select>
            {unit && !custom && <span className="text-white/25 text-[10px] flex-shrink-0">{unit}</span>}
        </div>
    );
}

// ── 과부하 뱃지 ────────────────────────────────────────────────────────────
function OverloadBadge({ current, prev }) {
    if (!prev || prev === 0 || current === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    if (pct > 0) return (
        <span title={`직전 동일 루틴 대비 +${pct}% 볼륨 증가`}
            className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">▲ {pct}%</span>
    );
    if (pct < 0) return (
        <span title={`직전 동일 루틴 대비 ${Math.abs(pct)}% 볼륨 감소`}
            className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold">▼ {Math.abs(pct)}%</span>
    );
    return <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">— 유지</span>;
}

// ── 세트 행 ────────────────────────────────────────────────────────────────
function SetRow({ setIdx, data, onChange, color }) {
    const c = COLOR_MAP[color];
    return (
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors ${data.done ? 'bg-white/5' : ''}`}>
            {/* 완료 체크 */}
            <button title="세트 완료 체크" onClick={() => onChange('done', !data.done)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${data.done ? `${c.btn} border-transparent` : 'border-white/30 hover:border-white/60'}`}>
                {data.done && <Check size={10} strokeWidth={3} className="text-white" />}
            </button>
            <span className="text-white/30 text-xs w-4 text-center select-none">{setIdx + 1}</span>

            {/* 반복 횟수: 0~30 선택 또는 직접 입력 */}
            <div className="flex-1">
                <SelectOrInput
                    value={data.reps} options={REPS_OPTIONS} unit="회"
                    onChange={val => onChange('reps', val)}
                    ring={c.ring} disabled={data.done}
                />
            </div>

            {/* 중량: 0~200kg 5kg 단위 선택 또는 직접 입력 */}
            <div className="flex-1">
                <SelectOrInput
                    value={data.weight} options={WEIGHT_OPTIONS} unit="kg"
                    onChange={val => onChange('weight', val)}
                    ring={c.ring} disabled={data.done}
                />
            </div>
        </div>
    );
}

// ── 종목 카드 ─────────────────────────────────────────────────────────────
export default function ExerciseCard({
    ex, dayId,
    dateStr, prevDateStr,
    getLog, updateSet, onUpdateEx, onRemove, color,
    canMoveUp, canMoveDown, onMoveUp, onMoveDown,
}) {
    const [expanded, setExpanded] = useState(true);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ name: ex.name, muscle: ex.muscle, sets: ex.sets, reps: ex.reps, type: ex.type });

    const c = COLOR_MAP[color];
    const logData = getLog(dateStr, dayId)[ex.id] ?? [];
    const prevData = prevDateStr ? (getLog(prevDateStr, dayId)[ex.id] ?? []) : [];
    const currVol = calcVolume(logData);
    const prevVol = calcVolume(prevData);

    const sets = Array.from({ length: ex.sets }, (_, i) => logData[i] ?? { done: false, reps: '', weight: '' });
    const done = sets.filter(s => s.done).length;
    const tl = TYPE_LABELS[ex.type] ?? TYPE_LABELS.support;

    const openEdit = () => {
        setDraft({ name: ex.name, muscle: ex.muscle, sets: ex.sets, reps: ex.reps, type: ex.type });
        setEditing(true);
    };
    const saveEdit = () => {
        onUpdateEx({ ...ex, ...draft, sets: Number(draft.sets) || 0, reps: Number(draft.reps) || 0 });
        setEditing(false);
    };

    return (
        <div className={`rounded-2xl border ${c.border} bg-surface-800 overflow-hidden animate-slide-up`}>
            {editing ? (
                        /* ── 편집 모드 ────────────────────────────────────────── */
                        <div className="p-4 space-y-2">
                            {/* 종목명 */}
                            <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                                title="종목명 수정"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none"
                                placeholder="종목명" />
                            {/* 근육군 */}
                            <input value={draft.muscle} onChange={e => setDraft(p => ({ ...p, muscle: e.target.value }))}
                                title="근육군 수정"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none"
                                placeholder="근육군 (예: 가슴, 어깨)" />

                            {/* 타입 선택 */}
                            <div>
                                <span className="text-white/40 text-xs block mb-1">종목 타입</span>
                                <div className="grid grid-cols-4 gap-1">
                                    {TYPE_LIST.map(t => (
                                        <button key={t.value} onClick={() => setDraft(p => ({ ...p, type: t.value }))}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition-all
                                                ${draft.type === t.value ? `${c.btn} text-white` : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 세트 수: 0~10 선택 */}
                            <div className="flex gap-2">
                                <label className="flex-1">
                                    <span className="text-white/40 text-xs block mb-1">세트 수</span>
                                    <SelectOrInput
                                        value={draft.sets} options={SETS_OPTIONS}
                                        onChange={val => setDraft(p => ({ ...p, sets: val }))}
                                        ring={c.ring}
                                    />
                                </label>
                                {/* 기본 반복: 0~30 선택 */}
                                <label className="flex-1">
                                    <span className="text-white/40 text-xs block mb-1">기본 반복</span>
                                    <SelectOrInput
                                        value={draft.reps} options={REPS_OPTIONS} unit="회"
                                        onChange={val => setDraft(p => ({ ...p, reps: val }))}
                                        ring={c.ring}
                                    />
                                </label>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button onClick={saveEdit}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold text-white ${c.btn} hover:opacity-90 transition-opacity`}>저장</button>
                                <button onClick={() => setEditing(false)}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white/50 bg-white/10 hover:bg-white/15 transition-colors">취소</button>
                            </div>
                        </div>
                    ) : (
                        /* ── 보기 모드: 상단 가로 버튼 바 ──────────────────────── */
                        <div className="p-4">
                            {/* 1행: 뱃지 + 가로 버튼 */}
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.text} font-medium`}>{tl.label}</span>
                                    <span className="text-white/30 text-xs">{ex.muscle}</span>
                                    <OverloadBadge current={currVol} prev={prevVol} />
                                </div>
                                {/* 가로 버튼 그룹 */}
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                    <button onClick={onMoveUp} disabled={!canMoveUp} title="위로 이동"
                                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                                        <ArrowUp size={10} />
                                    </button>
                                    <button onClick={onMoveDown} disabled={!canMoveDown} title="아래로 이동"
                                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                                        <ArrowDown size={10} />
                                    </button>
                                    <button onClick={openEdit} title="종목 편집"
                                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                                        <Pencil size={10} />
                                    </button>
                                    <button onClick={onRemove} title="종목 삭제"
                                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-white/30 hover:text-rose-400 transition-all">
                                        <Trash2 size={10} />
                                    </button>
                                    <button onClick={() => setExpanded(p => !p)} title={expanded ? '접기' : '펼치기'}
                                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                                        <ChevronDown size={11} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            {/* 2행: 종목명 + 세트 정보 */}
                            <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{ex.name}</h3>
                            <p className="text-white/35 text-xs mt-0.5">{ex.sets}세트 × {ex.reps}회 기준 · 완료 {done}/{ex.sets}</p>
                        </div>
                    )}


            {/* Set Rows */}
            {expanded && !editing && (
                <div className="px-4 pb-4 space-y-1">
                    {sets.map((s, i) => (
                        <SetRow
                            key={i} setIdx={i} data={s} color={color}
                            onChange={(field, val) => updateSet(dateStr, dayId, ex.id, i, field, val)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
