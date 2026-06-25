import { useEffect, useState, useRef } from 'react';
import { TEAMS_LIST, WORLD_CUP_DATA } from './data/world_cup_data';
import { AppPhase } from './types';
import ThreeCanvas from './components/ThreeCanvas';
import Dashboard from './components/Dashboard';
import { ChevronDown, Zap, Shield, Target, Award, Play, AlertTriangle } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('SCROLL_JOURNEY');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ARG');
  const [goalFlashActive, setGoalFlashActive] = useState<boolean>(false);

  // Audio synthesizer for stadium whistle on goal scores (Uses native Web Audio API)
  const playGoalSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Main whistle oscillators beating together to create a trilling effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1050, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.12);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1072, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1622, ctx.currentTime + 0.12);

      // Modulator to generate rapid volume/pitch vibration (tremolo)
      const modulator = ctx.createOscillator();
      const modulatorGain = ctx.createGain();
      modulator.frequency.setValueAtTime(25, ctx.currentTime); // 25Hz flutter
      modulatorGain.gain.setValueAtTime(90, ctx.currentTime);

      modulator.connect(modulatorGain);
      modulatorGain.connect(osc1.frequency);
      modulatorGain.connect(osc2.frequency);

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65); // fade out length

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      modulator.start();

      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
      modulator.stop(ctx.currentTime + 0.7);
    } catch (err) {
      console.warn("Audio Context blocked by browser permission or unsupported:", err);
    }
  };

  // Scroll listener to update Waypoint progression (0 to 8)
  useEffect(() => {
    const handleScroll = () => {
      if (phase !== 'SCROLL_JOURNEY') return;

      const scrollTop = window.scrollY;
      const height = window.innerHeight || 1;
      const progress = scrollTop / height;

      // Map progress cleanly
      setScrollProgress(Math.min(Math.max(progress, 0), 8));

      // Calculate active waypoint index (0 is intro, 1-8 are teams)
      const section = Math.round(progress);
      setActiveSection(Math.min(Math.max(section, 0), 8));

      // Update selectedTeamId dynamically as we scroll over their zone
      if (section >= 1 && section <= 8) {
        setSelectedTeamId(TEAMS_LIST[section - 1].id);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (phase !== 'SCROLL_JOURNEY') return;
      window.scrollBy(0, e.deltaY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    // Run once on load to synchronize initial values
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [phase]);

  // Lock scroll when animation or dashboard is active
  useEffect(() => {
    if (phase !== 'SCROLL_JOURNEY') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [phase]);

  // Navigate directly to a section
  const handleNavigateToSection = (index: number) => {
    if (phase !== 'SCROLL_JOURNEY') return;

    window.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth',
    });
  };

  // Trigger Goal diagnostic flow
  const handleSelectAndGoal = (teamId: string) => {
    const targetIdx = TEAMS_LIST.findIndex((t) => t.id === teamId) + 1;
    if (activeSection === targetIdx) {
      setSelectedTeamId(teamId);
      // Tiny timeout to let state flush
      setTimeout(() => {
        handleGoalTriggered();
      }, 20);
    } else {
      handleNavigateToSection(targetIdx);
    }
  };

  const handleGoalTriggered = () => {
    if (phase !== 'SCROLL_JOURNEY') return;
    playGoalSound();
    setPhase('GOAL_ANIMATION');
  };

  const handleGoalAnimationComplete = () => {
    // Stage 1: Trigger full-screen neon splash and shake
    setGoalFlashActive(true);

    // Stage 2: Hold splash, then fade into the dashboard
    setTimeout(() => {
      setGoalFlashActive(false);
      setPhase('DASHBOARD');
    }, 1400);
  };

  const handleBackFromDashboard = () => {
    setPhase('SCROLL_JOURNEY');
    // Scroll cleanly back to the snapped area the user was visiting
    setTimeout(() => {
      window.scrollTo({
        top: activeSection * window.innerHeight,
        behavior: 'auto',
      });
    }, 50);
  };

  return (
    <div
      id="app-root-frame"
      className={`relative w-full min-h-screen bg-[#020208] text-slate-100 overflow-x-hidden ${
        goalFlashActive ? 'animate-shake' : ''
      }`}
    >
      {/* 3D WebGL Canvas Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <ThreeCanvas
          phase={phase}
          scrollProgress={scrollProgress}
          selectedTeamId={selectedTeamId}
          onSelectTeam={setSelectedTeamId}
          onGoalTriggered={handleGoalTriggered}
          onGoalAnimationComplete={handleGoalAnimationComplete}
        />
      </div>

      {/* PHASE 1: SCROLL-DRIVEN TACTICAL JOURNEY */}
      {phase === 'SCROLL_JOURNEY' && (
        <div className="relative w-full z-10">
          {/* Top Floating Mini-Nav */}
          <div className="fixed top-0 left-0 w-full bg-gradient-to-b from-slate-950/80 to-transparent p-5 px-6 md:px-12 flex justify-between items-center z-40 backdrop-blur-[2px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold select-none">
                World Cup 2026 // Undercurrents Live Matrix
              </span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-900/80 rounded-full px-4 py-1 text-[10px] font-mono text-slate-400">
              <span>WAYPOINT: {activeSection === 0 ? 'INTRO' : `${activeSection} / 8`}</span>
              {activeSection > 0 && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="text-white font-medium">
                    {WORLD_CUP_DATA[selectedTeamId]?.country || ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Floating Quick Waypoint Dots */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-40 bg-slate-950/40 border border-slate-900/60 p-3 rounded-full backdrop-blur-md">
            {/* Intro Dot */}
            <button
              onClick={() => handleNavigateToSection(0)}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 relative group cursor-pointer ${
                activeSection === 0
                  ? 'bg-cyan-400 border-cyan-400 scale-125 glow-cyan'
                  : 'bg-transparent border-slate-700 hover:border-cyan-400'
              }`}
              title="Introduction"
            >
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold tracking-widest text-cyan-400 scale-0 group-hover:scale-100 transition-transform origin-right select-none pr-1">
                INTRO
              </span>
            </button>

            {/* Team Waypoint Dots */}
            {TEAMS_LIST.map((team, idx) => {
              const isActive = activeSection === idx + 1;
              return (
                <button
                  key={team.id}
                  onClick={() => handleNavigateToSection(idx + 1)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 relative group cursor-pointer ${
                    isActive
                      ? 'scale-125 glow-cyan'
                      : 'bg-transparent border-slate-700 hover:border-cyan-400'
                  }`}
                  style={{
                    backgroundColor: isActive ? team.color : 'transparent',
                    borderColor: isActive ? team.color : '',
                  }}
                  title={team.country}
                >
                  <span
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold tracking-widest scale-0 group-hover:scale-100 transition-transform origin-right select-none pr-1 uppercase"
                    style={{ color: team.color }}
                  >
                    {team.id}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Section 0: The Hook / Intro Landing (Empty viewport to highlight the realistic 3D football) */}
          <section className="h-screen w-full pointer-events-none" />

          {/* Sections 1 to 8: National Squad Profiles (Alternating layout) */}
          {TEAMS_LIST.map((team, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <section
                key={team.id}
                className="h-screen w-full flex items-center px-4 md:px-12 lg:px-24 pointer-events-none relative"
                id={`section-team-${team.id}`}
              >
                {/* Tactical Detail Card - placed Left or Right based on index */}
                <div
                  className={`w-full max-w-[440px] pointer-events-auto transition-all duration-700 transform ${
                    activeSection === idx + 1
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-10 hover:opacity-30 translate-y-6'
                  } ${isEven ? 'mr-auto text-left' : 'ml-auto text-left'}`}
                >
                  <div className="bg-slate-950/85 border border-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    {/* Glowing side accent */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1.5"
                      style={{ backgroundColor: team.color }}
                    />

                    {/* Top corner Index badge */}
                    <span className="absolute top-4 right-6 text-2xl font-mono text-slate-800 font-black">
                      0{idx + 1}
                    </span>

                    {/* Team Identification */}
                    <div className="space-y-1 mb-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl select-none">{team.flag}</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                          {team.country}
                        </h2>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                        SQUAD PROFILE // SECTOR_CODE: {team.id}
                      </p>
                    </div>

                    {/* Brief Tactical evaluation snippet */}
                    <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed mb-6">
                      {team.summary}
                    </p>

                    {/* Mini Playstyle Meter Bars */}
                    <div className="space-y-3 mb-8">
                      {/* Meter 1: Control (Possession) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-cyan-400" />
                            Control Ratio (Possession %)
                          </span>
                          <span className="text-slate-300 font-bold">{team.metrics.possession_avg}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${team.metrics.possession_avg}%`,
                              backgroundColor: team.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Meter 2: Danger (Structural Risk) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-slate-500 uppercase font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Transitional Exposure (Risk)
                          </span>
                          <span className="text-slate-300 font-bold">{team.metrics.structural_risk}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${team.metrics.structural_risk}%`,
                              backgroundColor: team.secondaryColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Core CTA Diagnostic Trigger Button */}
                    <button
                      onClick={() => handleSelectAndGoal(team.id)}
                      className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 transition-all duration-300 text-xs font-mono font-bold tracking-widest uppercase cursor-pointer"
                    >
                      <span>Launch Goal Diagnostic</span>
                      <Zap className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* PHASE 2: FLASH GOAL ANIMATION BANNER */}
      {goalFlashActive && (
        <div className="fixed inset-0 w-full h-full bg-emerald-500/80 z-50 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
          {/* Radial visual zoom overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#030c05] mix-blend-multiply" />
          
          <div className="text-center space-y-4 scale-in-bounce relative z-10 px-4">
            <h1 className="text-7xl md:text-9xl font-sans font-black tracking-tighter text-white uppercase drop-shadow-2xl animate-pulse glow-text-emerald">
              GOAL!
            </h1>
            <div className="space-y-1">
              <p className="text-xs md:text-sm font-mono tracking-widest text-emerald-100 uppercase font-bold">
                [ STADIUM KINEMATICS UNLOCKED ]
              </p>
              <p className="text-[10px] md:text-xs font-mono text-emerald-200 tracking-wider">
                INJECTING ADVANCED SPORTS DIAGNOSTIC MATRIX FOR {WORLD_CUP_DATA[selectedTeamId]?.country.toUpperCase()}...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: INTERACTIVE SPORTS ANALYTICS DASHBOARD */}
      {phase === 'DASHBOARD' && (
        <Dashboard teamId={selectedTeamId} onBack={handleBackFromDashboard} />
      )}
    </div>
  );
}
