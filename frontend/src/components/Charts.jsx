import React from 'react';
import { FileCode, FileText, HelpCircle } from 'lucide-react';

export const Charts = ({ stats }) => {
  const timeline = stats?.chat_timeline || [{ date: 'Today', count: 0 }];
  const maxCount = Math.max(...timeline.map((t) => t.count), 5);
  const dist = stats?.document_types_distribution || { pdf: 0, docx: 0, txt: 0 };
  const totalDocs = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  // Custom SVG Line Path calculation
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;
  const points = timeline.map((t, idx) => {
    const x = padding + (idx * (svgWidth - padding * 2)) / Math.max(timeline.length - 1, 1);
    const y = svgHeight - padding - (t.count * (svgHeight - padding * 2)) / maxCount;
    return { x, y, ...t };
  });

  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    // Area path closes at bottom
    areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;
  }

  const formatTypes = [
    { name: 'PDF Document', key: 'pdf', color: 'bg-red-500', text: 'text-red-400', icon: FileText },
    { name: 'Word Document', key: 'docx', color: 'bg-blue-500', text: 'text-blue-400', icon: FileText },
    { name: 'Plain Text', key: 'txt', color: 'bg-emerald-500', text: 'text-emerald-400', icon: FileCode },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Timeline Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-base font-bold text-white mb-4">Chat Engagement Volume</h3>
        
        {timeline.length <= 1 && timeline[0].count === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-slate-500">
            No query timeline records found.
          </div>
        ) : (
          <div className="relative h-48 w-full">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Gridlines */}
              {[0, 0.5, 1].map((val, idx) => {
                const y = padding + val * (svgHeight - padding * 2);
                return (
                  <line
                    key={idx}
                    x1={padding}
                    y1={y}
                    x2={svgWidth - padding}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Under Line */}
              {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

              {/* The Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Circles */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#1e1b4b"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                  />
                  {/* Tooltip on hover */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    className="opacity-0 group-hover:opacity-100 transition duration-200 bg-slate-950 px-1 py-0.5 rounded"
                  >
                    {p.count}
                  </text>
                </g>
              ))}

              {/* X Axis Labels */}
              {points.filter((_, i) => i === 0 || i === points.length - 1 || points.length <= 5).map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9.5"
                >
                  {p.date.split('-').slice(1).join('/')}
                </text>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Document Formats Distribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-base font-bold text-white mb-5">Indexed File Formats</h3>
        <div className="space-y-4">
          {formatTypes.map((type) => {
            const count = dist[type.key] || 0;
            const percentage = Math.round((count / totalDocs) * 100) || 0;
            const Icon = type.icon;

            return (
              <div key={type.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Icon className={`h-4.5 w-4.5 ${type.text}`} />
                    <span>{type.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">
                    {count} {count === 1 ? 'file' : 'files'} ({percentage}%)
                  </span>
                </div>
                {/* Progress Bar Container */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${type.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Charts;
