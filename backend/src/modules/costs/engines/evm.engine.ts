/**
 * Earned Value Management (EVM) Engine
 * Calculates key performance indicators for project cost and schedule.
 */

export interface EVMInput {
  budgetAtCompletion: number; // BAC
  plannedValue: number;       // PV
  earnedValue: number;        // EV
  actualCost: number;         // AC
}

export interface EVMMetrics {
  scheduleVariance: number;   // SV
  costVariance: number;       // CV
  schedulePerformanceIndex: number; // SPI
  costPerformanceIndex: number;     // CPI
  estimateAtCompletion: number;     // EAC
  estimateToComplete: number;       // ETC
  varianceAtCompletion: number;     // VAC
  toCompletePerformanceIndex: number; // TCPI
}

export class EVMEngine {
  static calculate(input: EVMInput): EVMMetrics {
    const { budgetAtCompletion, plannedValue, earnedValue, actualCost } = input;

    // Variances
    const scheduleVariance = earnedValue - plannedValue;
    const costVariance = earnedValue - actualCost;

    // Indices (Handle division by zero)
    const schedulePerformanceIndex = plannedValue !== 0 ? earnedValue / plannedValue : 0;
    const costPerformanceIndex = actualCost !== 0 ? earnedValue / actualCost : 0;

    // Forecasting
    // EAC = BAC / CPI (assuming current variance continues)
    const estimateAtCompletion = costPerformanceIndex !== 0 ? budgetAtCompletion / costPerformanceIndex : budgetAtCompletion;
    
    // ETC = EAC - AC
    const estimateToComplete = estimateAtCompletion - actualCost;

    // VAC = BAC - EAC
    const varianceAtCompletion = budgetAtCompletion - estimateAtCompletion;

    // TCPI = (BAC - EV) / (BAC - AC)
    const remainingBudget = budgetAtCompletion - actualCost;
    const remainingWork = budgetAtCompletion - earnedValue;
    const toCompletePerformanceIndex = remainingBudget !== 0 ? remainingWork / remainingBudget : 0;

    return {
      scheduleVariance,
      costVariance,
      schedulePerformanceIndex,
      costPerformanceIndex,
      estimateAtCompletion,
      estimateToComplete,
      varianceAtCompletion,
      toCompletePerformanceIndex
    };
  }
}
