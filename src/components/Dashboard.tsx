import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Label,
} from 'recharts';
import { WORLD_CUP_DATA } from '../data/world_cup_data';
import { ArrowLeft, Target, Shield, Gauge, Cpu, Zap, Eye, ChevronRight } from 'lucide-react';

interface DashboardProps {
  teamId: string;
  onBack: () => void;
}

export default function Dashboard({ teamId, onBack }: DashboardProps) {
  const team = useMemo(() => WORLD_CUP_DATA[teamId] || WORLD_CUP_DATA.ARG, [teamId]);

  // View 1: Outlier Scatter Plot Data (Goals vs xG)
  const scatterData = useMemo(() => {
    return team.players.map((p) => ({
      name: p.name,
      xg: p.xg,
      goals: p.goals,
      keyPasses: p.key_passes,
      position: p.position,
      minutes_played: p.minutes_played,
      // Scoring Efficiency Delta = Goals - xG
      delta: Number((p.goals - p.xg).toFixed(2)),
    }));
  }, [team]);

  // Determine diagonal baseline bounds based on highest goals/xG value
  const scatterMax = useMemo(() => {
    const maxVal = Math.max(...team.players.map((p) => Math.max(p.goals, p.xg)));
    return Math.ceil(maxVal) + 0.5;
  }, [team]);

  const baselineData = useMemo(() => {
    return [
      { xg: 0, goals: 0 },
      { xg: scatterMax, goals: scatterMax },
    ];
  }, [scatterMax]);

  // View 2: Team Game-State Archetype (Radar Chart 5-point playstyle profile)
  const radarData = useMemo(() => {
    return [
      { subject: 'Attacking Volume', value: Math.round((team.metrics.shots_per_90 / 22) * 100) },
      { subject: 'Control Index', value: team.metrics.possession_avg },
      { subject: 'Pressing Intensity', value: team.metrics.pressing_intensity },
      { subject: 'Passing Fluidity', value: team.metrics.passing_fluidity },
      { subject: 'Structural Risk', value: team.metrics.structural_risk },
    ];
  }, [team]);

  // Sort players by breakout score (scoring efficiency delta: goals - xG) ascending
  // Highest negative deltas (goals < xG) represent the biggest breakout due players!
  const breakoutDuePlayers = useMemo(() => {
    return [...scatterData].sort((a, b) => a.delta - b.delta);
  }, [scatterData]);

  // Custom tooltips for Scatter chart
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.name) {
        const isHot = data.delta > 0;
        const isCold = data.delta < 0;

        return (
          <div className="bg-slate-950/95 border border-slate-800 p-3.5 rounded-lg shadow-2xl backdrop-blur-md font-sans text-xs max-w-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-semibold text-sm text-white">{data.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                {data.position}
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-slate-300 mt-2 border-t border-slate-900 pt-2">
              <div className="flex justify-between">
                <span>Goals Scored:</span>
                <span className="font-semibold text-emerald-400">{data.goals}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Goals (xG):</span>
                <span className="font-semibold text-blue-400">{data.xg}</span>
              </div>
              <div className="flex justify-between">
                <span>Scoring Delta (G - xG):</span>
                <span
                  className={`font-semibold ${
                    isHot ? 'text-emerald-400' : isCold ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {data.delta > 0 ? `+${data.delta}` : data.delta}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Key Passes:</span>
                <span className="font-semibold text-purple-400">{data.keyPasses}</span>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-900 pt-1.5 leading-relaxed">
              {isCold ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ PERFORMANCE CAP: Underperforming expected goals. Highly likely to see goal conversion regression to mean soon.
                </span>
              ) : isHot ? (
                <span className="text-emerald-400 font-medium">
                  🔥 CLINICAL STREAK: Converting low-probability opportunities. Highly efficient finishing phase.
                </span>
              ) : (
                <span>Consistent performance matching expected opportunities perfectly.</span>
              )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div id="dashboard-overlay" className="fixed inset-0 w-full h-full bg-[#03030c] text-slate-100 z-50 flex flex-col p-4 md:p-8 overflow-y-auto font-sans select-text">
      {/* 1. Header Navigation Bar */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-900">
        <div className="flex items-center gap-4">
          <button
            id="close-btn"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-700 transition-all duration-300 text-sm font-medium text-slate-300 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Globe View</span>
          </button>
          
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{team.flag}</span>
            <div>
              <h1 id="dash-title" className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {team.country}
                <span className="text-xs font-mono font-medium tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                  Advanced Metrics Live
                </span>
              </h1>
              <p className="text-xs font-mono text-slate-500">
                {team.country.toUpperCase()} SQUAD PERFORMANCE SUMMARY
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Concept Note */}
        <div className="hidden lg:flex items-center gap-2.5 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg max-w-sm">
          <Cpu className="w-8 h-8 text-cyan-400 shrink-0 opacity-80" />
          <p className="text-[10px] text-slate-400 leading-normal">
            <strong>Analytic Model:</strong> Evaluates expected goals ($xG$) and tactical features to isolate true squad performance metrics from standard box scores.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 py-6">
        {/* 2. Tactical Summary Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-900 rounded-xl p-5 md:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">Tactical Insights Report</span>
            </div>
            <p id="dash-summary" className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              &ldquo;{team.summary}&rdquo;
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 text-center sm:text-left">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Control Ratio</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {team.metrics.possession_avg}%
              </div>
              <div className="text-[9px] font-mono text-slate-400">Possession Average</div>
            </div>
            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 text-center sm:text-left">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Offensive Flow</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {team.metrics.total_goals} / <span className="text-cyan-400">{team.metrics.expected_goals_xg}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">Goals vs Expected xG</div>
            </div>
            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 text-center sm:text-left col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Conversion Delta</div>
              <div className={`text-xl font-bold font-mono mt-1 ${
                (team.metrics.total_goals - team.metrics.expected_goals_xg) >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {(team.metrics.total_goals - team.metrics.expected_goals_xg).toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-slate-400">Goals minus xG</div>
            </div>
          </div>
        </div>

        {/* 3. Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Goals vs xG Scatter Plot */}
          <div className="chart-container bg-slate-950/40 border border-slate-900 rounded-xl p-4 md:p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Expected Goals ($xG$) vs Actual Goals Scored
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  INDIVIDUAL PLAYER CLINICAL SHOT EFFICIENCY
                </p>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded font-mono">
                Scatter View
              </span>
            </div>

            <div className="w-full h-[320px] shrink-0 font-mono text-[10px] mt-2 relative select-none">
              {/* Labels */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 bg-slate-950/80 p-2 rounded border border-slate-800 text-[9px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                  <span>Squad Players</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0 border-t border-dashed border-slate-500" />
                  <span>Parity Line (xG = Goals)</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <XAxis
                    type="number"
                    dataKey="xg"
                    name="Expected Goals"
                    stroke="#475569"
                    domain={[0, scatterMax]}
                    tickCount={6}
                  >
                    <Label value="Expected Goals (xG)" offset={-10} position="insideBottom" fill="#64748b" className="text-[10px] font-mono font-medium" />
                  </XAxis>
                  <YAxis
                    type="number"
                    dataKey="goals"
                    name="Goals Scored"
                    stroke="#475569"
                    domain={[0, scatterMax]}
                    tickCount={6}
                  >
                    <Label value="Actual Goals" angle={-90} position="insideLeft" offset={5} fill="#64748b" className="text-[10px] font-mono font-medium" />
                  </YAxis>
                  <Tooltip content={<CustomScatterTooltip />} />
                  
                  {/* Diagonal Line (Shape overrides to make it a line) */}
                  <Scatter
                    name="Baseline"
                    data={baselineData}
                    fill="transparent"
                    line={{ stroke: '#64748b', strokeDasharray: '4 4', strokeWidth: 1.5, opacity: 0.6 }}
                    shape={() => null}
                  />

                  {/* Player Scatter Nodes */}
                  <Scatter
                    name="Players"
                    data={scatterData}
                    fill={team.color}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Quick scatter plot insights */}
            <div className="mt-4 pt-3 border-t border-slate-900 grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg space-y-1">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">Zone: Highly Clinical</span>
                <p className="text-slate-400 leading-relaxed">
                  Located <strong>above the parity line</strong>. Overperforming expected output. Converting low-probability chances with elite finishing.
                </p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider block">Zone: Due Breakout</span>
                <p className="text-slate-400 leading-relaxed">
                  Located <strong>below the parity line</strong>. Creating high-probability opportunities ($xG$) but currently underperforming on conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Chart B: Team Game-State Archetype Radar Chart */}
          <div className="chart-container bg-slate-950/40 border border-slate-900 rounded-xl p-4 md:p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Structural Playstyle Profile & Tactical Archetype
                </h3>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  5-POINT GAME STATE ATTRIBUTE RADIAL VECTOR
                </p>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded font-mono">
                Radar View
              </span>
            </div>

            <div className="w-full h-[320px] shrink-0 font-mono text-[9px] mt-2 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#334155" tick={{ fill: '#475569' }} />
                  <Radar
                    name={team.country}
                    dataKey="value"
                    stroke={team.color}
                    fill={team.color}
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Coach/Front Office Tactical Evaluation */}
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-900">
              <Gauge className="w-8 h-8 text-purple-400 shrink-0" />
              <div className="text-[10px] space-y-0.5">
                <span className="text-slate-300 font-semibold block uppercase">Front Office Strategic Analysis</span>
                <p className="text-slate-400 leading-relaxed">
                  This style profile displays a high-contrast structure. High control and possession suppresses opponent transitions, while high structural risk represents vulnerability on rapid turnovers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Squad Analysis table - highlights statistical breakout candidates */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 md:p-6 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-900">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Squad Performance & Scoring Metrics
              </h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                PLAYER STATS ORDERED BY SCORING BIAS (GOALS MINUS EXPECTED xG)
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-500/25 border border-amber-500/50" />
                <span>Underperforming xG (Due Breakout)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500/25 border border-emerald-500/50" />
                <span>Overperforming xG (Clinical Finisher)</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono text-[10px]">
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Pos</th>
                  <th className="py-3 px-4 text-right">Minutes Played</th>
                  <th className="py-3 px-4 text-right">Actual Goals</th>
                  <th className="py-3 px-4 text-right">Expected Goals (xG)</th>
                  <th className="py-3 px-4 text-right">Key Passes</th>
                  <th className="py-3 px-4 text-right">Goals - xG Delta</th>
                  <th className="py-3 px-4 text-center">Efficiency Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-mono">
                {breakoutDuePlayers.map((player) => {
                  const isCold = player.delta < 0;
                  const isHot = player.delta > 0;

                  return (
                    <tr
                      key={player.name}
                      className={`hover:bg-slate-950/80 transition-colors group ${
                        isCold ? 'bg-amber-500/[0.015]' : isHot ? 'bg-emerald-500/[0.015]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-sans font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {player.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400">
                          {player.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">{player.minutes_played} mins</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">{player.goals}</td>
                      <td className="py-3 px-4 text-right text-cyan-400 font-bold">{player.xg}</td>
                      <td className="py-3 px-4 text-right text-purple-400">{player.keyPasses}</td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        isCold ? 'text-amber-400' : isHot ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {player.delta > 0 ? `+${player.delta}` : player.delta}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCold ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                            🚨 DUE BREAKOUT
                          </span>
                        ) : isHot ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                            ⚡ CLINICAL FINISHER
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-500">
                            • BALANCED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
