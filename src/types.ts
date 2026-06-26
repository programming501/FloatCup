export interface Player {
  name: string;
  goals: number;
  xg: number;
  key_passes: number;
  minutes_played: number;
  position: string;
}

export interface TeamMetrics {
  possession_avg: number;       // Control Index (Possession %)
  total_goals: number;          // Total goals scored
  expected_goals_xg: number;    // Cumulative expected goals (xG)
  goals_conceded: number;       // For structural risk estimation
  shots_per_90: number;         // Attacking Volume
  pressing_intensity: number;   // Pressing Intensity (Defensive actions in high block, 0-100)
  passing_fluidity: number;     // Passing Fluidity (Pass completion %)
  structural_risk: number;      // Structural Risk (Goals conceded via direct transitions/counters, 0-100)
}

export interface TeamAnalytics {
  tacticalIdentity: string;
  winProbability: number;
  teamEfficiency: number;
  defensiveSolidity: number;
  radarMetrics: {
    controlIndex: number;
    attackingVolume: number;
    pressingIntensity: number;
    passingFluidity: number;
    structuralRisk: number;
  };
  insights: {
    mostClinicalFinisher: string;
    breakthroughCandidate: string;
    creativeHub: string;
    tacticalRisk: string;
  };
  storyline: string;
  strength: string;
  weakness: string;
}

export interface TeamData {
  id: string; // e.g. "ARG"
  country: string;
  flag: string;
  summary: string;
  color: string; // Theme color for nodes and charts
  secondaryColor: string; // High-contrast accent color
  metrics: TeamMetrics;
  players: Player[];
  analytics: TeamAnalytics;
}

export type AppPhase = 'SCROLL_JOURNEY' | 'GOAL_ANIMATION' | 'DASHBOARD';

export interface ScrollWaypoint {
  teamId: string;
  x: number;
  y: number;
  z: number;
}
