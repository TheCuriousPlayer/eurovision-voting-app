'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Edit these two things to change the animation ─────────────────────── */

/** The vote command keyword shown at the start of the comment. */
const VOTE_COMMAND = ':oy:';

/**
 * Countries to type, in order. Add, remove, or reorder freely.
 * TYPING_FRAMES and DEMO_VOTES are both auto-derived from this list.
 */
const VOTE_COUNTRIES: { name: string; flag: string; points: number }[] = [
  { name: 'Germany',        flag: '🇩🇪', points: 12 },
  { name: 'Finland',        flag: '🇫🇮', points: 10 },
  { name: 'Japan',          flag: '🇯🇵', points: 8  },
  { name: 'Canada',         flag: '🇨🇦', points: 7  },
  { name: 'Brazil',         flag: '🇧🇷', points: 6  },
  { name: 'Italy',          flag: '🇮🇹', points: 5  },
  { name: 'Australia',      flag: '🇦🇺', points: 4  },
  { name: 'Egypt',          flag: '🇪🇬', points: 3  },
  { name: 'Mexico',         flag: '🇲🇽', points: 2  },
  { name: 'India',          flag: '🇮🇳', points: 1  },
];

/* ─── Auto-derived — do not edit below ──────────────────────────────────── */

const FRAME_MS = 10; // ms per character

const FULL_COMMENT = `${VOTE_COMMAND}\nSahne şovlarını sabırsızlıkla bekliyorum. Bu sene benim listem şu şekilde:\nAlmanya - Bence bu sene bir başka tebrik ediyorum birinci olmalı.\nFinlandiya - Kimse beğenmemiş ama birinci olsa şaşırmam...\nJaponya - sahne şovunu siber punk film gibi izleyeceğiz eminim, teknolojide bir numaralar.\nKanada - vokaller tüylerimi diken diken etti, sahne şovu da vurucu olursa kalbimizi bırakırız.\nBrezilya - sahneye çıktıkları an salon yıkılacak yalnız, arena bir anda karnavala dönecek.\nİtalya - her sene olduğu gibi yine kalite kokuyor, o saf karizmayı sahnede görmek için sabırsızlanıyorum.\nAvustralya - kamera açılarını ve sahneyi yine en yaratıcı kullanan ülke kesinlikle bunlar.\nMısır - mistik ve oryantal tınılar modern beatlerle birleşince hipnotize oldum.\nMeksika - o sıcaktan kafayı yemişler. Ulusal finallerdeki performasları yürekleri ağıza getirdi :)\nHindistan - muazzam bir senkronize dans şovu ve renk cümbüşüyle Eurovision tarihinin en eğlenceli şovunu izletecekler.`;

/** Character-by-character frames generated from FULL_COMMENT. */
const TYPING_FRAMES = Array.from(
  { length: FULL_COMMENT.length },
  (_, i) => FULL_COMMENT.slice(0, i + 1)
);

const DEMO_VOTES = VOTE_COUNTRIES.map((c, i) => ({
  rank:    i + 1,
  country: c.name,
  flag:    c.flag,
  points:  c.points,
}));

type AnimPhase =
  | 'idle'
  | 'typing'
  | 'posted'
  | 'scanning'
  | 'detecting'
  | 'registering'
  | 'success';

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function ClientPage() {
  const [phase, setPhase]                 = useState<AnimPhase>('idle');
  const [typedFrame, setTypedFrame]       = useState(-1);
  const [registeredVotes, setRegisteredVotes] = useState<number[]>([]);
  const [currentStep, setCurrentStep]     = useState(1);
  const demoRef = useRef<HTMLDivElement | null>(null);

  /* ── Animation loop ────────────────────────────────────────────────────── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const ADD = (ms: number, fn: () => void) =>
      timers.push(setTimeout(fn, ms));

    const run = () => {
      /* clear any previous timers */
      timers.forEach(clearTimeout);
      timers.length = 0;

      /* reset state */
      setPhase('idle');
      setTypedFrame(-1);
      setRegisteredVotes([]);
      setCurrentStep(1);

      /* absolute timestamps (ms from now) */
      const T_TYPING_START = 1500;
      const T_TYPING_END   = T_TYPING_START + TYPING_FRAMES.length * FRAME_MS;
      const T_POSTED       = T_TYPING_END + 350;
      const T_SCAN         = T_POSTED      + 600;
      const T_DETECT       = T_SCAN        + 1500;
      const T_REGISTER     = T_DETECT      + 1300;
      const T_SUCCESS      = T_REGISTER    + DEMO_VOTES.length * 600 + 500;

      ADD(T_TYPING_START, () => { setPhase('typing'); setCurrentStep(2); });

      TYPING_FRAMES.forEach((_, i) =>
        ADD(T_TYPING_START + i * FRAME_MS, () => setTypedFrame(i))
      );
      ADD(T_POSTED + 3000,   () => setPhase('posted'));
      ADD(T_SCAN,     () => setPhase('scanning'));
      ADD(T_DETECT,   () => setPhase('detecting'));
      ADD(T_REGISTER, () => { setPhase('registering'); setCurrentStep(3); });

      DEMO_VOTES.forEach((_, i) =>
        ADD(T_REGISTER + i * 600, () =>
          setRegisteredVotes(prev => [...prev, i])
        )
      );

      ADD(T_SUCCESS, () => setPhase('success'));
    };

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let successTimer: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'success') {
      successTimer = setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }, 7000);
    } else if (phase !== 'idle' && demoRef.current) {
      demoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (registeredVotes.length > 0 && demoRef.current) {
      demoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy({ top: 50, behavior: 'smooth' });
    }
  }, [registeredVotes.length]);

  /* ── Derived display flags ─────────────────────────────────────────────── */
  const typedText          = typedFrame >= 0 ? TYPING_FRAMES[typedFrame] : '';
  const isCommentComplete  = typedFrame === TYPING_FRAMES.length - 1;
  const showPostedComment  = !['idle', 'typing'].includes(phase);
  const showScanLine       = phase === 'scanning';
  const showHighlight      = ['detecting', 'registering', 'success'].includes(phase);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#070737] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-16">

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🗳️ Yeni Oylama Sistemi</h1>
          <p className="text-gray-400 text-sm">
            YouTube yorumlarıyla Eurovision&apos;a oy kullanın
          </p>
        </div>

        {/* ── Step indicator ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { n: 1, label: 'Videoyu İzle', icon: '📺' },
            { n: 2, label: 'Yorum Yaz',    icon: '💬' },
            { n: 3, label: 'Oy Kaydedildi!', icon: '✅' },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center">
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  opacity: currentStep >= step.n ? 1 : 0.35,
                  scale:   currentStep === step.n ? 1.06 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-500 ${
                    currentStep > step.n
                      ? 'bg-green-500 border-green-400 text-white'
                      : currentStep === step.n
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-[#1a1a3e] border-gray-700 text-gray-400'
                  }`}
                >
                  {currentStep > step.n ? '✓' : step.icon}
                </div>
                <span className="text-xs mt-1 text-gray-300 whitespace-nowrap">
                  {step.label}
                </span>
              </motion.div>

              {i < 2 && (
                <div
                  className={`w-10 sm:w-16 h-0.5 mx-2 transition-colors duration-500 ${
                    currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Animated YouTube comment demo ──────────────────────────────── */}
        <div ref={demoRef} className="bg-[#0f0f0f] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl mb-8">

          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#212121] border-b border-gray-800">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088C19.538 3.617 12 3.617 12 3.617s-7.538 0-9.407.5A3.007 3.007 0 0 0 .505 6.205 31.247 31.247 0 0 0 0 12a31.247 31.247 0 0 0 .505 5.795 3.007 3.007 0 0 0 2.088 2.088C4.462 20.383 12 20.383 12 20.383s7.538 0 9.407-.5a3.007 3.007 0 0 0 2.088-2.088A31.247 31.247 0 0 0 24 12a31.247 31.247 0 0 0-.505-5.795zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
            <span className="text-white text-xs font-medium truncate">
              youtube.com — Eurovision Türkiye Videosu
            </span>
            <div className="ml-auto flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-700" />
              <div className="w-3 h-3 rounded-full bg-gray-700" />
              <div className="w-3 h-3 rounded-full bg-gray-700" />
            </div>
          </div>

          <div className="p-5">
            {/* Comments header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white text-sm font-semibold">143 yorum</span>
              <span className="text-gray-500 text-sm">▾</span>
            </div>

            {/* ── Comment input area ─────────────────────────────────────── */}
            <div className="flex gap-3 mb-5">
              {/* User avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                A
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`border-b-2 pb-1 transition-colors duration-300 ${
                    phase === 'typing' ? 'border-white' : 'border-gray-700'
                  }`}
                >
                  <div className="text-sm font-mono min-h-[22px] text-white whitespace-pre-wrap">
                    {phase === 'idle' ? (
                      <span className="text-gray-600 italic">Yorum ekleyin...</span>
                    ) : phase === 'typing' ? (
                      <>
                        <span>{typedText}</span>
                        <span className="inline-block w-0.5 h-[14px] bg-white ml-0.5 animate-pulse align-middle" />
                      </>
                    ) : (
                      <span className="text-gray-500">{FULL_COMMENT}</span>
                    )}
                  </div>
                </div>

                {/* Submit button — visible while typing */}
                <AnimatePresence>
                  {phase === 'typing' && isCommentComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-end mt-2 gap-2"
                    >
                      <button className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">
                        İptal
                      </button>
                      <motion.button
                        animate={{ scale: [1, 0.92, 1] }}
                        transition={{ duration: 0.25, delay: 0.15 }}
                        className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium shadow-md"
                      >
                        Yorum Yap
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Posted comment block ───────────────────────────────────── */}
            <AnimatePresence>
              {showPostedComment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  {/* Commenter avatar */}


                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-semibold">
                        Yapay Zeka İşliyor...
                      </span>
                      <span className="text-gray-500 text-xs"></span>
                    </div>

                    {/* Comment bubble */}
                    <div
                      className={`relative rounded-lg px-3 py-2.5 border overflow-hidden transition-all duration-500 ${
                        showHighlight
                          ? 'bg-green-950/40 border-green-600/50'
                          : 'bg-[#1a1a2e] border-gray-800'
                      }`}
                    >
                      {/* Scan line */}
                      <AnimatePresence>
                        {showScanLine && (
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none"
                            style={{ top: 0 }}
                            animate={{ top: '110%', opacity: [1, 1, 0] }}
                            transition={{ duration: 1.4, ease: 'linear' }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Scanning badge */}
                      <AnimatePresence>
                        {showScanLine && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-2 right-2 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10"
                          >
                            TARANIYOR
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Comment text */}
                      <span className="text-sm font-mono text-white whitespace-pre-wrap break-words">
                        {showHighlight ? (
                          <>
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.25 }}
                              className="inline-block bg-green-400 text-black text-xs font-bold px-1.5 py-0.5 rounded mr-1 align-middle"
                            >
                              :oy:
                            </motion.span>
                            <span>{FULL_COMMENT.replace(/^:oy:\s*/, '')}</span>
                          </>
                        ) : (
                          FULL_COMMENT
                        )}
                      </span>
                    </div>

                    {/* Detecting badge */}
                    <AnimatePresence>
                      {phase === 'detecting' && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 flex items-center gap-3 flex-wrap"
                        >
                          <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-full px-2.5 py-1 text-yellow-400 text-xs">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block"
                            >
                              ⚙️
                            </motion.span>
                            <span>Oy komutu tespit edildi!</span>
                          </div>
                          <span className="text-xs text-gray-500">Oylar kayıt ediliyor…</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Vote registration rows */}
                    <AnimatePresence>
                      {(phase === 'registering' || phase === 'success') && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 space-y-1.5"
                        >
                          {DEMO_VOTES.map((vote, i) => (
                            <AnimatePresence key={i}>
                              {registeredVotes.includes(i) && (
                                <motion.div
                                  initial={{ opacity: 0, x: -16 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.35, ease: 'easeOut' }}
                                  className="flex items-center gap-2 text-xs bg-green-900/30 border border-green-700/40 rounded-lg px-2.5 py-1.5"
                                >
                                  <span className="text-green-400 font-bold text-base">✓</span>
                                  <span className="text-white font-medium">
                                    {vote.flag} {vote.country}
                                  </span>
                                  <span className="ml-auto text-green-400 font-semibold whitespace-nowrap">
                                    {vote.rank}. tercih → +{vote.points} puan
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Success banner ─────────────────────────────────────────── */}
            <AnimatePresence>
              {phase === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-5 flex justify-center"
                >
                  <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg shadow-green-500/25 flex items-center gap-2">
                    <span>🎉</span>
                    <span>10 oy başarıyla sisteme kaydedildi!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Bot status footer ──────────────────────────────────────── */}
            <div className="mt-5 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                🤖
              </div>
              <span>Yapay Zeka İle Güçlendirilmiş Tespit. | AI-Powered Text Detection.<br />Multilingual / Flexible.</span>

              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span></span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Supported keywords ─────────────────────────────────────────── */}
        <div className="bg-[#0f0f2e] border border-gray-700/60 rounded-xl p-5 mb-6">
          <p className="text-gray-400 text-xs mb-3">Oylama komutları:<br />Voting commands:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { keyword: ':oy:',      grad: 'from-red-500 to-rose-600'     },
              { keyword: ':oylarım:', grad: 'from-orange-500 to-amber-800'  },
              { keyword: ':vote:',    grad: 'from-blue-500 to-cyan-900'     },
            ].map(({ keyword, grad }) => (
              <div
                key={keyword}
                className={`bg-gradient-to-r ${grad} text-white font-mono font-bold text-base px-5 py-2 rounded-lg shadow-md`}
              >
                {keyword}
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <div className="bg-[#0f0f2e] border border-gray-700/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">
            ⚙️ Sistem Nasıl Çalışır? <br />⚙️ How Does It Work?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-2">
                
              </div>
              <div className="space-y-3 bg-[#111224] border border-gray-800 rounded-2xl p-4">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📺</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">YouTube Entegrasyonu</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - Sistem, Eurovision YouTube videosunun yorumlarını düzenli aralıklarla tarar.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Anahtar Kelime Tespiti</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      :oy:
                      <br />:oylarım:
                      <br />:vote:
                      <br />içeren yorumlar otomatik olarak işleme alınır.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Ülke Sıralaması</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - Yorumdaki ülkeler sırasıyla Yapay Zeka tarafından analiz edilir.
                      <br />- Hangi dil veya formatta yazarsanız yazın, sistem doğru şekilde tanır.
                      <br />- Oylarınız sisteme otomatik kaydedilir.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Oy Değiştirme Hakkı</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - Yorumlarda yaptığınız değişiklikler de algılanır, böylece oylarınızı değiştirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-2">
                
              </div>
              <div className="space-y-3 bg-[#111224] border border-gray-800 rounded-2xl p-4">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📺</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">YouTube Integration</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - The system scans Eurovision YouTube video comments at regular intervals.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Keyword Detection</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      :oy:
                      <br />:oylarım:
                      <br />:vote:
                      <br />comments containing these commands are processed automatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Country Ranking</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - Countries in the comment are analyzed in order by AI.
                      <br />- The system recognizes your vote no matter the language or format.
                      <br />- Your votes are automatically recorded.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Vote Change Right</p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      - Changes you make in comments are also detected, so you can update your vote.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
