import { TeamData } from '../types';

export const WORLD_CUP_DATA: Record<string, TeamData> = {
  ARG: {
    id: "ARG",
    country: "Argentina",
    flag: "🇦🇷",
    summary: "A high-possession tactical side dominating central areas through complex passing networks, but currently facing a clinical conversion deficit in the final third.",
    color: "#4A90E2", // Celeste Blue
    secondaryColor: "#F5A623", // Sun Gold
    metrics: {
      possession_avg: 64,
      total_goals: 9,
      expected_goals_xg: 13.6,
      goals_conceded: 3,
      shots_per_90: 16.4,
      pressing_intensity: 78,
      passing_fluidity: 88,
      structural_risk: 35
    },
    players: [
      { name: "Lionel Messi", goals: 4, xg: 2.8, key_passes: 18, minutes_played: 270, position: "FW" },
      { name: "Lautaro Martínez", goals: 3, xg: 2.1, key_passes: 4, minutes_played: 180, position: "FW" },
      { name: "Julian Alvarez", goals: 1, xg: 3.8, key_passes: 8, minutes_played: 210, position: "FW" }, // Big underperformer - breakout candidate
      { name: "Alexis Mac Allister", goals: 1, xg: 1.2, key_passes: 12, minutes_played: 260, position: "MF" },
      { name: "Enzo Fernández", goals: 0, xg: 2.1, key_passes: 15, minutes_played: 250, position: "MF" }, // Breakout due
      { name: "Rodrigo De Paul", goals: 0, xg: 0.6, key_passes: 9, minutes_played: 270, position: "MF" },
      { name: "Angel Di Maria", goals: 0, xg: 1.0, key_passes: 7, minutes_played: 90, position: "FW" }
    ],
    analytics: {
      tacticalIdentity: "Controlled Attack Builder",
      winProbability: 18.4,
      teamEfficiency: 92,
      defensiveSolidity: 86,
      radarMetrics: {
        controlIndex: 88,
        attackingVolume: 84,
        pressingIntensity: 72,
        passingFluidity: 91,
        structuralRisk: 33
      },
      insights: {
        mostClinicalFinisher: "Lautaro Martinez",
        breakthroughCandidate: "Julian Alvarez",
        creativeHub: "Lionel Messi",
        tacticalRisk: "Counter attacks through left flank"
      },
      strength: "Final-third creativity",
      weakness: "Transition defense",
      storyline: "World champions blending possession control with ruthless finishing."
    }
  },
  FRA: {
    id: "FRA",
    country: "France",
    flag: "🇫🇷",
    summary: "Lethal transitional force using vertical speed in wide areas. France remains exceptionally clinical, converting low-probability chances through individual brilliance.",
    color: "#0F1C3F", // Deep Royal Blue
    secondaryColor: "#E02020", // Tricolore Red
    metrics: {
      possession_avg: 49,
      total_goals: 14,
      expected_goals_xg: 10.2,
      goals_conceded: 5,
      shots_per_90: 13.8,
      pressing_intensity: 55,
      passing_fluidity: 83,
      structural_risk: 68
    },
    players: [
      { name: "Kylian Mbappé", goals: 6, xg: 4.1, key_passes: 13, minutes_played: 270, position: "FW" }, // Overperforming clinical
      { name: "Antoine Griezmann", goals: 2, xg: 1.9, key_passes: 16, minutes_played: 260, position: "MF" },
      { name: "Olivier Giroud", goals: 3, xg: 1.6, key_passes: 3, minutes_played: 120, position: "FW" }, // Clinical super-sub
      { name: "Ousmane Dembélé", goals: 1, xg: 3.2, key_passes: 11, minutes_played: 210, position: "FW" }, // High volume, low goals - breakout due!
      { name: "Marcus Thuram", goals: 1, xg: 1.8, key_passes: 5, minutes_played: 140, position: "FW" },
      { name: "Aurélien Tchouaméni", goals: 1, xg: 0.4, key_passes: 6, minutes_played: 270, position: "MF" }
    ],
    analytics: {
      tacticalIdentity: "Vertical Transition Machine",
      winProbability: 17.8,
      teamEfficiency: 94,
      defensiveSolidity: 84,
      radarMetrics: {
        controlIndex: 78,
        attackingVolume: 91,
        pressingIntensity: 80,
        passingFluidity: 82,
        structuralRisk: 37
      },
      insights: {
        mostClinicalFinisher: "Kylian Mbappe",
        breakthroughCandidate: "Randal Kolo Muani",
        creativeHub: "Antoine Griezmann",
        tacticalRisk: "Space behind attacking fullbacks"
      },
      strength: "Fast transitions",
      weakness: "Wide defensive coverage",
      storyline: "Elite athleticism combined with devastating counterattacks."
    }
  },
  BRA: {
    id: "BRA",
    country: "Brazil",
    flag: "🇧🇷",
    summary: "A fluid, highly creative system leveraging technical 1v1 superiorities. Defensively robust in standard phases, but highly exposed to rapid direct counter-attacks.",
    color: "#FEDD00", // Canary Yellow
    secondaryColor: "#009B3A", // Green
    metrics: {
      possession_avg: 58,
      total_goals: 11,
      expected_goals_xg: 12.8,
      goals_conceded: 4,
      shots_per_90: 17.2,
      pressing_intensity: 70,
      passing_fluidity: 87,
      structural_risk: 75
    },
    players: [
      { name: "Vinícius Júnior", goals: 5, xg: 3.4, key_passes: 11, minutes_played: 250, position: "FW" }, // High efficiency
      { name: "Rodrygo Goes", goals: 2, xg: 2.1, key_passes: 14, minutes_played: 240, position: "FW" },
      { name: "Raphinha", goals: 2, xg: 1.8, key_passes: 10, minutes_played: 200, position: "FW" },
      { name: "Richarlison Andrade", goals: 1, xg: 3.5, key_passes: 4, minutes_played: 160, position: "FW" }, // Underperforming breakout!
      { name: "Lucas Paquetá", goals: 1, xg: 1.4, key_passes: 12, minutes_played: 230, position: "MF" },
      { name: "Bruno Guimarães", goals: 0, xg: 0.6, key_passes: 8, minutes_played: 270, position: "MF" }
    ],
    analytics: {
      tacticalIdentity: "Explosive Attacking Force",
      winProbability: 16.9,
      teamEfficiency: 89,
      defensiveSolidity: 81,
      radarMetrics: {
        controlIndex: 82,
        attackingVolume: 93,
        pressingIntensity: 76,
        passingFluidity: 84,
        structuralRisk: 42
      },
      insights: {
        mostClinicalFinisher: "Vinicius Junior",
        breakthroughCandidate: "Endrick",
        creativeHub: "Bruno Guimaraes",
        tacticalRisk: "Aggressive attacking shape"
      },
      strength: "Individual brilliance",
      weakness: "Defensive structure",
      storyline: "Five-time champions powered by flair and relentless attacking talent."
    }
  },
  ENG: {
    id: "ENG",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    summary: "Pragmatic, structure-oriented unit with immense physical dominance on set-pieces. Slow, methodical build-up minimizes risk but occasionally starves forwards.",
    color: "#FFFFFF", // Pure White
    secondaryColor: "#002040", // Navy Blue
    metrics: {
      possession_avg: 55,
      total_goals: 8,
      expected_goals_xg: 9.8,
      goals_conceded: 2,
      shots_per_90: 11.2,
      pressing_intensity: 62,
      passing_fluidity: 85,
      structural_risk: 28
    },
    players: [
      { name: "Harry Kane", goals: 3, xg: 3.2, key_passes: 7, minutes_played: 260, position: "FW" },
      { name: "Jude Bellingham", goals: 3, xg: 1.5, key_passes: 9, minutes_played: 270, position: "MF" }, // Highly clinical runner
      { name: "Bukayo Saka", goals: 1, xg: 2.6, key_passes: 12, minutes_played: 240, position: "FW" }, // Underperforming breakout candidate
      { name: "Phil Foden", goals: 1, xg: 2.1, key_passes: 14, minutes_played: 220, position: "FW" },
      { name: "Declan Rice", goals: 0, xg: 0.4, key_passes: 5, minutes_played: 270, position: "MF" },
      { name: "Cole Palmer", goals: 0, xg: 1.6, key_passes: 8, minutes_played: 90, position: "MF" } // High efficiency/minute outlier
    ],
    analytics: {
      tacticalIdentity: "Structured Direct Play",
      winProbability: 14.8,
      teamEfficiency: 87,
      defensiveSolidity: 89,
      radarMetrics: {
        controlIndex: 76,
        attackingVolume: 85,
        pressingIntensity: 74,
        passingFluidity: 80,
        structuralRisk: 28
      },
      insights: {
        mostClinicalFinisher: "Harry Kane",
        breakthroughCandidate: "Cole Palmer",
        creativeHub: "Jude Bellingham",
        tacticalRisk: "Dependence on Kane finishing"
      },
      strength: "Set pieces",
      weakness: "Chance conversion under pressure",
      storyline: "Tournament specialists searching for a second world title."
    }
  },
  ESP: {
    id: "ESP",
    country: "Spain",
    flag: "🇪🇸",
    summary: "Ultra-fluid, possession-heavy style leveraging teenage phenoms on the wings. Extremely high pass completion, but vulnerable to physical low-block resistance.",
    color: "#C60B1E", // Spanish Red
    secondaryColor: "#FEB20A", // Spanish Yellow
    metrics: {
      possession_avg: 68,
      total_goals: 12,
      expected_goals_xg: 14.5,
      goals_conceded: 4,
      shots_per_90: 18.5,
      pressing_intensity: 88,
      passing_fluidity: 92,
      structural_risk: 42
    },
    players: [
      { name: "Alvaro Morata", goals: 2, xg: 4.5, key_passes: 4, minutes_played: 210, position: "FW" }, // Traditional xG underperformer, but vital
      { name: "Lamine Yamal", goals: 3, xg: 2.2, key_passes: 15, minutes_played: 240, position: "FW" }, // Clinical wonderkid
      { name: "Nico Williams", goals: 3, xg: 2.4, key_passes: 11, minutes_played: 230, position: "FW" },
      { name: "Dani Olmo", goals: 3, xg: 1.9, key_passes: 13, minutes_played: 180, position: "MF" }, // Hyper-efficient
      { name: "Pedri González", goals: 1, xg: 2.1, key_passes: 19, minutes_played: 250, position: "MF" },
      { name: "Fabián Ruiz", goals: 0, xg: 1.4, key_passes: 8, minutes_played: 260, position: "MF" }
    ],
    analytics: {
      tacticalIdentity: "Possession Dominator",
      winProbability: 13.5,
      teamEfficiency: 84,
      defensiveSolidity: 90,
      radarMetrics: {
        controlIndex: 96,
        attackingVolume: 81,
        pressingIntensity: 83,
        passingFluidity: 95,
        structuralRisk: 21
      },
      insights: {
        mostClinicalFinisher: "Alvaro Morata",
        breakthroughCandidate: "Lamine Yamal",
        creativeHub: "Pedri",
        tacticalRisk: "Low direct threat versus deep blocks"
      },
      strength: "Ball retention",
      weakness: "Breaking compact defenses",
      storyline: "Masters of possession football with a new golden generation emerging."
    }
  },
  GER: {
    id: "GER",
    country: "Germany",
    flag: "🇩🇪",
    summary: "Heavy-metal gegenpressing and high-octane central rotations. Germany creates massive high-quality chances but is prone to wild transitional instability.",
    color: "#2D2D2D", // Modern Charcoal
    secondaryColor: "#FFCC00", // Yellow-Gold
    metrics: {
      possession_avg: 59,
      total_goals: 13,
      expected_goals_xg: 15.2,
      goals_conceded: 6,
      shots_per_90: 19.1,
      pressing_intensity: 85,
      passing_fluidity: 86,
      structural_risk: 72
    },
    players: [
      { name: "Jamal Musiala", goals: 5, xg: 2.9, key_passes: 14, minutes_played: 250, position: "MF" }, // Super clinical dribbler
      { name: "Kai Havertz", goals: 2, xg: 4.4, key_passes: 9, minutes_played: 230, position: "FW" }, // Large xG mismatch - due a major brace
      { name: "Florian Wirtz", goals: 3, xg: 2.6, key_passes: 16, minutes_played: 240, position: "MF" },
      { name: "Niclas Füllkrug", goals: 2, xg: 1.2, key_passes: 2, minutes_played: 80, position: "FW" }, // Highly efficient sub
      { name: "Leroy Sané", goals: 1, xg: 2.8, key_passes: 8, minutes_played: 150, position: "FW" }, // Breakout due
      { name: "İlkay Gündoğan", goals: 0, xg: 1.3, key_passes: 11, minutes_played: 260, position: "MF" }
    ],
    analytics: {
      tacticalIdentity: "High-Efficiency Machine",
      winProbability: 12.9,
      teamEfficiency: 88,
      defensiveSolidity: 87,
      radarMetrics: {
        controlIndex: 83,
        attackingVolume: 88,
        pressingIntensity: 86,
        passingFluidity: 85,
        structuralRisk: 34
      },
      insights: {
        mostClinicalFinisher: "Kai Havertz",
        breakthroughCandidate: "Jamal Musiala",
        creativeHub: "Florian Wirtz",
        tacticalRisk: "Defensive line exposed in transitions"
      },
      strength: "Collective pressing",
      weakness: "Recovery pace",
      storyline: "A football powerhouse rebuilt around youth and tactical discipline."
    }
  },
  POR: {
    id: "POR",
    country: "Portugal",
    flag: "🇵🇹",
    summary: "A talent-dense squad balancing structural midfield control with wing dynamism. Prone to a heavy final-third bottleneck centering on high-volume shot profiles.",
    color: "#006600", // Deep Forest Green
    secondaryColor: "#FF0000", // Portuguese Red
    metrics: {
      possession_avg: 57,
      total_goals: 10,
      expected_goals_xg: 12.1,
      goals_conceded: 3,
      shots_per_90: 15.8,
      pressing_intensity: 65,
      passing_fluidity: 86,
      structural_risk: 45
    },
    players: [
      { name: "Cristiano Ronaldo", goals: 2, xg: 4.8, key_passes: 5, minutes_played: 270, position: "FW" }, // Extreme volume, low conversion outlier
      { name: "Bruno Fernandes", goals: 4, xg: 2.2, key_passes: 21, minutes_played: 270, position: "MF" }, // Highly clinical creator
      { name: "Rafael Leão", goals: 2, xg: 1.9, key_passes: 10, minutes_played: 210, position: "FW" },
      { name: "Gonçalo Ramos", goals: 1, xg: 1.1, key_passes: 2, minutes_played: 90, position: "FW" },
      { name: "Bernardo Silva", goals: 1, xg: 0.9, key_passes: 14, minutes_played: 250, position: "MF" },
      { name: "João Félix", goals: 0, xg: 1.2, key_passes: 6, minutes_played: 100, position: "FW" }
    ],
    analytics: {
      tacticalIdentity: "Counterattacking Precision",
      winProbability: 10.7,
      teamEfficiency: 86,
      defensiveSolidity: 85,
      radarMetrics: {
        controlIndex: 79,
        attackingVolume: 84,
        pressingIntensity: 73,
        passingFluidity: 87,
        structuralRisk: 31
      },
      insights: {
        mostClinicalFinisher: "Cristiano Ronaldo",
        breakthroughCandidate: "Joao Neves",
        creativeHub: "Bruno Fernandes",
        tacticalRisk: "Over-reliance on central progression"
      },
      strength: "Midfield creativity",
      weakness: "Defensive width",
      storyline: "A technically gifted squad balancing experience with emerging stars."
    }
  },
  USA: {
    id: "USA",
    country: "United States",
    flag: "🇺🇸",
    summary: "Dynamic, athletic modern pressers operating at extremely high intensity. Prone to execution errors in low-tempo possession phases but deadly on secondary balls.",
    color: "#0A1F44", // Navy Blue
    secondaryColor: "#BF0A30", // Red
    metrics: {
      possession_avg: 51,
      total_goals: 7,
      expected_goals_xg: 9.4,
      goals_conceded: 4,
      shots_per_90: 13.2,
      pressing_intensity: 80,
      passing_fluidity: 81,
      structural_risk: 50
    },
    players: [
      { name: "Christian Pulisic", goals: 3, xg: 2.1, key_passes: 11, minutes_played: 270, position: "FW" }, // Talismanic outlier
      { name: "Folarin Balogun", goals: 1, xg: 3.1, key_passes: 3, minutes_played: 190, position: "FW" }, // Underperforming breakout star
      { name: "Timothy Weah", goals: 1, xg: 1.4, key_passes: 7, minutes_played: 220, position: "FW" },
      { name: "Weston McKennie", goals: 1, xg: 1.2, key_passes: 8, minutes_played: 250, position: "MF" },
      { name: "Yunus Musah", goals: 0, xg: 0.8, key_passes: 9, minutes_played: 240, position: "MF" },
      { name: "Ricardo Pepi", goals: 1, xg: 0.8, key_passes: 2, minutes_played: 80, position: "FW" }
    ],
    analytics: {
      tacticalIdentity: "High Intensity Transition Play",
      winProbability: 4.9,
      teamEfficiency: 78,
      defensiveSolidity: 75,
      radarMetrics: {
        controlIndex: 67,
        attackingVolume: 72,
        pressingIntensity: 81,
        passingFluidity: 73,
        structuralRisk: 45
      },
      insights: {
        mostClinicalFinisher: "Christian Pulisic",
        breakthroughCandidate: "Folarin Balogun",
        creativeHub: "Weston McKennie",
        tacticalRisk: "Defensive gaps during aggressive pressing"
      },
      strength: "Athletic intensity",
      weakness: "Elite finishing",
      storyline: "A rapidly improving football nation aiming to surprise on home soil."
    }
  }
};

export const TEAMS_LIST = Object.values(WORLD_CUP_DATA);
