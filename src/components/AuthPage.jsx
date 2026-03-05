import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Lightbulb, ArrowLeft, AlertTriangle,
         CheckCircle2, KeyRound, ShieldCheck, MessageSquare, Clock } from 'lucide-react';

/* ── 공통 인풋 ─────────────────────────────────────────────────────────── */
function AuthInput({ icon: Icon, type = 'text', value, onChange, placeholder, right }) {
    return (
        <div className="relative">
            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
                type={type} value={value} onChange={onChange} placeholder={placeholder}
                autoComplete="off"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm
                    outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all
                    placeholder:text-white/20"
            />
            {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
        </div>
    );
}

function PwInput({ value, onChange, placeholder = '비밀번호' }) {
    const [show, setShow] = useState(false);
    return (
        <AuthInput
            icon={Lock} type={show ? 'text' : 'password'}
            value={value} onChange={onChange} placeholder={placeholder}
            right={
                <button type="button" onClick={() => setShow(p => !p)}
                    className="w-7 h-7 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            }
        />
    );
}

function Msg({ text, type }) {
    if (!text) return null;
    const ok = type === 'success';
    return (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium
            ${ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                 : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            {text}
        </div>
    );
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────────────────── */
// mode: 'login' | 'register' | 'forgot' | 'recovery-set' | 'recovery-wait' | 'reset'
export default function AuthPage({ hasAccount, onLogin, onRegister, onForgot, onSetRecoveryCode }) {
    const [mode, setMode]             = useState(hasAccount ? 'login' : 'register');
    const [id, setId]                 = useState('');
    const [pw, setPw]                 = useState('');
    const [pwConfirm, setPwConfirm]   = useState('');
    const [hint, setHint]             = useState('');
    const [recoveryCode, setRecovery] = useState('');
    const [newPw, setNewPw]           = useState('');
    const [newPwConfirm, setNewPwC]   = useState('');
    const [msg, setMsg]               = useState({ text: '', type: 'error' });
    const [loading, setLoading]       = useState(false);
    const [forgotInfo, setForgotInfo] = useState(null);
    const [showDeleteConfirm, setDelConfirm] = useState(false);

    const setErr   = t => setMsg({ text: t, type: 'error' });
    const setOk    = t => setMsg({ text: t, type: 'success' });
    const clearMsg = () => setMsg({ text: '', type: 'error' });
    const go       = m => { setMode(m); clearMsg(); };

    /* ── 로그인 ──────────────────────────────────────────────────────────── */
    const handleLogin = async () => {
        if (!id.trim() || !pw) return setErr('아이디와 비밀번호를 입력해주세요.');
        setLoading(true);
        const res = await onLogin(id, pw);
        setLoading(false);
        if (!res.ok) setErr(res.msg);
    };

    /* ── 회원가입 ────────────────────────────────────────────────────────── */
    const handleRegister = async () => {
        if (!id.trim()) return setErr('아이디를 입력해주세요.');
        if (pw.length < 4) return setErr('비밀번호는 4자 이상이어야 합니다.');
        if (pw !== pwConfirm) return setErr('비밀번호가 일치하지 않습니다.');
        setLoading(true);
        const res = await onRegister(id, pw, hint);
        setLoading(false);
        if (!res.ok) setErr(res.msg);
    };

    /* ── 아이디/비밀번호 찾기 ─────────────────────────────────────────────── */
    const handleForgot = () => {
        const info = onForgot();
        if (!info) return setErr('등록된 계정이 없습니다.');
        setForgotInfo(info);
        go('forgot');
    };

    /* ── 복구 코드 저장 ──────────────────────────────────────────────────── */
    const handleSetRecovery = async () => {
        if (recoveryCode.trim().length < 4) return setErr('복구 코드는 4자 이상이어야 합니다.');
        setLoading(true);
        const res = await onSetRecoveryCode(recoveryCode);
        setLoading(false);
        if (res.ok) go('recovery-wait');
        else setErr(res.msg);
    };

    /* ── 비밀번호 재설정 ─────────────────────────────────────────────────── */
    const handleReset = async () => {
        if (newPw.length < 4) return setErr('비밀번호는 4자 이상이어야 합니다.');
        if (newPw !== newPwConfirm) return setErr('비밀번호가 일치하지 않습니다.');
        setLoading(true);
        const res = await onForgot('reset', newPw);
        setLoading(false);
        if (res?.ok) {
            setOk('비밀번호가 재설정되었습니다. 로그인 해주세요.');
            setTimeout(() => go('login'), 1500);
        } else setErr(res?.msg ?? '오류가 발생했습니다.');
    };

    const modeLabel = {
        login:          '로그인하여 기록을 시작하세요',
        register:       '새 계정을 만들어 시작하세요',
        forgot:         '계정 정보 확인',
        'recovery-set': '복구 코드 설정',
        'recovery-wait':'AI에게 비밀번호 재설정 요청',
        reset:          '새 비밀번호를 설정하세요',
    };

    const primaryBtn = "w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-900/40";
    const backBtn    = "w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all";

    return (
        <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4">
            {/* 배경 글로우 */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-red-700/8 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm animate-fade-in">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <h1 className="font-black text-3xl tracking-tight"
                        style={{ textShadow: '0 0 30px rgba(220,38,38,0.4)' }}>
                        <span className="text-white">Apex</span><span className="text-red-500">Load</span>
                    </h1>
                    <p className="text-white/25 text-xs mt-2 tracking-widest uppercase">{modeLabel[mode]}</p>
                </div>

                {/* 카드 */}
                <div className="bg-surface-800 border border-white/6 rounded-3xl p-6 shadow-2xl space-y-4">

                    {/* ── 로그인 ── */}
                    {mode === 'login' && (
                        <>
                            <h2 className="text-white font-bold text-base">로그인</h2>
                            <AuthInput icon={User} value={id} onChange={e => setId(e.target.value)} placeholder="아이디" />
                            <PwInput value={pw} onChange={e => setPw(e.target.value)} />
                            <Msg {...msg} />
                            <button onClick={handleLogin} disabled={loading} className={primaryBtn}>
                                {loading ? '확인 중...' : '로그인'}
                            </button>
                            {/* 세션 안내 */}
                            <div className="flex items-center justify-center gap-1 text-white/20 text-[10px]">
                                <Clock size={10} /> 로그인 후 1시간 동안 세션이 유지됩니다
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <button onClick={() => { clearMsg(); go('register'); }}
                                    className="text-white/30 hover:text-white/60 text-xs transition-colors">
                                    계정 만들기
                                </button>
                                <button onClick={handleForgot}
                                    className="text-white/30 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
                                    <KeyRound size={11} /> 아이디/비밀번호 찾기
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── 회원가입 (복구 코드 필드 없음) ── */}
                    {mode === 'register' && (
                        <>
                            <h2 className="text-white font-bold text-base">회원가입</h2>
                            <AuthInput icon={User} value={id} onChange={e => setId(e.target.value)} placeholder="아이디 (영문·숫자)" />
                            <PwInput value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호 (4자 이상)" />
                            <PwInput value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="비밀번호 확인" />
                            <div>
                                <AuthInput icon={Lightbulb} value={hint} onChange={e => setHint(e.target.value)}
                                    placeholder="비밀번호 힌트 (선택)" />
                                <p className="text-white/20 text-[10px] mt-1 pl-1">잊어버렸을 때 표시되는 힌트예요.</p>
                            </div>
                            <Msg {...msg} />
                            <button onClick={handleRegister} disabled={loading} className={primaryBtn}>
                                {loading ? '처리 중...' : '계정 만들기'}
                            </button>
                            {hasAccount && (
                                <button onClick={() => go('login')}
                                    className="w-full text-center text-white/30 hover:text-white/60 text-xs transition-colors">
                                    이미 계정이 있어요 → 로그인
                                </button>
                            )}
                        </>
                    )}

                    {/* ── 계정 정보 확인 ── */}
                    {mode === 'forgot' && forgotInfo && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('login')} className={backBtn}><ArrowLeft size={13} /></button>
                                <h2 className="text-white font-bold text-base">계정 정보 확인</h2>
                            </div>
                            <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-white/30 text-xs mb-1">등록된 아이디</p>
                                    <p className="text-white font-bold text-sm">{forgotInfo.username}</p>
                                </div>
                                {forgotInfo.hint && (
                                    <div className="border-t border-white/5 pt-3">
                                        <p className="text-white/30 text-xs mb-1 flex items-center gap-1">
                                            <Lightbulb size={10} /> 비밀번호 힌트
                                        </p>
                                        <p className="text-red-300 text-sm font-medium">{forgotInfo.hint}</p>
                                    </div>
                                )}
                            </div>
                            <Msg {...msg} />
                            {/* AI를 통한 비밀번호 재설정 */}
                            <button onClick={() => { clearMsg(); go('recovery-set'); }}
                                className="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={15} /> AI 대화창으로 비밀번호 재설정
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 border-t border-white/5" />
                                <span className="text-white/20 text-[10px]">또는</span>
                                <div className="flex-1 border-t border-white/5" />
                            </div>
                            {!showDeleteConfirm ? (
                                <button onClick={() => setDelConfirm(true)}
                                    className="w-full text-red-500/60 hover:text-red-400 text-xs transition-colors flex items-center justify-center gap-1">
                                    <AlertTriangle size={11} /> 모든 데이터 삭제 후 초기화
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-red-400/80 text-xs text-center">정말로 모든 운동 기록을 삭제할까요?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => onForgot('deleteAll')}
                                            className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all">
                                            삭제 및 초기화
                                        </button>
                                        <button onClick={() => setDelConfirm(false)}
                                            className="flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-xs font-bold">
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── 복구 코드 설정 ── */}
                    {mode === 'recovery-set' && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('forgot')} className={backBtn}><ArrowLeft size={13} /></button>
                                <h2 className="text-white font-bold text-base">복구 코드 설정</h2>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                                <p className="text-red-200/70 text-xs leading-relaxed">
                                    기억하기 쉬운 <span className="text-red-300 font-bold">임의의 코드</span>를 설정하세요.<br />
                                    설정 후 <span className="font-bold">같은 코드</span>를 AI 대화창에 입력하면<br />
                                    비밀번호를 재설정해 드립니다.
                                </p>
                            </div>
                            <PwInput value={recoveryCode} onChange={e => setRecovery(e.target.value)}
                                placeholder="복구 코드 (4자 이상, 본인만 아는 코드)" />
                            <Msg {...msg} />
                            <button onClick={handleSetRecovery} disabled={loading} className={primaryBtn}>
                                {loading ? '저장 중...' : '복구 코드 저장 →'}
                            </button>
                        </>
                    )}

                    {/* ── AI 요청 대기 안내 ── */}
                    {mode === 'recovery-wait' && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('forgot')} className={backBtn}><ArrowLeft size={13} /></button>
                                <h2 className="text-white font-bold text-base">AI에게 요청하세요</h2>
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                    <CheckCircle2 size={14} /> 복구 코드가 저장되었습니다
                                </div>
                                <p className="text-white/50 text-xs leading-relaxed">
                                    지금 AI(Antigravity) 대화창에서 아래와 같이 입력하세요:
                                </p>
                                <div className="bg-black/40 rounded-lg px-3 py-2 text-red-300 text-xs font-mono">
                                    "복구 코드로 비밀번호 재설정해줘. 코드: [입력한 코드]"
                                </div>
                                <p className="text-white/30 text-[10px]">
                                    AI가 코드를 확인하고 새 비밀번호를 설정해 드립니다.<br />
                                    기존 운동 데이터는 그대로 유지됩니다.
                                </p>
                            </div>

                            <button onClick={() => go('reset')}
                                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 text-xs font-medium transition-all">
                                직접 새 비밀번호 입력하기
                            </button>
                        </>
                    )}

                    {/* ── 비밀번호 재설정 ── */}
                    {mode === 'reset' && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('recovery-wait')} className={backBtn}><ArrowLeft size={13} /></button>
                                <h2 className="text-white font-bold text-base">새 비밀번호 설정</h2>
                            </div>
                            <PwInput value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="새 비밀번호 (4자 이상)" />
                            <PwInput value={newPwConfirm} onChange={e => setNewPwC(e.target.value)} placeholder="새 비밀번호 확인" />
                            <Msg {...msg} />
                            <button onClick={handleReset} disabled={loading} className={primaryBtn}>
                                {loading ? '처리 중...' : '비밀번호 변경'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
