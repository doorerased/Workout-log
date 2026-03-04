import { useState } from 'react';
import { X, Dumbbell, Lightbulb, Plus } from 'lucide-react';
import { COLOR_MAP } from '../data/routines';
import { ALTERNATIVES } from '../data/alternatives';

export default function TipDrawer({ open, onClose, dayId, color, onAddExercise }) {
    const [tab, setTab] = useState('exercises');
    const c = COLOR_MAP[color];
    const alt = ALTERNATIVES[dayId] ?? { exercises: [], tips: [] };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-lg mx-auto bg-surface-800 rounded-t-3xl border border-white/10 border-b-0 animate-drawer-in max-h-[78vh] flex flex-col">
                {/* Handle */}
                <div className={`w-10 h-1 ${c.btn} rounded-full mx-auto mt-3 mb-1 flex-shrink-0 opacity-70`} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                    <div>
                        <h2 className="text-white font-bold text-base">💡 운동 가이드</h2>
                        <p className={`text-xs ${c.text} mt-0.5`}>대체 종목 추가 / 운동 팁</p>
                    </div>
                    <button onClick={onClose} title="닫기"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 px-5 pb-3 flex-shrink-0">
                    <button onClick={() => setTab('exercises')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all
              ${tab === 'exercises' ? `${c.btn} text-white` : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                        <Dumbbell size={12} /> 대체 종목
                    </button>
                    <button onClick={() => setTab('tips')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all
              ${tab === 'tips' ? `${c.btn} text-white` : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                        <Lightbulb size={12} /> 운동 팁
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-2.5">
                    {tab === 'exercises' && (
                        alt.exercises.length > 0 ? alt.exercises.map((ex, i) => (
                            <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${c.border} bg-surface-700`}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm leading-snug">{ex.name}</p>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.text} mt-1`}>{ex.muscle}</span>
                                    <p className="text-white/45 text-xs mt-1.5 leading-relaxed">{ex.desc}</p>
                                </div>
                                <button
                                    onClick={() => { onAddExercise(ex.name, ex.muscle); onClose(); }}
                                    title="오늘 루틴에 추가"
                                    className={`flex-shrink-0 w-8 h-8 rounded-xl ${c.btn} hover:opacity-80 flex items-center justify-center transition-opacity`}>
                                    <Plus size={14} className="text-white" />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-white/25">
                                <p className="text-4xl mb-2">😴</p>
                                <p className="text-sm">오늘은 휴식일입니다.</p>
                            </div>
                        )
                    )}

                    {tab === 'tips' && (
                        <div className="space-y-3 pt-1">
                            {alt.tips.map((tip, i) => (
                                <div key={i} className={`p-4 rounded-2xl border ${c.border} bg-surface-700 flex gap-3`}>
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${c.badge} flex items-center justify-center text-xs font-bold ${c.text}`}>{i + 1}</div>
                                    <p className="text-white/75 text-sm leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
