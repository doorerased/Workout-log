import { BarChart2 } from 'lucide-react';
import { COLOR_MAP } from '../data/routines';
import { calcVolume } from '../hooks/useWorkoutLog';

function OverloadBadge({ current, prev }) {
    if (!prev || prev === 0 || current === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    if (pct > 0) return <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">▲ {pct}%</span>;
    if (pct < 0) return <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold">▼ {Math.abs(pct)}%</span>;
    return <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">— 유지</span>;
}

// ★ dateStr/prevDateStr 기반 — 같은 루틴의 직전 날짜와 볼륨 비교
export default function ProgressPanel({ dayId, dateStr, prevDateStr, getRoutine, getLog, color }) {
    const c = COLOR_MAP[color];
    const exercises = getRoutine(dayId);

    const rows = exercises
        .map(ex => ({
            name: ex.name,
            curr: calcVolume(getLog(dateStr, dayId)[ex.id] ?? []),
            prev: prevDateStr ? calcVolume(getLog(prevDateStr, dayId)[ex.id] ?? []) : 0,
        }))
        .filter(r => r.curr > 0 || r.prev > 0);

    if (rows.length === 0) return (
        <div className={`rounded-2xl border border-dashed ${c.border} p-6 text-center`}>
            <p className="text-white/25 text-sm">세트를 완료하면 볼륨 통계가 여기 표시됩니다.</p>
        </div>
    );

    return (
        <div className={`rounded-2xl border ${c.border} bg-surface-800 overflow-hidden`}>
            <div className={`px-4 py-3 border-b border-white/5 flex items-center gap-2 ${c.bg}`}>
                <BarChart2 size={14} className={c.text} />
                <span className="text-white font-semibold text-sm">점진적 과부하 체크</span>
                <span className="text-xs text-white/30 ml-auto">볼륨 = 세트 × 반복 × 중량</span>
            </div>

            {/* 비교 기준 날짜 표시 */}
            {prevDateStr && (
                <div className="px-4 pt-2 pb-0">
                    <p className="text-white/25 text-xs">직전 {dayId.replace(/\d/, '')} 루틴 날짜: {prevDateStr}</p>
                </div>
            )}

            <div className="divide-y divide-white/5">
                {rows.map((r, i) => {
                    const maxVol = Math.max(r.curr, r.prev, 1);
                    return (
                        <div key={i} className="px-4 py-3.5">
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-white/80 text-xs font-medium truncate flex-1 mr-2">{r.name}</p>
                                <OverloadBadge current={r.curr} prev={r.prev} />
                            </div>

                            <div className="space-y-2">
                                {/* 오늘 */}
                                <div className="flex items-center gap-2">
                                    <span className="text-white/30 text-xs w-12 text-right flex-shrink-0">오늘</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full ${c.btn} rounded-full transition-all duration-700`}
                                            style={{ width: `${(r.curr / maxVol) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-mono ${c.text} w-16 text-right flex-shrink-0`}>
                                        {r.curr > 0 ? r.curr.toLocaleString() : '-'}
                                    </span>
                                </div>
                                {/* 직전 같은 루틴 */}
                                <div className="flex items-center gap-2">
                                    <span className="text-white/30 text-xs w-12 text-right flex-shrink-0">직전</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-white/25 rounded-full transition-all duration-700"
                                            style={{ width: `${(r.prev / maxVol) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-white/40 w-16 text-right flex-shrink-0">
                                        {r.prev > 0 ? r.prev.toLocaleString() : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
