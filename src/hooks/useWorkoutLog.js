import { useState, useCallback } from 'react';
import { DEFAULT_ROUTINES } from '../data/routines';

// Date → "YYYY-MM-DD" 문자열
export function toDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    // ★ log: { [dateStr]: { [dayId]: { [exId]: [{done,reps,weight},...] } } }
    //   날짜(dateStr)별로 완전 독립 저장. 키를 ppl_log_v2로 변경.
    const [log, setLog] = useState(() => loadJson('ppl_log_v2', {}));
    // customRoutines: { [dayId]: Exercise[] }
    const [customRoutines, setCustomRoutines] = useState(() => loadJson('ppl_routines', {}));
    // dayMap: { "YYYY-MM-DD": dayId }
    const [dayMap, setDayMap] = useState(() => loadJson('ppl_day_map', {}));

    const persistLog = useCallback((next) => {
        setLog(next);
        localStorage.setItem('ppl_log_v2', JSON.stringify(next));
    }, []);

    const persistRoutines = useCallback((next) => {
        setCustomRoutines(next);
        localStorage.setItem('ppl_routines', JSON.stringify(next));
    }, []);

    const persistDayMap = useCallback((next) => {
        setDayMap(next);
        localStorage.setItem('ppl_day_map', JSON.stringify(next));
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

    // ── Log helpers — dateStr 기반 날짜별 독립 ───────────────────────────────
    // 특정 날짜+루틴의 세트 기록 반환
    const getLog = useCallback((dateStr, dayId) =>
        log[dateStr]?.[dayId] ?? {}, [log]);

    // 같은 dayId를 사용한 직전 날짜 (과부하 비교용)
    const getPrevDateStr = useCallback((dateStr, dayId) => {
        const allDates = Object.keys(dayMap)
            .filter(d => d < dateStr && dayMap[d] === dayId)
            .sort();
        return allDates.length > 0 ? allDates[allDates.length - 1] : null;
    }, [dayMap]);

    const updateSet = useCallback((dateStr, dayId, exId, setIdx, field, value) => {
        const next = JSON.parse(JSON.stringify(log));
        next[dateStr] ??= {};
        next[dateStr][dayId] ??= {};
        next[dateStr][dayId][exId] ??= [];
        while (next[dateStr][dayId][exId].length <= setIdx)
            next[dateStr][dayId][exId].push({ done: false, reps: '', weight: '' });
        next[dateStr][dayId][exId][setIdx] = {
            ...next[dateStr][dayId][exId][setIdx],
            [field]: value,
        };
        persistLog(next);
    }, [log, persistLog]);

    // ── Day-Map helpers ───────────────────────────────────────────────────────
    const getDayType = useCallback((dateStr) => dayMap[dateStr] ?? null, [dayMap]);

    const setDayType = useCallback((dateStr, dayId) => {
        if (dayId === null) {
            const next = { ...dayMap };
            delete next[dateStr];
            persistDayMap(next);
        } else {
            persistDayMap({ ...dayMap, [dateStr]: dayId });
        }
    }, [dayMap, persistDayMap]);

    // Ctrl+S 강제 저장용 (이미 실시간 저장 중이지만 명시적 피드백 제공)
    const forceSave = useCallback(() => {
        localStorage.setItem('ppl_log_v2', JSON.stringify(log));
        localStorage.setItem('ppl_routines', JSON.stringify(customRoutines));
        localStorage.setItem('ppl_day_map', JSON.stringify(dayMap));
    }, [log, customRoutines, dayMap]);

    return {
        getRoutine, updateRoutine, resetRoutine, isCustomized,
        getLog, updateSet, getPrevDateStr,
        getDayType, setDayType, dayMap,
        forceSave,
    };
}
