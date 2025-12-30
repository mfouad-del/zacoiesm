/**
 * Critical Path Method (CPM) Engine
 * Calculates Early Start, Early Finish, Late Start, Late Finish, and Float.
 */

export interface Task {
  id: string;
  duration: number;
  dependencies: string[]; // IDs of predecessor tasks
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  float?: number;
  isCritical?: boolean;
}

export class CPMEngine {
  static calculate(tasks: Task[]): Task[] {
    // Create a map of working objects
    const taskMap = new Map<string, Task>();
    tasks.forEach(t => taskMap.set(t.id, { ...t, dependencies: [...t.dependencies] }));

    const workingTasks = Array.from(taskMap.values());

    // Reset values
    workingTasks.forEach(t => {
      t.earlyStart = 0;
      t.earlyFinish = t.duration;
    });

    // Forward Pass
    let changed = true;
    while (changed) {
      changed = false;
      for (const task of workingTasks) {
        let maxPrevEF = 0;
        for (const depId of task.dependencies) {
          const depTask = taskMap.get(depId);
          if (depTask && depTask.earlyFinish !== undefined) {
            if (depTask.earlyFinish > maxPrevEF) {
              maxPrevEF = depTask.earlyFinish;
            }
          }
        }
        
        if (task.earlyStart !== maxPrevEF) {
          task.earlyStart = maxPrevEF;
          task.earlyFinish = (task.earlyStart || 0) + task.duration;
          changed = true;
        }
      }
    }

    // Backward Pass
    const projectDuration = Math.max(...workingTasks.map(t => t.earlyFinish || 0));
    
    // Initialize Late dates
    workingTasks.forEach(t => {
      t.lateFinish = projectDuration;
      t.lateStart = projectDuration - t.duration;
    });

    changed = true;
    while (changed) {
      changed = false;
      for (const task of workingTasks) {
        let minNextLS = projectDuration;
        
        // Find successors
        const successors = workingTasks.filter(t => t.dependencies.includes(task.id));
        
        if (successors.length > 0) {
          const successorStarts = successors.map(s => s.lateStart !== undefined ? s.lateStart : projectDuration);
          minNextLS = Math.min(...successorStarts);
        }

        if (task.lateFinish !== minNextLS) {
          task.lateFinish = minNextLS;
          task.lateStart = task.lateFinish - task.duration;
          changed = true;
        }
      }
    }

    // Calculate Float & Criticality
    workingTasks.forEach(t => {
      t.float = (t.lateStart || 0) - (t.earlyStart || 0);
      // Float can be slightly off due to floating point, but here we use integers mostly.
      // Critical if float is 0
      t.isCritical = Math.abs(t.float) < 0.001;
    });

    return workingTasks;
  }
}
