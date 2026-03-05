import { useState, useCallback } from 'react';

const ACCOUNT_KEY = 'ppl_account';
const SESSION_KEY = 'ppl_session';

// ── SHA-256 해시 (Web Crypto API — 브라우저 내장) ──────────────────────────
async function sha256(message) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
}

export function useAuth() {
    const [account, setAccount] = useState(() => loadJson(ACCOUNT_KEY));
    const [session, setSession] = useState(() => loadJson(SESSION_KEY));

    const isLoggedIn = !!session?.username;
    const currentUser = session?.username ?? null;
    const hasAccount = !!account;

    // ── 회원가입 ──────────────────────────────────────────────────────────
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

        // 가입 즉시 로그인
        const newSession = { username: trimmedId };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { ok: true };
    }, []);

    // ── 로그인 ────────────────────────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc) return { ok: false, msg: '등록된 계정이 없습니다.' };
        if (acc.username !== username.trim()) return { ok: false, msg: '아이디가 일치하지 않습니다.' };
        const hash = await sha256(password);
        if (acc.passwordHash !== hash) return { ok: false, msg: '비밀번호가 올바르지 않습니다.' };

        const newSession = { username: acc.username };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { ok: true };
    }, []);

    // ── 로그아웃 ──────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, []);

    // ── 비밀번호 재설정 ───────────────────────────────────────────────────
    const resetPassword = useCallback(async (newPassword) => {
        const acc = loadJson(ACCOUNT_KEY);
        if (!acc) return { ok: false, msg: '계정이 없습니다.' };
        if (newPassword.length < 4) return { ok: false, msg: '비밀번호는 4자 이상이어야 합니다.' };
        const passwordHash = await sha256(newPassword);
        const updated = { ...acc, passwordHash };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
        setAccount(updated);
        return { ok: true };
    }, []);

    // ── 계정 정보 조회 (아이디/힌트 찾기용) ──────────────────────────────
    const getAccountInfo = useCallback(() => {
        return account ? { username: account.username, hint: account.hint } : null;
    }, [account]);

    // ── 계정 완전 삭제 (긴급 초기화) ─────────────────────────────────────
    const deleteAllData = useCallback(() => {
        localStorage.removeItem(ACCOUNT_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('ppl_log_v2');
        localStorage.removeItem('ppl_routines');
        localStorage.removeItem('ppl_day_map');
        setAccount(null);
        setSession(null);
    }, []);

    return {
        isLoggedIn, currentUser, hasAccount,
        register, login, logout,
        resetPassword, getAccountInfo, deleteAllData,
    };
}
