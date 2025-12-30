import { CPMEngine, Task } from '../src/modules/planning/engines/critical-path.engine';

describe('Critical Path Engine', () => {
  test('should identify critical path correctly', () => {
    const tasks: Task[] = [
      { id: 'A', duration: 3, dependencies: [] },
      { id: 'B', duration: 5, dependencies: ['A'] },
      { id: 'C', duration: 2, dependencies: ['A'] },
      { id: 'D', duration: 4, dependencies: ['B'] },
      { id: 'E', duration: 3, dependencies: ['C'] },
    ];

    // Path 1: A(3) -> B(5) -> D(4) = 12 days
    // Path 2: A(3) -> C(2) -> E(3) = 8 days
    // Critical Path should be A -> B -> D

    const result = CPMEngine.calculate(tasks);

    // Find max EF
    const projectDuration = Math.max(...result.map(t => t.earlyFinish || 0));
    expect(projectDuration).toBe(12);

    const criticalTasks = result.filter(t => t.isCritical).map(t => t.id);
    expect(criticalTasks).toContain('A');
    expect(criticalTasks).toContain('B');
    expect(criticalTasks).toContain('D');
    expect(criticalTasks).not.toContain('C');
    expect(criticalTasks).not.toContain('E');
  });
});
