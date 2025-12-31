import { PlanningTask, Expense } from '../types';

// --- Earned Value Management (EVM) ---

export interface EVMMetrics {
  PV: number; // Planned Value
  EV: number; // Earned Value
  AC: number; // Actual Cost
  CPI: number; // Cost Performance Index
  SPI: number; // Schedule Performance Index
  CV: number; // Cost Variance
  SV: number; // Schedule Variance
  EAC: number; // Estimate at Completion
  ETC: number; // Estimate to Complete
  VAC: number; // Variance at Completion
}

export function calculateEVM(
  tasks: PlanningTask[],
  expenses: Expense[],
  totalBudget: number,
  currentDate: Date = new Date()
): EVMMetrics {
  // 1. Calculate PV (Planned Value)
  // Sum of budget for all work scheduled to be completed by current date
  const pv = tasks.reduce((acc, task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (currentDate < start) return acc;
    
    const taskBudget = task.budget || 0; // Assuming task has a budget field, or we estimate it
    
    if (currentDate >= end) {
      return acc + taskBudget;
    } else {
      // Pro-rated PV for in-progress tasks
      const daysElapsed = (currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const percentPlanned = Math.min(1, Math.max(0, daysElapsed / duration));
      return acc + (taskBudget * percentPlanned);
    }
  }, 0);

  // 2. Calculate EV (Earned Value)
  // Sum of budget for work actually completed
  const ev = tasks.reduce((acc, task) => {
    const taskBudget = task.budget || 0;
    return acc + (taskBudget * (task.progress / 100));
  }, 0);

  // 3. Calculate AC (Actual Cost)
  // Sum of all actual expenses recorded
  const ac = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  // 4. Calculate Indices
  const cpi = ac === 0 ? 1 : ev / ac;
  const spi = pv === 0 ? 1 : ev / pv;

  // 5. Calculate Variances
  const cv = ev - ac;
  const sv = ev - pv;

  // 6. Forecasting
  const eac = cpi === 0 ? totalBudget : totalBudget / cpi;
  const etc = eac - ac;
  const vac = totalBudget - eac;

  return {
    PV: pv,
    EV: ev,
    AC: ac,
    CPI: cpi,
    SPI: spi,
    CV: cv,
    SV: sv,
    EAC: eac,
    ETC: etc,
    VAC: vac
  };
}

// --- Critical Path Method (CPM) ---

export interface CPMTask extends PlanningTask {
  es: number; // Early Start
  ef: number; // Early Finish
  ls: number; // Late Start
  lf: number; // Late Finish
  slack: number;
  isCritical: boolean;
}

export function calculateCPM(tasks: PlanningTask[]): CPMTask[] {
  // This is a simplified CPM implementation
  // In a real scenario, we need a dependency graph (predecessors/successors)
  // Assuming tasks have 'dependencies' array of IDs

  const taskMap = new Map<string, CPMTask>();
  
  // Initialize
  tasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      es: 0,
      ef: 0,
      ls: Infinity,
      lf: Infinity,
      slack: 0,
      isCritical: false
    });
  });

  // Forward Pass (Calculate ES, EF)
  // Note: This requires topologically sorted tasks or multiple passes. 
  // For simplicity, we'll assume tasks are somewhat ordered or do a multi-pass approach.
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const task of taskMap.values()) {
      let maxPredecessorEF = 0;
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const dep = taskMap.get(depId);
          if (dep && dep.ef > maxPredecessorEF) {
            maxPredecessorEF = dep.ef;
          }
        });
      }
      
      const newES = maxPredecessorEF;
      const newEF = newES + task.duration;
      
      if (newES !== task.es || newEF !== task.ef) {
        task.es = newES;
        task.ef = newEF;
        changed = true;
      }
    }
  }

  // Backward Pass (Calculate LS, LF)
  const projectDuration = Math.max(...Array.from(taskMap.values()).map(t => t.ef));
  
  // Initialize LF for tasks with no successors to projectDuration
  // (Simplified: set all LF to projectDuration initially, then refine)
  for (const task of taskMap.values()) {
    task.lf = projectDuration;
    task.ls = task.lf - task.duration;
  }

  changed = true;
  while (changed) {
    changed = false;
    for (const task of taskMap.values()) {
      // Find successors
      const successors = Array.from(taskMap.values()).filter(t => t.dependencies?.includes(task.id));
      
      if (successors.length > 0) {
        const minSuccessorLS = Math.min(...successors.map(s => s.ls));
        if (minSuccessorLS < task.lf) {
          task.lf = minSuccessorLS;
          task.ls = task.lf - task.duration;
          changed = true;
        }
      }
    }
  }

  // Calculate Slack and Critical Path
  for (const task of taskMap.values()) {
    task.slack = task.ls - task.es;
    task.isCritical = task.slack === 0;
  }

  return Array.from(taskMap.values());
}
