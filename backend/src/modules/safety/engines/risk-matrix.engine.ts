/**
 * Risk Severity Matrix Engine
 * Calculates risk level based on Likelihood and Impact.
 */

export enum RiskLikelihood {
  RARE = 1,
  UNLIKELY = 2,
  POSSIBLE = 3,
  LIKELY = 4,
  ALMOST_CERTAIN = 5
}

export enum RiskImpact {
  NEGLIGIBLE = 1,
  MINOR = 2,
  MODERATE = 3,
  MAJOR = 4,
  CATASTROPHIC = 5
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME'
}

export class RiskMatrixEngine {
  static calculate(likelihood: RiskLikelihood, impact: RiskImpact): { score: number; level: RiskLevel } {
    const score = likelihood * impact;
    let level: RiskLevel;

    if (score <= 4) {
      level = RiskLevel.LOW;
    } else if (score <= 9) {
      level = RiskLevel.MEDIUM;
    } else if (score <= 16) {
      level = RiskLevel.HIGH;
    } else {
      level = RiskLevel.EXTREME;
    }

    return { score, level };
  }
}
