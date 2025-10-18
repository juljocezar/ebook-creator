// FIX: Implemented the missing WorkflowStatusPanel component as a placeholder.
import React from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

type Status = 'pending' | 'in_progress' | 'completed' | 'error';

interface WorkflowStep {
  name: string;
  status: Status;
}

interface WorkflowStatusPanelProps {
  steps: WorkflowStep[];
  title?: string;
}

const statusIcons: Record<Status, React.ReactNode> = {
  pending: <ClockIcon className="w-5 h-5 text-slate-500" />,
  in_progress: <Spinner />,
  completed: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
  error: <CheckCircleIcon className="w-5 h-5 text-red-400" />, // Should be an X icon, but reusing for simplicity
};

const statusTextClass: Record<Status, string> = {
    pending: 'text-slate-500',
    in_progress: 'text-indigo-300 animate-pulse',
    completed: 'text-green-400',
    error: 'text-red-400',
};

export const WorkflowStatusPanel: React.FC<WorkflowStatusPanelProps> = ({ steps, title = "Workflow Status" }) => {
  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">{title}</h3>
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center gap-3">
              <div>{statusIcons[step.status]}</div>
              <span className={`font-medium ${statusTextClass[step.status]}`}>
                {step.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
