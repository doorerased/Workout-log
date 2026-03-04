import { useState, useCallback } from 'react';
import { DEFAULT_ROUTINES } from '../data/routines';

// 날짜 기반 주차 키 생성 (오프셋: 0=이번 주, -1=지난 주, ...)
export function getWeekKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

export function calcVolume(sets = []) {
    return sets.reduce((sum, s) => sum + (s.done ? (Number(s.reps) || 0) * (Number(s.weight) || 0) : 0), 0);
}

export function genId() {
    return Math.random().toString(36).slice(2, 9);
}

function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

export function useWorkoutLog() {
    // log: { [weekKey]: { [dayId]: { [exId]: [{done,reps,weight},...] } } }
    const [log, setLog] = useState(() => loadJson('ppl_log', {}));
    // customRoutines: { [dayId]: Exercise[] }
    const [customRoutines, setCustomRoutines] = useState(() => loadJson('ppl_routines', {}));

    const persistLog = useCallback((next) => {
        setLog(next);
        localStorage.setItem('ppl_log', JSON.stringify(next));
    }, []);

    const persistRoutines = useCallback((next) => {
        setCustomRoutines(next);
        localStorage.setItem('ppl_routines', JSON.stringify(next));
    }, []);

    // ── Routine helpers ──────────────────────────────────────────────────────
    const getRoutine = useCallback((dayId) =>
        customRoutines[dayId] ?? DEFAULT_ROUTINES[dayId] ?? [], [customRoutines]);

    const updateRoutine = useCallback((dayId, exercises) =>
        persistRoutines({ ...customRoutines, [dayId]: exercises }), [customRoutines, persistRoutines]);

    const resetRoutine = useCallback((dayId) => {
        const next = { ...customRoutines };
        delete next[dayId];
        persistRoutines(next);
    }, [customRoutines, persistRoutines]);

    const isCustomized = useCallback((dayId) => !!customRoutines[dayId], [customRoutines]);

    // ── Log helpers ──────────────────────────────────────────────────────────
    const getLog = useCallback((weekKey, dayId) =>
        log[weekKey]?.[dayId] ?? {}, [log]);

    const updateSet = useCallback((weekKey, dayId, exId, setIdx, field, value) => {
        const next = JSON.parse(JSON.stringify(log));
        next[weekKey] ??= {};
        next[weekKey][dayId] ??= {};
        next[weekKey][dayId][exId] ??= [];
        while (next[weekKey][dayId][exId].length <= setIdx)
            next[weekKey][dayId][exId].push({ done: false, reps: '', weight: '' });
        next[weekKey][dayId][exId][setIdx] = {
            ...next[weekKey][dayId][exId][setIdx],
            [field]: value,
        };
        persistLog(next);
    }, [log, persistLog]);

    return { getRoutine, updateRoutine, resetRoutine, isCustomized, getLog, updateSet };
}
