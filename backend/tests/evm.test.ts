import { EVMEngine } from '../src/modules/costs/engines/evm.engine';

describe('EVM Engine', () => {
  test('should calculate basic EVM metrics correctly', () => {
    const budget = 100000;
    const plannedProgress = 50; // 50%
    const actualProgress = 40; // 40%
    const actualCost = 45000;

    const input = {
      budgetAtCompletion: budget,
      plannedValue: budget * (plannedProgress / 100), // 50,000
      earnedValue: budget * (actualProgress / 100),   // 40,000
      actualCost: actualCost
    };

    const result = EVMEngine.calculate(input);

    expect(result.costVariance).toBe(-5000); // 40k - 45k
    expect(result.scheduleVariance).toBe(-10000); // 40k - 50k
    expect(result.costPerformanceIndex).toBeCloseTo(0.89, 2); // 40k / 45k = 0.888... -> 0.89
    expect(result.schedulePerformanceIndex).toBe(0.8); // 40k / 50k
  });
});
