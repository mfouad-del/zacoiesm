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
    const taskMap = new Map<string, Task>();
    tasks.forEach(t => taskMap.set(t.id, { ...t, dependencies: [...t.dependencies] }));

    // Forward Pass (Calculate ES, EF)
    // Topological sort or iterative approach needed. 
    // For simplicity, we'll iterate until no changes (inefficient but works for small graphs) or use a simple dependency check.
    
    // Reset values
    tasks.forEach(t => {
      t.earlyStart = 0;
      t.earlyFinish = t.duration;
    });

    let changed = true;
    while (changed) {
      changed = false;
      for (const task of tasks) {
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
          // Update map
          taskMap.set(task.id, task);
          changed = true;
        }
      }
    }

    // Backward Pass (Calculate LS, LF, Float)
    const projectDuration = Math.max(...tasks.map(t => t.earlyFinish || 0));

    tasks.forEach(t => {
      t.lateFinish = projectDuration;
      t.lateStart = projectDuration - t.duration;
    });

    changed = true;
    while (changed) {
      changed = false;
      for (const task of tasks) {
        // Find successors
        const successors = tasks.filter(t => t.dependencies.includes(task.id));
        
        let minSuccLS = projectDuration;
        if (successors.length > 0) {
            minSuccLS = Math.min(...successors.map(s => s.lateStart || projectDuration));
        }

        if (task.lateFinish !== minSuccLS) {
            task.lateFinish = minSuccLS;
            task.lateStart = (task.lateFinish || 0) - task.duration;
            taskMap.set(task.id, task);
            changed = true;
        }
      }
    }

    // Calculate Float and Critical Path
    for (const task of tasks) {
      task.float = (task.lateStart || 0) - (task.earlyStart || 0);
      task.isCritical = task.float === 0;
    }

    return tasks;
  }
}
