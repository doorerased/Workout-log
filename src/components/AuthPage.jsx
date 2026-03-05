import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Lightbulb, ArrowLeft, AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

// ── 공통 인풋 컴포넌트 ─────────────────────────────────────────────────────
function AuthInput({ icon: Icon, type = 'text', value, onChange, placeholder, right }) {
    return (
        <div className="relative">
            <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
                type={type} value={value} onChange={onChange} placeholder={placeholder}
                autoComplete="off"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm
                    outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all
                    placeholder:text-white/20"
            />
            {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
        </div>
    );
}

// ── 비밀번호 인풋 ─────────────────────────────────────────────────────────
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

// ── 에러 / 성공 메시지 ────────────────────────────────────────────────────
function Msg({ text, type }) {
    if (!text) return null;
    const ok = type === 'success';
    return (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium
            ${ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                 : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            {text}
        </div>
    );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
// mode: 'login' | 'register' | 'forgot' | 'admin' | 'reset'
export default function AuthPage({ hasAccount, onLogin, onRegister, onForgot, onVerifyAdminCode }) {
    const [mode, setMode] = useState(hasAccount ? 'login' : 'register');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [pwConfirm, setPwConfirm] = useState('');
    const [hint, setHint] = useState('');
    const [adminCode, setAdminCode] = useState('');       // 회원가입용
    const [adminCodeInput, setAdminCodeInput] = useState(''); // 복구용
    const [newPw, setNewPw] = useState('');
    const [newPwConfirm, setNewPwConfirm] = useState('');
    const [msg, setMsg] = useState({ text: '', type: 'error' });
    const [loading, setLoading] = useState(false);
    const [forgotInfo, setForgotInfo] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const setErr = (text) => setMsg({ text, type: 'error' });
    const setOk = (text) => setMsg({ text, type: 'success' });
    const clearMsg = () => setMsg({ text: '', type: 'error' });
    const go = (m) => { setMode(m); clearMsg(); };

    // ── 로그인 ─────────────────────────────────────────────────────────────
    const handleLogin = async () => {
        if (!id.trim() || !pw) return setErr('아이디와 비밀번호를 입력해주세요.');
        setLoading(true);
        const res = await onLogin(id, pw);
        setLoading(false);
        if (!res.ok) setErr(res.msg);
    };

    // ── 회원가입 ───────────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!id.trim()) return setErr('아이디를 입력해주세요.');
        if (pw.length < 4) return setErr('비밀번호는 4자 이상이어야 합니다.');
        if (pw !== pwConfirm) return setErr('비밀번호가 일치하지 않습니다.');
        if (!adminCode || adminCode.trim().length < 4) return setErr('관리자 복구 코드는 4자 이상이어야 합니다.');
        setLoading(true);
        const res = await onRegister(id, pw, hint, adminCode);
        setLoading(false);
        if (!res.ok) setErr(res.msg);
    };

    // ── 아이디/비밀번호 찾기 ───────────────────────────────────────────────
    const handleForgot = () => {
        const info = onForgot();
        if (!info) return setErr('등록된 계정이 없습니다.');
        setForgotInfo(info);
        go('forgot');
    };

    // ── 관리자 복구 코드 검증 ──────────────────────────────────────────────
    const handleVerifyAdmin = async () => {
        if (!adminCodeInput.trim()) return setErr('복구 코드를 입력해주세요.');
        setLoading(true);
        const res = await onVerifyAdminCode(adminCodeInput);
        setLoading(false);
        if (res.ok) {
            clearMsg();
            go('reset');
        } else {
            setErr(res.msg);
        }
    };

    // ── 비밀번호 재설정 ────────────────────────────────────────────────────
    const handleReset = async () => {
        if (newPw.length < 4) return setErr('비밀번호는 4자 이상이어야 합니다.');
        if (newPw !== newPwConfirm) return setErr('비밀번호가 일치하지 않습니다.');
        setLoading(true);
        const res = await onForgot('reset', newPw);
        setLoading(false);
        if (res?.ok) {
            setOk('비밀번호가 재설정되었습니다. 로그인 해주세요.');
            setTimeout(() => go('login'), 1500);
        } else {
            setErr(res?.msg ?? '오류가 발생했습니다.');
        }
    };

    const modeLabel = {
        login: '로그인하여 운동 일지를 확인하세요',
        register: '새 계정을 만들어 시작하세요',
        forgot: '계정 정보 확인',
        admin: '관리자 복구 코드 입력',
        reset: '새 비밀번호를 설정하세요',
    };

    return (
        <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4">
            {/* 배경 글로우 */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-600/8 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm animate-fade-in">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-violet-500/20">
                        <img src="/apexload_logo.png" alt="ApexLoad" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-white font-black text-2xl tracking-tight">
                        <span className="text-white">APEX</span><span className="text-violet-400">LOAD</span>
                    </h1>
                    <p className="text-white/30 text-xs mt-1">{modeLabel[mode]}</p>
                </div>

                {/* 카드 */}
                <div className="bg-surface-800 border border-white/8 rounded-3xl p-6 shadow-2xl space-y-4">

                    {/* ── 로그인 ────────────────────────────────────────── */}
                    {mode === 'login' && (
                        <>
                            <h2 className="text-white font-bold text-base">로그인</h2>
                            <AuthInput icon={User} value={id} onChange={e => setId(e.target.value)} placeholder="아이디" />
                            <PwInput value={pw} onChange={e => setPw(e.target.value)} />
                            <Msg {...msg} />
                            <button onClick={handleLogin} disabled={loading}
                                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-violet-600/20">
                                {loading ? '확인 중...' : '로그인'}
                            </button>
                            <div className="flex items-center justify-between pt-1">
                                <button onClick={() => { clearMsg(); go('register'); }}
                                    className="text-white/30 hover:text-white/60 text-xs transition-colors">
                                    계정 만들기
                                </button>
                                <button onClick={handleForgot}
                                    className="text-white/30 hover:text-violet-400 text-xs transition-colors flex items-center gap-1">
                                    <KeyRound size={11} /> 아이디/비밀번호 찾기
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── 회원가입 ──────────────────────────────────────── */}
                    {mode === 'register' && (
                        <>
                            <h2 className="text-white font-bold text-base">회원가입</h2>
                            <AuthInput icon={User} value={id} onChange={e => setId(e.target.value)} placeholder="아이디 (영문·숫자)" />
                            <PwInput value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호 (4자 이상)" />
                            <PwInput value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="비밀번호 확인" />

                            {/* 비밀번호 힌트 */}
                            <div>
                                <AuthInput icon={Lightbulb} value={hint} onChange={e => setHint(e.target.value)}
                                    placeholder="비밀번호 힌트 (선택 — 예: 내 강아지 이름)" />
                                <p className="text-white/20 text-[10px] mt-1 pl-1">잊어버렸을 때 표시되는 힌트예요.</p>
                            </div>

                            {/* 관리자 복구 코드 */}
                            <div className="border-t border-white/5 pt-3">
                                <p className="text-violet-300/70 text-xs mb-2 flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> 관리자 복구 코드 <span className="text-white/30">(필수)</span>
                                </p>
                                <PwInput value={adminCode} onChange={e => setAdminCode(e.target.value)}
                                    placeholder="복구 코드 (4자 이상, AI에게 알려줄 코드)" />
                                <p className="text-white/20 text-[10px] mt-1.5 pl-1 leading-relaxed">
                                    비밀번호를 잊었을 때 AI 대화창에서 이 코드를 사용해 재설정할 수 있어요.<br />
                                    본인만 아는 단어로 설정하고 기억해두세요.
                                </p>
                            </div>

                            <Msg {...msg} />
                            <button onClick={handleRegister} disabled={loading}
                                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-violet-600/20">
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

                    {/* ── 계정 정보 확인 ────────────────────────────────── */}
                    {mode === 'forgot' && forgotInfo && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('login')}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                    <ArrowLeft size={13} />
                                </button>
                                <h2 className="text-white font-bold text-base">계정 정보 확인</h2>
                            </div>

                            <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-white/30 text-xs mb-1">등록된 아이디</p>
                                    <p className="text-white font-bold text-sm">{forgotInfo.username}</p>
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <p className="text-white/30 text-xs mb-1 flex items-center gap-1">
                                        <Lightbulb size={10} /> 비밀번호 힌트
                                    </p>
                                    <p className="text-violet-300 text-sm font-medium">
                                        {forgotInfo.hint || '(설정된 힌트 없음)'}
                                    </p>
                                </div>
                            </div>

                            <Msg {...msg} />

                            {/* ★ 관리자 복구 코드로 재설정 */}
                            <button onClick={() => { clearMsg(); go('admin'); }}
                                className="w-full py-3 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                                <ShieldCheck size={15} /> 관리자 복구 코드로 재설정
                            </button>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 border-t border-white/5" />
                                <span className="text-white/20 text-[10px]">또는</span>
                                <div className="flex-1 border-t border-white/5" />
                            </div>

                            {/* 긴급 초기화 */}
                            {!showDeleteConfirm ? (
                                <button onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full text-rose-500/60 hover:text-rose-400 text-xs transition-colors flex items-center justify-center gap-1">
                                    <AlertTriangle size={11} /> 모든 데이터 삭제 후 초기화
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-rose-400/80 text-xs text-center">정말로 모든 운동 기록을 삭제할까요?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => onForgot('deleteAll')}
                                            className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-all">
                                            삭제 및 초기화
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-xs font-bold">
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── 관리자 복구 코드 입력 ─────────────────────────── */}
                    {mode === 'admin' && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('forgot')}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                    <ArrowLeft size={13} />
                                </button>
                                <h2 className="text-white font-bold text-base">관리자 복구 코드</h2>
                            </div>

                            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3">
                                <p className="text-violet-300/80 text-xs leading-relaxed">
                                    AI 대화창에서<br />
                                    <span className="font-bold text-violet-300">"비밀번호 초기화해줘"</span>라고 요청하면<br />
                                    관리자가 복구 코드를 확인 후 알려드립니다.
                                </p>
                            </div>

                            <PwInput value={adminCodeInput} onChange={e => setAdminCodeInput(e.target.value)}
                                placeholder="관리자 복구 코드 입력" />
                            <Msg {...msg} />
                            <button onClick={handleVerifyAdmin} disabled={loading}
                                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95">
                                {loading ? '확인 중...' : '코드 확인'}
                            </button>
                        </>
                    )}

                    {/* ── 비밀번호 재설정 ───────────────────────────────── */}
                    {mode === 'reset' && (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => go('forgot')}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                    <ArrowLeft size={13} />
                                </button>
                                <h2 className="text-white font-bold text-base">비밀번호 재설정</h2>
                            </div>
                            <PwInput value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="새 비밀번호 (4자 이상)" />
                            <PwInput value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} placeholder="새 비밀번호 확인" />
                            <Msg {...msg} />
                            <button onClick={handleReset} disabled={loading}
                                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95">
                                {loading ? '처리 중...' : '비밀번호 변경'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
