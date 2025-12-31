/**
 * Enhanced Gantt Chart Component
 * Drag-drop, dependencies, resource allocation
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { AlertDialog } from '@/components/ui/alert-dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  // Filter,
  // Plus,
  Link as LinkIcon
} from 'lucide-react';

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  assignees?: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  type?: 'task' | 'milestone' | 'project';
  parent?: string;
  resources?: string[];
}

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskCreate?: (task: Partial<GanttTask>) => void;
  onDependencyCreate?: (fromId: string, toId: string) => void;
  height?: number;
}

export const EnhancedGanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskUpdate,
  // onTaskCreate,
  onDependencyCreate,
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollX] = useState(0); // setScrollX unused
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkStart, setLinkStart] = useState<string | null>(null);

  const CELL_WIDTH = 40 * zoom;
  const ROW_HEIGHT = 40;
  const LABEL_WIDTH = 200;

  const getTaskColor = (status: GanttTask['status']): string => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'blocked':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const drawGanttChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate date range
    const allDates = tasks.flatMap(t => [t.start.getTime(), t.end.getTime()]);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    // Draw timeline header
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(LABEL_WIDTH, 0, canvas.width - LABEL_WIDTH, 30);

    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(minDate);
      date.setDate(date.getDate() + i);
      
      const x = LABEL_WIDTH + (i * CELL_WIDTH) - scrollX;
      
      if (x > LABEL_WIDTH && x < canvas.width) {
        ctx.fillText(
          `${date.getMonth() + 1}/${date.getDate()}`,
          x + 5,
          20
        );
      }
    }

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    for (let i = 0; i <= daysDiff; i++) {
      const x = LABEL_WIDTH + (i * CELL_WIDTH) - scrollX;
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw tasks
    tasks.forEach((task, index) => {
      const y = 35 + (index * ROW_HEIGHT);
      
      // Draw task label
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText(task.name.substring(0, 25), 10, y + 25);

      // Calculate task bar position
      const startDays = Math.ceil((task.start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
      
      const barX = LABEL_WIDTH + (startDays * CELL_WIDTH) - scrollX;
      const barWidth = duration * CELL_WIDTH;
      
      // Draw task bar
      const isSelected = selectedTask === task.id;
      
      ctx.fillStyle = getTaskColor(task.status);
      ctx.fillRect(barX, y + 10, barWidth, 20);
      
      // Draw progress
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.fillRect(barX, y + 10, barWidth * (task.progress / 100), 20);
      
      // Draw border
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#9ca3af';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(barX, y + 10, barWidth, 20);
      
      // Draw task text
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      const text = `${task.progress}%`;
      ctx.fillText(text, barX + 5, y + 24);

      // Draw dependencies
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) {
            const depIndex = tasks.indexOf(depTask);
            const depY = 35 + (depIndex * ROW_HEIGHT);
            const depEndDays = Math.ceil((depTask.end.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
            const depX = LABEL_WIDTH + (depEndDays * CELL_WIDTH) - scrollX;

            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(depX, depY + 20);
            ctx.lineTo(barX, y + 20);
            ctx.stroke();

            // Arrow head
            const angle = Math.atan2(y + 20 - (depY + 20), barX - depX);
            ctx.beginPath();
            ctx.moveTo(barX, y + 20);
            ctx.lineTo(barX - 8 * Math.cos(angle - Math.PI / 6), y + 20 - 8 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(barX - 8 * Math.cos(angle + Math.PI / 6), y + 20 - 8 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = '#6366f1';
            ctx.fill();
          }
        });
      }
    });
  };

  useEffect(() => {
    drawGanttChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, zoom, scrollX, selectedTask]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a task
    tasks.forEach((task, index) => {
      const taskY = 35 + (index * ROW_HEIGHT);
      if (y >= taskY + 10 && y <= taskY + 30) {
        if (linkMode && linkStart) {
          // Create dependency
          if (onDependencyCreate && linkStart !== task.id) {
            onDependencyCreate(linkStart, task.id);
          }
          setLinkMode(false);
          setLinkStart(null);
        } else {
          setSelectedTask(task.id);
          setIsDragging(true);
          setDraggedTask(task.id);
        }
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && draggedTask && onTaskUpdate) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Calculate new start date
      const task = tasks.find(t => t.id === draggedTask);
      if (task) {
        const daysMoved = Math.floor((x - LABEL_WIDTH + scrollX) / CELL_WIDTH);
        const allDates = tasks.flatMap(t => [t.start.getTime(), t.end.getTime()]);
        const minDate = new Date(Math.min(...allDates));
        
        const newStart = new Date(minDate);
        newStart.setDate(newStart.getDate() + daysMoved);
        
        const duration = task.end.getTime() - task.start.getTime();
        const newEnd = new Date(newStart.getTime() + duration);
        
        onTaskUpdate({
          ...task,
          start: newStart,
          end: newEnd
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedTask(null);
  };

  const exportToPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'gantt-chart.png';
    link.href = url;
    link.click();
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Enhanced Gantt Chart</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setLinkMode(!linkMode);
              if (!linkMode && selectedTask) {
                setLinkStart(selectedTask);
              } else {
                setLinkStart(null);
              }
            }}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPNG}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {linkMode && (
        <div className="mb-2 p-2 bg-blue-100 rounded">
          Click on another task to create dependency
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={1200}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border rounded cursor-move"
      />
    </Card>
  );
};

export default EnhancedGanttChart;
