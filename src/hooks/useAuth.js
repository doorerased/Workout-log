import { useState, useCallback, useEffect } from 'react';

const ACCOUNT_KEY   = 'ppl_account';
const SESSION_KEY   = 'ppl_session';
const SESSION_MS    = 60 * 60 * 1000; // 1시간

// ── SHA-256 해시 ───────────────────────────────────────────────────────────
async function sha256(message) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
}

// 세션이 유효한지 확인 (없으면 false, loginTime 없는 구 세션은 호환 유지)
function isSessionValid(s) {
    if (!s?.username) return false;
    if (!s.loginTime) return false; // 구 세션은 재로그인 요구
    return Date.now() - s.loginTime < SESSION_MS;
}

export function useAuth() {
    const [account, setAccount] = useState(() => loadJson(ACCOUNT_KEY));
    const [session, setSession] = useState(() => {
        const s = loadJson(SESSION_KEY);
        if (!isSessionValid(s)) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    });

    const isLoggedIn  = !!session?.username;
    const currentUser = session?.username ?? null;
    const hasAccount  = !!account;

    // ── 1시간 자동 로그아웃 타이머 ────────────────────────────────────────
    useEffect(() => {
        if (!session?.loginTime) return;
        const remaining = SESSION_MS - (Date.now() - session.loginTime);
        if (remaining <= 0) { logout(); return; }
        const timer = setTimeout(() => {
            localStorage.removeItem(SESSION_KEY);
            setSession(null);
        }, remaining);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.loginTime]);

    // ── 회원가입 (adminCode 없음) ─────────────────────────────────────────
    const register = useCallback(async (username, password, hint) => {
        const trimmedId = username.trim();
        if (!trimmedId) return { ok: false, msg: '아이디를 입력해주세요.' };
        if (password.length < 4) return { ok: false, msg: '비밀번호는 4자 이상이어야 합니다.' };

        const passwordHash = await sha256(password);
        const newAccount = {
            username: trimmedId,
            passwordHash,
            hint: hint.trim(),
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(newAccount));
        setAccount(newAccount);

        const newSession = { username: trimmedId, loginTime: Date.now() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { ok: true };
    }, []);

    // ── 로그인 (loginTime 포함) ───────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc) return { ok: false, msg: '등록된 계정이 없습니다.' };
        if (acc.username !== username.trim()) return { ok: false, msg: '아이디가 일치하지 않습니다.' };
        const hash = await sha256(password);
        if (acc.passwordHash !== hash) return { ok: false, msg: '비밀번호가 올바르지 않습니다.' };

        const newSession = { username: acc.username, loginTime: Date.now() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { ok: true };
    }, []);

    // ── 로그아웃 ──────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, []);

    // ── 복구 코드 설정 (비밀번호 분실 시 사용자가 임의 코드 설정) ─────────
    // 코드를 SHA-256 해시하여 저장. 원문은 저장하지 않음.
    const setRecoveryCode = useCallback(async (code) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc) return { ok: false, msg: '계정이 없습니다.' };
        if (code.trim().length < 4) return { ok: false, msg: '복구 코드는 4자 이상이어야 합니다.' };
        const recoveryHash = await sha256(code.trim());
        const updated = { ...acc, recoveryHash, recoverySetAt: new Date().toISOString() };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
        setAccount(updated);
        return { ok: true };
    }, []);

    // ── 복구 코드 검증 (AI가 사용자 제출 코드를 검증할 때 사용) ────────────
    const verifyRecoveryCode = useCallback(async (code) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc?.recoveryHash) return { ok: false, msg: '설정된 복구 코드가 없습니다. 앱에서 먼저 복구 코드를 설정해주세요.' };
        const hash = await sha256(code.trim());
        if (acc.recoveryHash !== hash) return { ok: false, msg: '복구 코드가 일치하지 않습니다.' };
        return { ok: true };
    }, []);

    // ── 비밀번호 재설정 (passwordHash만 업데이트 - 운동 데이터 유지) ───────
    const resetPassword = useCallback(async (newPassword) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc) return { ok: false, msg: '계정이 없습니다.' };
        if (newPassword.length < 4) return { ok: false, msg: '비밀번호는 4자 이상이어야 합니다.' };
        const passwordHash = await sha256(newPassword);
        // recoveryHash도 초기화 (사용 완료)
        const updated = { ...acc, passwordHash, recoveryHash: null, recoverySetAt: null };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
        setAccount(updated);
        return { ok: true };
    }, []);

    // ── 계정 정보 조회 ────────────────────────────────────────────────────
    const getAccountInfo = useCallback(() => {
        return account ? { username: account.username, hint: account.hint } : null;
    }, [account]);

    // ── 전체 데이터 삭제 (긴급 초기화) ───────────────────────────────────
    const deleteAllData = useCallback(() => {
        localStorage.removeItem(ACCOUNT_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('ppl_log_v2');
        localStorage.removeItem('ppl_routines');
        localStorage.removeItem('ppl_day_map');
        setAccount(null);
        setSession(null);
    }, []);

    // ── 세션 남은 시간 조회 (분 단위 반환) ───────────────────────────────
    const getSessionRemaining = useCallback(() => {
        if (!session?.loginTime) return null;
        const ms = SESSION_MS - (Date.now() - session.loginTime);
        return ms > 0 ? Math.ceil(ms / 60000) : 0;
    }, [session]);

    return {
        isLoggedIn, currentUser, hasAccount,
        register, login, logout,
        setRecoveryCode, verifyRecoveryCode,
        resetPassword, getAccountInfo,
        deleteAllData, getSessionRemaining,
    };
}
