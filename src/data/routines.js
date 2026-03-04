// 7분할 PPL 루틴 기본 데이터
export const DAYS = [
    { id: 'push1', label: 'Push 1', theme: 'Pec Heavy', emoji: '🔥', color: 'rose', rest: false },
    { id: 'pull1', label: 'Pull 1', theme: 'Upper Lat', emoji: '💎', color: 'sky', rest: false },
    { id: 'leg1', label: 'Leg 1', theme: 'Hamstring', emoji: '⚡', color: 'green', rest: false },
    { id: 'rest', label: 'Rest', theme: '휴식일', emoji: '😴', color: 'slate', rest: true },
    { id: 'push2', label: 'Push 2', theme: 'Delt Heavy', emoji: '🔥', color: 'orange', rest: false },
    { id: 'pull2', label: 'Pull 2', theme: 'Lower Lat', emoji: '💎', color: 'violet', rest: false },
    { id: 'leg2', label: 'Leg 2', theme: 'Quad Focus', emoji: '⚡', color: 'teal', rest: false },
];

export const COLOR_MAP = {
    rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', badge: 'bg-rose-500/25', btn: 'bg-rose-500', ring: 'focus:ring-rose-500/50' },
    sky: { bg: 'bg-sky-500/20', border: 'border-sky-500/40', text: 'text-sky-400', badge: 'bg-sky-500/25', btn: 'bg-sky-500', ring: 'focus:ring-sky-500/50' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', badge: 'bg-green-500/25', btn: 'bg-green-500', ring: 'focus:ring-green-500/50' },
    slate: { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', badge: 'bg-slate-500/25', btn: 'bg-slate-500', ring: 'focus:ring-slate-500/50' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-500/25', btn: 'bg-orange-500', ring: 'focus:ring-orange-500/50' },
    violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-400', badge: 'bg-violet-500/25', btn: 'bg-violet-500', ring: 'focus:ring-violet-500/50' },
    teal: { bg: 'bg-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-400', badge: 'bg-teal-500/25', btn: 'bg-teal-500', ring: 'focus:ring-teal-500/50' },
};

export const DEFAULT_ROUTINES = {
    push1: [
        { id: 'bp', name: '바벨 벤치프레스', muscle: '가슴', sets: 4, reps: 6, type: 'focus' },
        { id: 'idp', name: '인클라인 덤벨 프레스', muscle: '상부 흉근', sets: 3, reps: 10, type: 'focus' },
        { id: 'cf', name: '케이블 플라이', muscle: '흉근', sets: 3, reps: 15, type: 'focus' },
        { id: 'dsp', name: '덤벨 숄더 프레스', muscle: '전면 삼각', sets: 3, reps: 12, type: 'support' },
        { id: 'csr', name: '케이블 사이드 레이즈', muscle: '측면 삼각', sets: 3, reps: 15, type: 'support' },
        { id: 'ezc', name: 'EZ바 컬', muscle: '이두', sets: 3, reps: 12, type: 'arm' },
    ],
    pull1: [
        { id: 'pu', name: '와이드그립 풀업', muscle: '광배 상부', sets: 4, reps: 6, type: 'focus' },
        { id: 'lpd', name: '와이드그립 랫풀다운', muscle: '광배 상부', sets: 3, reps: 10, type: 'focus' },
        { id: 'sapd', name: '스트레이트 암 풀다운', muscle: '광배근', sets: 3, reps: 15, type: 'focus' },
        { id: 'fp', name: '페이스 풀', muscle: '후면 삼각', sets: 3, reps: 15, type: 'support' },
        { id: 'rdf', name: '리어 델트 플라이', muscle: '후면 삼각', sets: 3, reps: 15, type: 'support' },
        { id: 'tpd', name: '케이블 푸시다운', muscle: '삼두', sets: 3, reps: 12, type: 'arm' },
    ],
    leg1: [
        { id: 'rdl', name: '루마니안 데드리프트', muscle: '햄스트링', sets: 4, reps: 6, type: 'focus' },
        { id: 'lcl', name: '레그 컬 (누워서)', muscle: '햄스트링', sets: 3, reps: 12, type: 'focus' },
        { id: 'gm', name: '굿모닝', muscle: '햄스트링', sets: 3, reps: 15, type: 'focus' },
        { id: 'lp1', name: '레그 프레스', muscle: '대퇴사두', sets: 3, reps: 12, type: 'support' },
        { id: 'le1', name: '레그 익스텐션', muscle: '대퇴사두', sets: 3, reps: 15, type: 'support' },
        { id: 'scrf', name: '스탠딩 카프레이즈', muscle: '종아리', sets: 3, reps: 20, type: 'calf' },
    ],
    rest: [],
    push2: [
        { id: 'ohp', name: '바벨 오버헤드 프레스', muscle: '삼각근', sets: 4, reps: 6, type: 'focus' },
        { id: 'dlr', name: '덤벨 래터럴 레이즈', muscle: '측면 삼각', sets: 3, reps: 15, type: 'focus' },
        { id: 'cfr', name: '케이블 프론트 레이즈', muscle: '전면 삼각', sets: 3, reps: 15, type: 'focus' },
        { id: 'dips', name: '딥스', muscle: '하부 흉근', sets: 3, reps: 12, type: 'support' },
        { id: 'dcf', name: '덤벨 체스트 플라이', muscle: '흉근', sets: 3, reps: 15, type: 'support' },
        { id: 'hc', name: '해머 컬', muscle: '이두', sets: 3, reps: 12, type: 'arm' },
    ],
    pull2: [
        { id: 'br', name: '바벨 로우', muscle: '광배 하부', sets: 4, reps: 6, type: 'focus' },
        { id: 'scr', name: '시티드 케이블 로우', muscle: '광배 하부', sets: 3, reps: 10, type: 'focus' },
        { id: 'oadr', name: '원암 덤벨 로우', muscle: '광배근', sets: 3, reps: 15, type: 'focus' },
        { id: 'rdf2', name: '리어 델트 플라이', muscle: '후면 삼각', sets: 3, reps: 15, type: 'support' },
        { id: 'cfp', name: '케이블 페이스 풀', muscle: '후면 삼각', sets: 3, reps: 15, type: 'support' },
        { id: 'ote', name: '오버헤드 트라이셉스 익스텐션', muscle: '삼두', sets: 3, reps: 12, type: 'arm' },
    ],
    leg2: [
        { id: 'sq', name: '바벨 스쿼트', muscle: '대퇴사두', sets: 4, reps: 6, type: 'focus' },
        { id: 'hs', name: '핵 스쿼트', muscle: '대퇴사두', sets: 3, reps: 10, type: 'focus' },
        { id: 'le2', name: '레그 익스텐션', muscle: '대퇴사두', sets: 3, reps: 15, type: 'focus' },
        { id: 'rdl2', name: '루마니안 데드리프트 (경량)', muscle: '햄스트링', sets: 3, reps: 12, type: 'support' },
        { id: 'lcs', name: '레그 컬 (앉아서)', muscle: '햄스트링', sets: 3, reps: 15, type: 'support' },
        { id: 'scrs', name: '시티드 카프레이즈', muscle: '종아리', sets: 3, reps: 20, type: 'calf' },
    ],
};
