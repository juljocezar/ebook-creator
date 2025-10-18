
import React from 'react';
import type { DocumentAnalysis } from '../types';
import { Card } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardPanelProps {
  analysis: DocumentAnalysis | null;
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-slate-800 p-4 rounded-lg">
    <p className="text-sm text-slate-400">{title}</p>
    <p className="text-2xl font-bold text-indigo-400">{value}</p>
  </div>
);

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ analysis }) => {
  return (
    <div className="h-full bg-slate-800/50 border border-slate-700 rounded-b-lg rounded-t-none border-t-0 p-4 overflow-y-auto">
      {analysis ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <StatCard title="Wortzahl" value={analysis.wordCount} />
            <StatCard title="Lesezeit" value={`${analysis.readingTime} min`} />
            <StatCard title="Tonalität" value={analysis.sentiment} />
          </div>
          <div>
            <h4 className="text-md font-semibold text-slate-200 mb-2 mt-4">Schlüsselwort-Frequenz</h4>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.keywords} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} interval={0} angle={-30} textAnchor="end" height={50}/>
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <Bar dataKey="frequency" fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p className="text-center">Die Dokumentenanalyse erscheint hier, nachdem der Orchestrator beauftragt wurde.</p>
        </div>
      )}
    </div>
  );
};
