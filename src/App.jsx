import React, { useState, useMemo, useEffect } from 'react';
import {
    DollarSign,
    Users,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Briefcase,
    ArrowUpRight,
    ArrowDownRight,
    Menu,
    Search,
    FileText,
    Activity,
    ChevronRight,
    X,
    Download,
    History,
    Layout,
    Filter,
    Calendar,
    ChevronLeft,
    Plus,
    Trash2
} from 'lucide-react';

// --- Mock Data ---

const getHealth = (proj) => {
    const scores = [];

    // Margin Score
    if (proj.margin >= 40) scores.push('Good');
    else if (proj.margin >= 30) scores.push('Warning');
    else scores.push('Critical');

    // AR Score
    if (proj.arAgingDays <= 30) scores.push('Good');
    else if (proj.arAgingDays <= 60) scores.push('Warning');
    else scores.push('Critical');

    // CO Score
    if (proj.pendingCOs <= 1) scores.push('Good');
    else if (proj.pendingCOs <= 3) scores.push('Warning');
    else scores.push('Critical');

    // WIP Score
    if (proj.wipReviewed) scores.push('Good');
    else scores.push('Critical');

    if (scores.includes('Critical')) return 'Critical';
    if (scores.includes('Warning')) return 'Warning';
    return 'Good';
};

const PROJECTS = [
    { id: 1, name: "Pier 61 Decommissioning", code: "24-001", client: "Trans Mountain", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 46.5, revenue: 1200000, arAgingDays: 15, pendingCOs: 3, wipReviewed: true },
    { id: 2, name: "Strathcona Dam Project", code: "24-042", client: "BC Hydro", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 38.2, revenue: 850000, arAgingDays: 45, pendingCOs: 3, wipReviewed: true },
    { id: 3, name: "Westridge Delivery Line", code: "23-115", client: "Trans Mountain", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 42.1, revenue: 2100000, arAgingDays: 10, pendingCOs: 0, wipReviewed: true },
    { id: 4, name: "Cambie Bridge Upgrade", code: "24-088", client: "City of Vancouver", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 12.4, revenue: 320000, arAgingDays: 75, pendingCOs: 4, wipReviewed: false },
    { id: 5, name: "Iona Island WWTP", code: "24-099", client: "Metro Vancouver", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 41.0, revenue: 550000, arAgingDays: 20, pendingCOs: 1, wipReviewed: true },
    { id: 6, name: "Broadway Subway", code: "24-101", client: "TI Corp", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 35.5, revenue: 980000, arAgingDays: 55, pendingCOs: 2, wipReviewed: true },
    { id: 7, name: "Massey Tunnel Replacement", code: "24-105", client: "TI Corp", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", margin: 44.2, revenue: 1500000, arAgingDays: 5, pendingCOs: 1, wipReviewed: false },
];

const AUDIT_LOG = [
    { date: "Oct 24, 2025", user: "Ali Wagih", action: "Updated Forecast", detail: "Changed ETC from $120k to $145k due to scope creep." },
    { date: "Oct 22, 2025", user: "Ali Wagih", action: "Health Check", detail: "Marked 'WIP Reviewed' as No." },
    { date: "Oct 15, 2025", user: "System", action: "Data Sync", detail: "Acumatica financial import successful." },
];

const JUNIOR_STAFF = [
    { name: "Sarah Jenkins", role: "Jr. Project Coordinator", rate: "$85/hr", availability: "20 hrs/wk", skills: ["Doc Control", "LEMs"] },
    { name: "Mike Ross", role: "Field Inspector", rate: "$95/hr", availability: "40 hrs/wk", skills: ["Site Safety", "Reporting"] },
];

// --- Components ---

const Modal = ({ title, children, onClose, width = "max-w-2xl" }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto flex flex-col`}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

const MetricCard = ({ title, value, subtext, trend, trendValue, icon: Icon, color, warning, critical }) => (
    <div className={`bg-white p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all ${critical ? 'border-l-rose-600' : warning ? 'border-l-amber-500' : 'border-l-blue-900'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>

            )}
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</h3>
        <div className={`text-2xl font-bold ${critical ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-slate-900'}`}>{value}</div>
        {subtext && <div className="text-xs text-slate-400 mt-2">{subtext}</div>}
    </div >
);

const ProgressBar = ({ label, current, total, colorClass, warning }) => {
    const percentage = Math.min(100, (current / total) * 100);
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{label}</span>
                <span className={`${warning ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(current)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(total)}
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const UtilizationBar = ({ label, value, type = 'team' }) => {
    let colorClass = "bg-emerald-500";
    let statusText = "Optimal";
    let textColor = "text-emerald-600";

    if (type === 'personal') {
        // Personal Billability Target: 95%
        if (value < 85) {
            colorClass = "bg-rose-500";
            statusText = "Critical (<85%)";
            textColor = "text-rose-600";
        } else if (value < 95) {
            colorClass = "bg-amber-500";
            statusText = "Below Target (<95%)";
            textColor = "text-amber-600";
        }
    } else {
        // Team Utilization Target: 85-100%
        if (value > 100) {
            colorClass = "bg-rose-500";
            statusText = "Burnout Risk (>100%)";
            textColor = "text-rose-600";
        } else if (value < 75) {
            colorClass = "bg-rose-500";
            statusText = "Critical Bench (<75%)";
            textColor = "text-rose-600";
        } else if (value < 85) {
            colorClass = "bg-amber-500";
            statusText = "Under-utilized (<85%)";
            textColor = "text-amber-600";
        }
    }

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">{label}</span>
                <span className={`font-bold ${textColor}`}>{value}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(100, value)}%` }}></div>
            </div>
            <p className={`text-[10px] mt-1 ${textColor}`}>{statusText}</p>
        </div>
    );
};

const HealthCheckItem = ({ children }) => (
    <div className="flex flex-col py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-4 -mx-4 rounded transition-colors">
        {children}
    </div>
);

const StaticWrapper = ({ title, children }) => (
    <div className="mb-12 border-b-2 border-slate-300 pb-12 break-inside-avoid">
        <div className="bg-slate-800 text-white px-4 py-2 mb-6 inline-block rounded-md text-sm font-bold uppercase tracking-wider">
            View: {title}
        </div>
        <div className="bg-slate-100 p-8 rounded-xl border border-slate-300">
            {children}
        </div>
    </div>
);

// --- Earned Value Chart Component ---
const EVChart = ({ data, bac }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No Data</div>;

    const width = 500;
    const height = 300;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Y Max (Cost)
    const maxY = Math.max(bac * 1.1, ...data.map(d => Math.max(d.pv || 0, d.ac || 0, d.ev || 0))) || 10000;

    const getX = (index) => padding + index * (graphWidth / (data.length - 1));
    const getY = (val) => height - padding - (val / maxY) * graphHeight;

    const makePath = (key) => {
        let d = "";
        data.forEach((item, i) => {
            const val = item[key];
            if (val !== null && val !== undefined) {
                const x = getX(i);
                const y = getY(val);
                d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
            }
        });
        return d;
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-50 rounded-lg border border-slate-100">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <g key={t}>
                    <line x1={padding} y1={getY(maxY * t)} x2={width - padding} y2={getY(maxY * t)} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <text x={padding - 5} y={getY(maxY * t)} textAnchor="end" alignmentBaseline="middle" className="text-[9px] fill-slate-400 font-mono">
                        ${(maxY * t / 1000).toFixed(0)}k
                    </text>
                </g>
            ))}

            {/* X Axis */}
            {data.map((d, i) => {
                // Show label if it's the first, last, or spaced out to avoid overlap
                const skip = Math.ceil(data.length / 10); // Target ~10 labels max
                if (i % skip !== 0 && i !== data.length - 1) return null;

                return (
                    <text key={i} x={getX(i)} y={height - padding + 15} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">
                        {d.month}
                    </text>
                );
            })}

            {/* Lines */}
            <path d={makePath('pv')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
            <path d={makePath('ac')} fill="none" stroke="#ef4444" strokeWidth="2" />
            <path d={makePath('ev')} fill="none" stroke="#10b981" strokeWidth="2" />

            {/* BAC Line */}
            <line x1={padding} y1={getY(bac)} x2={width - padding} y2={getY(bac)} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
            <text x={width - padding - 5} y={getY(bac) - 5} textAnchor="end" className="text-[9px] fill-slate-500 font-bold">BAC</text>

            <rect x={width - 100} y={10} width={90} height={50} fill="white" stroke="#e2e8f0" rx="4" />
            <g transform={`translate(${width - 90}, 25)`}>
                <line x1="0" y1="0" x2="15" y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
                <text x="20" y="3" className="text-[9px] fill-slate-600">Planned (PV)</text>

                <line x1="0" y1="12" x2="15" y2="12" stroke="#ef4444" strokeWidth="2" />
                <text x="20" y="15" className="text-[9px] fill-slate-600">Actual (AC)</text>

                <line x1="0" y1="24" x2="15" y2="24" stroke="#10b981" strokeWidth="2" />
                <text x="20" y="27" className="text-[9px] fill-slate-600">Earned (EV)</text>
            </g>
        </svg>
    );
};

const CashflowChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="p-4 text-center text-slate-400">No data available</div>;

    const width = 800;
    const height = 400;
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Calculate max value for Y-axis (Monthly Bars)
    const maxMonthly = Math.max(
        ...data.map(d => Math.max(d.planned || 0, d.actual || 0, d.forecast || 0))
    ) * 1.2 || 10000;

    // Calculate max value for Secondary Y-axis (Cumulative Lines)
    const maxCum = Math.max(
        ...data.map(d => Math.max(d.cumPlanned || 0, d.cumActual || 0, d.cumForecast || 0))
    ) * 1.1 || 10000;

    const barWidth = (graphWidth / data.length) / 4;

    const getX = (index) => padding + index * (graphWidth / data.length) + (graphWidth / data.length) / 2;
    const getY = (val) => height - padding - (val / maxMonthly) * graphHeight;
    const getY2 = (val) => height - padding - (val / maxCum) * graphHeight;

    const makeLinePath = (key, color) => {
        let d = "";
        data.forEach((item, i) => {
            const val = item[key];
            if (val !== undefined && val !== null) {
                const x = getX(i);
                const y = getY2(val);
                d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
            }
        });
        return <path d={d} fill="none" stroke={color} strokeWidth="3" />;
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="bg-white rounded-lg border border-slate-200">
                <text x={width / 2} y={25} textAnchor="middle" className="text-sm font-bold fill-slate-800">Cashflow Graph</text>

                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
                <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />

                {/* Y-Axis Labels (Monthly) */}
                <text x={15} y={height / 2} transform={`rotate(-90 15,${height / 2})`} textAnchor="middle" className="text-xs fill-slate-500 font-bold">Monthly ($)</text>
                {[0, 0.5, 1].map(t => (
                    <text key={t} x={padding - 10} y={getY(maxMonthly * t)} textAnchor="end" className="text-[10px] fill-slate-400">
                        ${(maxMonthly * t / 1000).toFixed(0)}k
                    </text>
                ))}

                {/* Secondary Y-Axis Labels (Cumulative) */}
                <text x={width - 15} y={height / 2} transform={`rotate(90 ${width - 15},${height / 2})`} textAnchor="middle" className="text-xs fill-slate-500 font-bold">Cumulative ($)</text>
                {[0, 0.5, 1].map(t => (
                    <text key={t} x={width - padding + 10} y={getY2(maxCum * t)} textAnchor="start" className="text-[10px] fill-slate-400">
                        ${(maxCum * t / 1000).toFixed(0)}k
                    </text>
                ))}

                {/* Data */}
                {data.map((d, i) => {
                    const x = getX(i);
                    const w = barWidth;
                    return (
                        <g key={i}>
                            {/* X Label */}
                            <text x={x} y={height - padding + 15} textAnchor="middle" className="text-[10px] fill-slate-600 truncate">{d.month}</text>

                            {/* Bars */}
                            {d.planned > 0 && <rect x={x - w * 1.5} y={getY(d.planned)} width={w} height={height - padding - getY(d.planned)} fill="#94a3b8" opacity="0.5" />}
                            {d.actual > 0 && <rect x={x - w * 0.5} y={getY(d.actual)} width={w} height={height - padding - getY(d.actual)} fill="#3b82f6" />}
                            {d.forecast > 0 && <rect x={x + w * 0.5} y={getY(d.forecast)} width={w} height={height - padding - getY(d.forecast)} fill="#f59e0b" />}
                        </g>
                    );
                })}

                {/* Lines */}
                {makeLinePath('cumPlanned', '#475569')}
                {makeLinePath('cumActual', '#1d4ed8')}
                {makeLinePath('cumForecast', '#d97706')}

                {/* Legend */}
                <g transform={`translate(${padding + 20}, ${padding + 10})`}>
                    <rect width="10" height="10" fill="#94a3b8" opacity="0.5" y="0" />
                    <text x="15" y="9" className="text-[10px] fill-slate-600">Monthly Planned</text>
                    <line x1="100" y1="5" x2="120" y2="5" stroke="#475569" strokeWidth="2" />
                    <text x="125" y="9" className="text-[10px] fill-slate-600">Cum. Planned</text>

                    <rect width="10" height="10" fill="#3b82f6" y="15" />
                    <text x="15" y="24" className="text-[10px] fill-slate-600">Monthly Actual</text>
                    <line x1="100" y1="20" x2="120" y2="20" stroke="#1d4ed8" strokeWidth="2" />
                    <text x="125" y="24" className="text-[10px] fill-slate-600">Cum. Actual</text>

                    <rect width="10" height="10" fill="#f59e0b" y="30" />
                    <text x="15" y="39" className="text-[10px] fill-slate-600">Monthly Forecast</text>
                    <line x1="100" y1="35" x2="120" y2="35" stroke="#d97706" strokeWidth="2" />
                    <text x="125" y="39" className="text-[10px] fill-slate-600">Cum. Forecast</text>
                </g>
            </svg>
        </div>
    );
};

const PortfolioViewContent = ({ projects, onViewProject }) => {
    const [filters, setFilters] = useState({
        project: '', client: '', pm: '', branch: '', discipline: '', status: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derive unique options for dropdowns
    const getOptions = (key) => [...new Set(PROJECTS.map(p => p[key]))];

    const filteredProjects = projects.filter(p => {
        return (
            (filters.project === '' || p.name === filters.project) &&
            (filters.client === '' || p.client === filters.client) &&
            (filters.pm === '' || p.pm === filters.pm) &&
            (filters.branch === '' || p.branch === filters.branch) &&
            (filters.discipline === '' || p.discipline === filters.discipline) &&
            (filters.status === '' || p.status === filters.status)
        );
    });

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const portfolioRevenue = filteredProjects.reduce((acc, curr) => acc + curr.revenue, 0);
    const avgMargin = filteredProjects.length ? (filteredProjects.reduce((acc, curr) => acc + curr.margin, 0) / filteredProjects.length).toFixed(1) : 0;

    const handleExport = () => {
        alert("Exporting current view to CSV...");
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Portfolio</h1>
                    <p className="text-slate-500 mt-1">High-level overview of active engineering projects.</p>
                </div>
                <button className="bg-blue-900 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-800 transition-colors shadow-md">
                    <Briefcase size={18} /> New Project
                </button>
            </div>

            {/* KPI Cards (No Utilization) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Revenue" value={`$${(portfolioRevenue / 1000000).toFixed(1)}M`} icon={DollarSign} color="bg-blue-600" trend="up" trendValue="8.2%" />
                <MetricCard title="Avg. Gross Margin" value={`${avgMargin}%`} subtext="Target: 45%" icon={Activity} color="bg-purple-600" warning={avgMargin >= 30 && avgMargin < 40} critical={avgMargin < 30} />
                <MetricCard title="Total AR (>60 Days)" value="$125k" subtext="2 Invoices Outstanding" icon={Clock} color="bg-rose-600" critical={true} />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-4">
                {['project', 'client', 'pm', 'branch', 'discipline', 'status'].map(key => (
                    <div key={key}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{key === 'pm' ? 'Acumatica PM' : key}</label>
                        <select
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters[key]}
                            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                        >
                            <option value="">All</option>
                            {getOptions(key === 'project' ? 'name' : key).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-end">
                    <button onClick={handleExport} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-bold flex items-center gap-2 border border-blue-200">
                        <Download size={16} /> Export View
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-600">Project</th>
                            <th className="p-4 font-bold text-slate-600">Client</th>
                            <th className="p-4 font-bold text-slate-600">PM</th>
                            <th className="p-4 font-bold text-slate-600">Branch</th>
                            <th className="p-4 font-bold text-slate-600">Discipline</th>
                            <th className="p-4 font-bold text-slate-600">Revenue</th>
                            <th className="p-4 font-bold text-slate-600">Margin</th>
                            <th className="p-4 font-bold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedProjects.map((proj) => (
                            <tr key={proj.id} onClick={() => onViewProject && onViewProject(proj)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="p-4"><div className="font-bold text-slate-900 group-hover:text-blue-700">{proj.name}</div><div className="text-xs text-slate-500">{proj.code}</div></td>
                                <td className="p-4 text-slate-600">{proj.client}</td>
                                <td className="p-4 text-slate-600">{proj.pm}</td>
                                <td className="p-4 text-slate-600">{proj.branch}</td>
                                <td className="p-4 text-slate-600">{proj.discipline}</td>
                                <td className="p-4 text-slate-600 font-medium">${proj.revenue.toLocaleString()}</td>
                                <td className="p-4"><span className={`font-bold ${proj.margin < 30 ? 'text-rose-600' : proj.margin < 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{proj.margin}%</span></td>
                                <td className="p-4">
                                    {(() => {
                                        const health = getHealth(proj);
                                        return (
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${health === 'Good' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : health === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                {health}
                                            </span>
                                        );
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 border rounded hover:bg-white disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 border rounded hover:bg-white disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};


const ProjectDetailContent = ({ project, activeTab, setActiveTab, onToggleModal }) => {
    // Fallback if no project is passed (e.g. initial dev state)
    const p = project || PROJECTS[0];
    const health = getHealth(p);

    // --- Detail View State ---
    const [useSubs, setUseSubs] = useState(false);
    const [subCount, setSubCount] = useState(0);
    const [subNames, setSubNames] = useState([]);



    // Persisted Contract Data (Mocked pre-fill for active project)
    const [contractExecuted, setContractExecuted] = useState(true);
    const [contractDates, setContractDates] = useState({ start: '2024-01-01', end: '2025-12-31' });
    const [contractType, setContractType] = useState('Lump Sum');
    const [disbursementMarkup, setDisbursementMarkup] = useState(true);

    // Monthly Check State
    const [timeChargesConfirmed, setTimeChargesConfirmed] = useState(null);
    const [ramSolicited, setRamSolicited] = useState(null);
    const [ramSolicitedDetails, setRamSolicitedDetails] = useState("");

    const [hasEscalation, setHasEscalation] = useState(null);
    const [escalationExercised, setEscalationExercised] = useState(null);
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [evData, setEvData] = useState([]);

    // Change Management State
    const [changeOrders, setChangeOrders] = useState([]); // [{id, number, amount, executed}]
    const [subChangeOrders, setSubChangeOrders] = useState({}); // { [subIndex]: [{id, amount, executed}] }

    // --- New Financials State ---
    const [monthlyFinancials, setMonthlyFinancials] = useState([]);

    // Initialize/Update Monthly Financials based on Contract Dates
    useEffect(() => {
        if (!contractDates.start || !contractDates.end) return;

        const start = new Date(contractDates.start);
        const end = new Date(contractDates.end);
        const months = [];
        let curr = new Date(start);

        // Simple helper to format "Jan 25"
        const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        while (curr <= end) {
            months.push(fmt(curr));
            curr.setMonth(curr.getMonth() + 1);
        }

        // Merge with existing data if available to preserve inputs
        setMonthlyFinancials(prev => {
            return months.map(m => {
                const existing = prev.find(p => p.month === m);
                return existing || { month: m, planned: 0, actual: 0, forecast: 0 };
            });
        });
    }, [contractDates.start, contractDates.end]);

    // Update derived fields (Cumulative) for graphing
    const graphData = useMemo(() => {
        let cp = 0, ca = 0, cf = 0;
        return monthlyFinancials.map(d => {
            cp += Number(d.planned || 0);
            ca += Number(d.actual || 0);
            cf += Number(d.forecast || 0);
            return {
                ...d,
                cumPlanned: cp,
                cumActual: ca,
                cumForecast: cf
            };
        });
    }, [monthlyFinancials]);

    // EVM Inputs
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-06-30');
    const [budget, setBudget] = useState(1200000);
    const [tasks, setTasks] = useState([
        { id: 1, name: "01. Preliminaries", budget: 200000, pctComplete: 95 },
        { id: 2, name: "02. Design", budget: 450000, pctComplete: 80 },
        { id: 3, name: "03. Construction", budget: 550000, pctComplete: 0 }
    ]);

    // Handlers
    const handleSubCountChange = (val) => {
        const count = parseInt(val) || 0;
        setSubCount(count);
        // Resize array
        setSubNames(prev => {
            const newArr = [...prev];
            if (count > prev.length) {
                for (let i = prev.length; i < count; i++) newArr.push("");
            } else {
                newArr.length = count;
            }
            return newArr;
        });
    };

    const handleSubNameChange = (idx, name) => {
        const newArr = [...subNames];
        newArr[idx] = name;
        setSubNames(newArr);
    };

    // Calculate Current EV based on Task Inputs
    const totalCurrentEV = tasks.reduce((acc, t) => acc + (t.budget * (t.pctComplete / 100)), 0);

    // Generate EVM Data (Curves + Tables)
    useEffect(() => {
        if (monthlyFinancials.length === 0) return;

        // Calculate Total Budget (BAC)
        const totalBudget = tasks.reduce((acc, t) => acc + t.budget, 0);

        // Calculate Cumulative Actuals from Monthly Financials
        let runningAC = 0;
        let runningPV = 0;

        const data = monthlyFinancials.map((m, i) => {
            // AC: Cumulative Actual from User Input
            const monthlyAC = Number(m.actual || 0);
            runningAC += monthlyAC;

            // PV: Cumulative Planned from User Input
            const monthlyPV = Number(m.planned || 0);
            runningPV += monthlyPV;

            // Only show AC if month has passed or data entered
            const actualCost = runningAC > 0 ? runningAC : (i === 0 && monthlyAC === 0 ? 0 : null);

            // For PV on EVM, we use Cumulative PV
            const plannedValue = runningPV;

            // EV: Interpolated based on current total % complete of tasks
            // In a real app, EV is snapshots. Here we simulate a curve ending at currentTotalEV
            const currentTotalEV = tasks.reduce((acc, t) => acc + (t.budget * (t.pctComplete / 100)), 0);
            let earnedValue = null;

            // Assume we are at the month corresponding to "today" or last actual entry
            // For this mock, let's say we are at month 3.
            if (i <= 3) {
                // Distribute current EV roughly over the active months
                earnedValue = (currentTotalEV / 4) * (i + 1);
            }

            // Calculate EAC for historical points
            let histEAC = null;
            if (actualCost && earnedValue) {
                const cpi = earnedValue / actualCost;
                histEAC = cpi > 0 ? totalBudget / cpi : 0;
            }

            return {
                month: m.month,
                pv: plannedValue,
                ac: actualCost, // This is now Cumulative AC
                ev: earnedValue,
                eac: histEAC
            };
        });
        setEvData(data);
    }, [tasks, budget, monthlyFinancials]);

    // Current Metrics
    const currentAC = 590000; // From Month 3
    const cpi = currentAC > 0 ? (totalCurrentEV / currentAC).toFixed(2) : 0;
    const spi = evData[2]?.pv > 0 ? (totalCurrentEV / evData[2].pv).toFixed(2) : 0;
    const eac = cpi > 0 ? (budget / cpi).toFixed(0) : 0;
    const etc = eac - currentAC;

    // Local Logic for "Incomplete Contract"
    const isContractIncomplete = contractExecuted !== true || !contractDates.start || !contractDates.end || !contractType || disbursementMarkup === null;

    // Override health for UI display
    let displayHealth = health;
    if (isContractIncomplete || timeChargesConfirmed === false) {
        displayHealth = "Critical";
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border-l-8 ${displayHealth === 'Good' ? 'border-l-emerald-500' : displayHealth === 'Warning' ? 'border-l-amber-500' : 'border-l-rose-500'}`}>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold border ${displayHealth === 'Good' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : displayHealth === 'Warning' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                            {displayHealth}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Project: {p.code} • <span className="font-semibold">Acumatica PM: {p.pm}</span> • Client: {p.client}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold border border-slate-200 flex items-center gap-2 hover:bg-slate-200 transition-colors">
                        <img src="https://www.acumatica.com/favicon.ico" className="w-4 h-4" alt="Acumatica" />
                        Open Acumatica
                    </button>
                    <button onClick={() => onToggleModal('report', true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-900/10">
                        <FileText size={16} /> Generate Report
                    </button>
                </div>
            </div>

            {/* Contract Setup / Metadata Section */}
            <div className="bg-slate-800 text-slate-200 p-6 rounded-xl shadow-inner border border-slate-700">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-white flex items-center gap-2"><Briefcase size={18} /> Contract Setup & Metadata</h3>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Persisted Data</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contract Executed?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={contractExecuted === true} onChange={() => setContractExecuted(true)} /> Yes</label>
                                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={contractExecuted === false} onChange={() => setContractExecuted(false)} /> No</label>
                            </div>
                        </div>
                        {contractExecuted && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <input type="date" className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white" value={contractDates.start} onChange={(e) => setContractDates({ ...contractDates, start: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                    <input type="date" className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white" value={contractDates.end} onChange={(e) => setContractDates({ ...contractDates, end: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </div>
                    {contractExecuted && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contract Type</label>
                                <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white" value={contractType} onChange={(e) => setContractType(e.target.value)}>
                                    <option value="">Select...</option>
                                    <option value="Lump Sum">Lump Sum</option>
                                    <option value="Time & Material">Time & Material</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Disbursement Markup?</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" checked={disbursementMarkup === true} onChange={() => setDisbursementMarkup(true)} /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" checked={disbursementMarkup === false} onChange={() => setDisbursementMarkup(false)} /> No</label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Planned Spend Input Table */}
                {contractExecuted && (
                    <div className="mt-8 border-t border-slate-700 pt-6">
                        <h4 className="font-bold text-white mb-4 text-sm uppercase">Baseline / Planned Spend</h4>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                            <p className="text-xs text-slate-400 mb-4">Enter the planned monthly expenditure for the duration of the project.</p>
                            <div className="flex gap-2">
                                {monthlyFinancials.map((item, idx) => (
                                    <div key={idx} className="min-w-[100px]">
                                        <div className="text-xs font-bold text-slate-500 mb-1">{item.month}</div>
                                        <input
                                            type="number"
                                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:border-blue-500 outline-none"
                                            value={item.planned}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setMonthlyFinancials(prev => {
                                                    const copy = [...prev];
                                                    copy[idx] = { ...copy[idx], planned: val };
                                                    return copy;
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Financials (Simplified) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign size={16} className="text-blue-600" /> Financials
                        </h2>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Oct 2025</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 font-medium mb-1">Gross Margin</div>
                            <div className={`text-2xl font-bold ${p.margin < 30 ? 'text-rose-600' : p.margin < 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.margin}%</div>
                            <div className="text-[10px] text-slate-400">Target: 40%</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 font-medium mb-1">Last Mo. Income</div>
                            <div className="text-2xl font-bold text-slate-800">${(p.revenue / 24 / 1000).toFixed(0)}k</div>
                            <div className="text-[10px] text-slate-400">Avg: ${(p.revenue / 24 / 1000 * 0.9).toFixed(0)}k</div>
                        </div>
                    </div>
                    <ProgressBar label="Budget Remaining" current={1200000} total={2100000} colorClass="bg-emerald-500" />
                </div>

                {/* Billing & Collections (New Card) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-emerald-600" /> Billing & Collections
                    </h2>
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                                <div className="text-xs text-slate-500 font-semibold uppercase">Accruals</div>
                                <div className="text-lg font-bold text-slate-800">${(p.revenue * 0.07).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1"><CheckCircle2 size={12} /> Accrued</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                                <div className="text-xs text-slate-500 font-semibold uppercase">AR Aging</div>
                                <div className={`text-lg font-bold ${p.arAgingDays > 60 ? 'text-rose-600' : 'text-emerald-800'}`}>{p.arAgingDays} Days</div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-bold flex items-center justify-end gap-1 ${p.arAgingDays > 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {p.arAgingDays > 60 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                    {p.arAgingDays > 60 ? 'Overdue' : 'Current'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-700 mb-2">All time charges from prev month invoiced or accrued?</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={timeChargesConfirmed === true} onChange={() => setTimeChargesConfirmed(true)} /> Yes</label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={timeChargesConfirmed === false} onChange={() => setTimeChargesConfirmed(false)} /> No</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Snapshot (Lump Sum Only) */}
                {contractType === 'Lump Sum' ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-purple-600" /> Performance Snapshot
                        </h2>
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            {/* EVM quick stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
                                    <div className="text-xs text-purple-800 font-bold mb-1">Cost Perf. (CPI)</div>
                                    <div className={`text-2xl font-bold ${cpi >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{cpi}</div>
                                    <div className="text-[10px] text-slate-500">{cpi >= 1 ? 'Under Budget' : 'Over Budget'}</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                    <div className="text-xs text-blue-800 font-bold mb-1">Sched. Perf. (SPI)</div>
                                    <div className={`text-2xl font-bold ${spi >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{spi}</div>
                                    <div className="text-[10px] text-slate-500">{spi >= 1 ? 'Ahead' : 'Behind'}</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500 font-medium">Est. at Completion (EAC)</span>
                                    <span className="font-bold text-slate-800">${Number(eac).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Est. to Complete (ETC)</span>
                                    <span className="font-bold text-blue-600">${Number(etc).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full justify-center items-center text-center opacity-60">
                        <Activity size={32} className="text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-400">Performance Snapshot</p>
                        <p className="text-xs text-slate-400 mt-1">Not applicable for {contractType || 'Current'} contracts.</p>
                    </div>
                )}
            </div>

            {/* Critical Alerts / WARNINGS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-b from-white to-slate-50">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> WARNINGS
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {isContractIncomplete && (
                        <div className="flex items-start gap-3 p-3 bg-white border border-rose-200 rounded-lg shadow-sm">
                            <div className="mt-0.5 p-1.5 bg-rose-100 text-rose-600 rounded-md"><AlertTriangle size={14} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">Incomplete Contract</div>
                                <div className="text-xs text-slate-500">Missing contract details in Setup section.</div>
                            </div>
                        </div>
                    )}
                    {timeChargesConfirmed === false && (
                        <div className="flex items-start gap-3 p-3 bg-white border border-rose-200 rounded-lg shadow-sm">
                            <div className="mt-0.5 p-1.5 bg-rose-100 text-rose-600 rounded-md"><AlertTriangle size={14} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">Unbilled Time Charges</div>
                                <div className="text-xs text-slate-500">Prev. month charges not fully invoiced/accrued.</div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className={`mt-0.5 p-1.5 rounded-md ${p.pendingCOs > 2 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            <AlertTriangle size={14} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-800">{p.pendingCOs} Pending Change Orders</div>
                            <div className="text-xs text-slate-500">{p.pendingCOs > 0 ? 'Action required to finalize scope.' : 'Scope is well defined.'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Health Checks */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Monthly Project Health Check</h2>
                    <div className="flex bg-slate-200/60 p-1 rounded-lg">
                        {['contracts', 'subs', 'finance', 'client'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab && setActiveTab(tab)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-md transition capitalize ${activeTab === tab ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content with User Inputs */}
                <div className="p-6">

                    {activeTab === 'contracts' && (
                        <div className="space-y-4">
                            <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" opacity={0.5} />
                                <p>Contract Setup Complete</p>
                                <p className="text-xs mt-1">Contract details are managed in the Setup section above.</p>
                            </div>


                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Does a rate escalation clause exist within this contract?</p>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="esc" checked={hasEscalation === true} onChange={() => setHasEscalation(true)} /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="esc" checked={hasEscalation === false} onChange={() => setHasEscalation(false)} /> No</label>
                                </div>
                                {hasEscalation && (
                                    <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-3">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Have you exercised the escalation/rate increase?</p>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="escExec" checked={escalationExercised === true} onChange={() => setEscalationExercised(true)} /> Yes</label>
                                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="escExec" checked={escalationExercised === false} onChange={() => setEscalationExercised(false)} /> No</label>
                                            </div>
                                        </div>
                                        {escalationExercised && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date Escalated</label>
                                                <input type="date" className="p-1 border rounded text-sm" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </HealthCheckItem>
                        </div>
                    )}

                    {activeTab === 'subs' && (
                        <div className="space-y-6">
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Are subcontractors/subconsultants utilized on this project?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="subs" checked={useSubs} onChange={() => setUseSubs(true)} /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="subs" checked={!useSubs} onChange={() => setUseSubs(false)} /> No</label>
                                </div>
                                {useSubs && (
                                    <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-slate-50 p-4 rounded-r-lg">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Number of Subs</label>
                                        <input
                                            type="number"
                                            className="w-20 p-2 border rounded mb-4 text-sm"
                                            min="0"
                                            value={subCount}
                                            onChange={(e) => handleSubCountChange(e.target.value)}
                                        />
                                        <div className="space-y-2">
                                            {subNames.map((name, idx) => (
                                                <div key={idx}>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subcontractor #{idx + 1} Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 border rounded text-sm"
                                                        placeholder="Enter Company Name..."
                                                        value={name}
                                                        onChange={(e) => handleSubNameChange(idx, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </HealthCheckItem>

                            {useSubs && subCount > 0 && (
                                <div className="space-y-4">
                                    {subNames.map((name, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                                            <h3 className="font-bold text-slate-800 mb-3">{name || `Subcontractor #${idx + 1}`}</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Agreement Executed?</label>
                                                    <div className="flex gap-3">
                                                        <label className="text-sm"><input type="radio" name={`agr-${idx}`} /> Yes</label>
                                                        <label className="text-sm"><input type="radio" name={`agr-${idx}`} /> No</label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">LEMs Received?</label>
                                                    <div className="flex gap-3">
                                                        <label className="text-sm"><input type="radio" name={`lem-${idx}`} /> Yes</label>
                                                        <label className="text-sm"><input type="radio" name={`lem-${idx}`} /> No</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(!useSubs || subCount === 0) && (
                                <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg">
                                    No subcontractors identified.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-4">
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Payment Terms</p>
                                <select
                                    className="p-2 border rounded text-sm w-48"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                >
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 60">Net 60</option>
                                    <option value="Other">Other</option>
                                </select>
                                <p className="text-xs text-slate-400 mt-1">
                                    *AR Aging Check targets are adjusted based on selection ({paymentTerms === 'Net 30' ? '>45 days alert' : '>75 days alert'})
                                </p>
                            </HealthCheckItem>
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Has WIP been reviewed and adjusted this month?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="wip" /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="wip" /> No</label>
                                </div>
                                <input type="text" placeholder="Add comment/reason..." className="w-full mt-2 p-2 border rounded text-sm" />
                            </HealthCheckItem>
                        </div>
                    )}

                    {activeTab === 'client' && (
                        <div className="space-y-4">
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Have Additional Services (RAM) been solicited?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" checked={ramSolicited === true} onChange={() => setRamSolicited(true)} /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" checked={ramSolicited === false} onChange={() => setRamSolicited(false)} /> No</label>
                                </div>
                                {ramSolicited && (
                                    <textarea
                                        className="w-full mt-2 p-2 border rounded text-sm"
                                        placeholder="Describe the opportunity..."
                                        value={ramSolicitedDetails}
                                        onChange={(e) => setRamSolicitedDetails(e.target.value)}
                                    ></textarea>
                                )}
                            </HealthCheckItem>
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Has feedback been solicited this <span className="font-bold">Quarter</span>?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="feed" /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="feed" /> No</label>
                                </div>
                                <textarea className="w-full mt-2 p-2 border rounded text-sm" placeholder="Summary of feedback received..."></textarea>
                            </HealthCheckItem>
                            <HealthCheckItem>
                                <p className="text-sm font-medium text-slate-700 mb-2">Received a project testimonial or letter of reference?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="test" /> Yes</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="test" /> No</label>
                                </div>
                            </HealthCheckItem>
                        </div>
                    )}
                </div>
                {/* Audit Log Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={() => onToggleModal('audit', true)}
                        className="text-blue-600 text-sm font-bold hover:text-blue-800 hover:underline flex items-center gap-2 transition-colors"
                    >
                        <History size={16} /> View Audit Log
                    </button>
                </div>
            </div>

            {/* Monthly Financials & Forecasting Section (For ALL Contract Types) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Monthly Financials & Forecasting</h2>
                    <p className="text-sm text-slate-500">Track actual spend against baseline and update monthly forecasts.</p>
                </div>
                <div className="p-6 space-y-8">
                    {/* Financials Table */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                                <tr>
                                    <th className="p-3">Month</th>
                                    <th className="p-3">Baseline / Planned ($)</th>
                                    <th className="p-3">Actual ($)</th>
                                    <th className="p-3">Forecast ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {monthlyFinancials.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-800">{item.month}</td>
                                        <td className="p-3 text-slate-500">${item.planned ? item.planned.toLocaleString() : '0'}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                className="w-28 p-1.5 border rounded text-slate-700"
                                                placeholder="0"
                                                value={item.actual}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setMonthlyFinancials(prev => {
                                                        const copy = [...prev];
                                                        copy[idx] = { ...copy[idx], actual: val };
                                                        return copy;
                                                    });
                                                }}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                className="w-28 p-1.5 border rounded text-slate-700"
                                                placeholder="0"
                                                value={item.forecast}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setMonthlyFinancials(prev => {
                                                        const copy = [...prev];
                                                        copy[idx] = { ...copy[idx], forecast: val };
                                                        return copy;
                                                    });
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cashflow Graph */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-blue-600" />
                            Cashflow Graph for {p.name}
                        </h3>
                        <CashflowChart data={graphData} />
                    </div>
                </div>
            </div>

            {/* Project Change Log Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Project Change Log</h2>
                    <p className="text-sm text-slate-500">Track approved and pending changes to the contract value.</p>
                </div>
                <div className="p-6 space-y-8">

                    {/* Main Contract Changes */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2"><Briefcase size={16} className="text-blue-600" /> Main Contract</h3>
                            <button
                                onClick={() => setChangeOrders([...changeOrders, { id: Date.now(), number: changeOrders.length + 1, amount: 0, executed: false }])}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100 transition"
                            >
                                + Add Change Order
                            </button>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 font-bold text-slate-600 border-b">
                                    <tr>
                                        <th className="p-3 w-16">CO #</th>
                                        <th className="p-3">Description / Status</th>
                                        <th className="p-3 w-32">Amount ($)</th>
                                        <th className="p-3 w-24 text-center">Executed?</th>
                                        <th className="p-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {changeOrders.length === 0 && (
                                        <tr><td colSpan="5" className="p-4 text-center text-slate-400 italic">No change orders recorded.</td></tr>
                                    )}
                                    {changeOrders.map((co, idx) => (
                                        <tr key={co.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-700">#{co.number}</td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    placeholder="Change details..."
                                                    className="w-full text-sm bg-transparent border-0 border-b border-transparent focus:border-blue-400 focus:ring-0 px-0"
                                                />
                                                <div className="mt-1">
                                                    {!co.executed && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Pending</span>}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    className="w-full p-1.5 border rounded text-slate-700 font-mono text-right"
                                                    value={co.amount}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        const newCos = [...changeOrders];
                                                        newCos[idx].amount = val;
                                                        setChangeOrders(newCos);
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => { const n = [...changeOrders]; n[idx].executed = true; setChangeOrders(n); }}
                                                        className={`px-2 py-1 rounded text-xs font-bold ${co.executed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        onClick={() => { const n = [...changeOrders]; n[idx].executed = false; setChangeOrders(n); }}
                                                        className={`px-2 py-1 rounded text-xs font-bold ${!co.executed ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => setChangeOrders(changeOrders.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold border-t">
                                    <tr>
                                        <td colSpan="2" className="p-3 text-right text-slate-500">Initial Contract Value:</td>
                                        <td className="p-3 text-right text-slate-800">${budget.toLocaleString()}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" className="p-3 text-right text-slate-500">Total Approved Changes:</td>
                                        <td className="p-3 text-right text-emerald-600">
                                            +${changeOrders.filter(c => c.executed).reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                    <tr className="bg-blue-50/50 border-t border-blue-100">
                                        <td colSpan="2" className="p-3 text-right text-blue-900 uppercase text-xs tracking-wider">Adjusted Contract Value:</td>
                                        <td className="p-3 text-right text-blue-700 text-lg">
                                            ${(budget + changeOrders.filter(c => c.executed).reduce((acc, c) => acc + c.amount, 0)).toLocaleString()}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Subcontractor Changes */}
                    {useSubs && subNames.map((subName, subIdx) => {
                        const sCos = subChangeOrders[subIdx] || [];
                        const subTotal = sCos.filter(c => c.executed).reduce((acc, c) => acc + c.amount, 0);

                        return (
                            <div key={subIdx} className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-700 text-sm uppercase flex items-center gap-2"><Users size={16} className="text-slate-500" /> Sub: {subName || `Subcontractor #${subIdx + 1}`}</h3>
                                    <button
                                        onClick={() => setSubChangeOrders({
                                            ...subChangeOrders,
                                            [subIdx]: [...sCos, { id: Date.now(), number: sCos.length + 1, amount: 0, executed: false }]
                                        })}
                                        className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded font-bold hover:bg-slate-200 transition"
                                    >
                                        + Add Sub CO
                                    </button>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 font-bold text-slate-500 border-b">
                                            <tr>
                                                <th className="p-2 w-16">CO #</th>
                                                <th className="p-2">Description</th>
                                                <th className="p-2 w-32">Amount ($)</th>
                                                <th className="p-2 w-24 text-center">Executed?</th>
                                                <th className="p-2 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {sCos.length === 0 && (
                                                <tr><td colSpan="5" className="p-3 text-center text-slate-400 italic text-xs">No change orders for this subcontractor.</td></tr>
                                            )}
                                            {sCos.map((co, cIdx) => (
                                                <tr key={co.id} className="hover:bg-slate-50">
                                                    <td className="p-2 font-medium text-slate-700 text-xs">#{co.number}</td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Scope change..."
                                                            className="w-full text-xs bg-transparent border-0 border-b border-transparent focus:border-blue-400 focus:ring-0 px-0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            className="w-full p-1 border rounded text-slate-700 font-mono text-xs text-right"
                                                            value={co.amount}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                const newSubCos = { ...subChangeOrders };
                                                                newSubCos[subIdx][cIdx].amount = val;
                                                                setSubChangeOrders(newSubCos);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center text-xs">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    const n = { ...subChangeOrders }; n[subIdx][cIdx].executed = !n[subIdx][cIdx].executed;
                                                                    setSubChangeOrders(n);
                                                                }}
                                                                className={`px-1.5 py-0.5 rounded font-bold border ${co.executed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                                            >
                                                                {co.executed ? 'Yes' : 'No'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => {
                                                            const n = { ...subChangeOrders };
                                                            n[subIdx] = n[subIdx].filter((_, i) => i !== cIdx);
                                                            setSubChangeOrders(n);
                                                        }} className="text-slate-300 hover:text-rose-500"><X size={12} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {sCos.length > 0 && (
                                            <tfoot className="bg-slate-50 font-bold border-t text-xs">
                                                <tr>
                                                    <td colSpan="2" className="p-2 text-right text-slate-500">Total Approved Sub Changes:</td>
                                                    <td className="p-2 text-right text-emerald-600">+${subTotal.toLocaleString()}</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
            {/* Earned Value Management Section - Lump Sum Only */}
            {
                contractType === 'Lump Sum' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Earned Value Analysis</h2>
                            <p className="text-sm text-slate-500">Track project performance against the planned budget curve.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col gap-8">
                                {/* Inputs & Task Status */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="border rounded-lg p-4 bg-slate-50">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3">Task Status & EV Calculation</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-200">
                                                        <tr>
                                                            <th className="p-2">Task (Work Package)</th>
                                                            <th className="p-2">Budget (PV)</th>
                                                            <th className="p-2">% Complete</th>
                                                            <th className="p-2">Earned Value ($)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tasks.map((t, idx) => (
                                                            <tr key={t.id} className="border-b last:border-0 bg-white">
                                                                <td className="p-2">{t.name}</td>
                                                                <td className="p-2">${t.budget.toLocaleString()}</td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        className="w-16 p-1 border rounded"
                                                                        value={t.pctComplete}
                                                                        onChange={(e) => {
                                                                            const newTasks = [...tasks];
                                                                            newTasks[idx].pctComplete = Number(e.target.value);
                                                                            setTasks(newTasks);
                                                                        }}
                                                                    /> %
                                                                </td>
                                                                <td className="p-2 font-bold text-emerald-600">
                                                                    ${(t.budget * (t.pctComplete / 100)).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-slate-100 font-bold">
                                                            <td className="p-2">TOTAL</td>
                                                            <td className="p-2">${tasks.reduce((a, t) => a + t.budget, 0).toLocaleString()}</td>
                                                            <td className="p-2">-</td>
                                                            <td className="p-2 text-emerald-700">${totalCurrentEV.toLocaleString()}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Graph & Full Metrics Table */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="border rounded-lg p-4 bg-white">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">EVM Metrics Table</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-slate-200">
                                                    <tr>
                                                        <th className="p-2">Month</th>
                                                        <th className="p-2">PV ($)</th>
                                                        <th className="p-2">EV ($)</th>
                                                        <th className="p-2">AC ($)</th>
                                                        <th className="p-2">CPI</th>
                                                        <th className="p-2">SPI</th>
                                                        <th className="p-2">EAC ($)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {evData.map((d, i) => {
                                                        const rowCPI = (d.ev && d.ac) ? (d.ev / d.ac).toFixed(2) : '-';
                                                        const rowSPI = (d.ev && d.pv) ? (d.ev / d.pv).toFixed(2) : '-';
                                                        return (
                                                            <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                                                                <td className="p-2 font-medium">{d.month}</td>
                                                                <td className="p-2">{d.pv.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                                <td className="p-2">{d.ev ? d.ev.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</td>
                                                                <td className="p-2">{d.ac ? d.ac.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</td>
                                                                <td className={`p-2 font-bold ${rowCPI < 1 && rowCPI !== '-' ? 'text-rose-600' : 'text-emerald-600'}`}>{rowCPI}</td>
                                                                <td className={`p-2 font-bold ${rowSPI < 1 && rowSPI !== '-' ? 'text-rose-600' : 'text-emerald-600'}`}>{rowSPI}</td>
                                                                <td className="p-2">{d.eac ? Number(d.eac).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <EVChart data={evData} bac={budget} />
                                        <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">
                                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                                <div className="text-slate-500">Current CPI</div>
                                                <div className={`font-bold text-lg ${cpi >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{cpi}</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                                <div className="text-slate-500">Current SPI</div>
                                                <div className={`font-bold text-lg ${spi >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{spi}</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                                <div className="text-slate-500">EAC</div>
                                                <div className="font-bold text-slate-800 text-lg">${Number(eac).toLocaleString()}</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                                <div className="text-slate-500">ETC</div>
                                                <div className="font-bold text-slate-800 text-lg">${Number(etc).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const ReportModalContent = () => (
    <div className="space-y-6">
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <FileText className="text-rose-600" size={32} />
            </div>
            <h3 className="font-bold text-slate-900">Monthly_Health_Check_Oct2025.pdf</h3>
            <p className="text-sm text-slate-500">Ready for download • 1.2 MB</p>
        </div>
        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
            <Download size={18} /> Download PDF
        </button>
    </div>
);

const StaffingModalContent = () => (
    <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <div className="flex items-start gap-3">
                <Briefcase className="text-blue-600 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-blue-900">Why optimize staffing?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        Utilizing junior staff can increase your Gross Margin by an estimated <span className="font-bold">4-6%</span>.
                    </p>
                </div>
            </div>
        </div>
        <h4 className="font-bold text-slate-800 mt-4">Available Junior Resources</h4>
        <div className="grid gap-3">
            {JUNIOR_STAFF.map((staff, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div>
                        <div className="font-bold text-slate-900">{staff.name}</div>
                        <div className="text-xs text-slate-500">{staff.role} • {staff.rate}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">{staff.availability}</div>
                        <button className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded mt-1 hover:bg-blue-700 transition-colors">Request</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AuditModalContent = () => (
    <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-3 font-bold text-slate-600">Date</th>
                        <th className="p-3 font-bold text-slate-600">User</th>
                        <th className="p-3 font-bold text-slate-600">Action</th>
                        <th className="p-3 font-bold text-slate-600">Detail</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {AUDIT_LOG.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500 whitespace-nowrap">{log.date}</td>
                            <td className="p-3 font-medium text-slate-900">{log.user}</td>
                            <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{log.action}</span></td>
                            <td className="p-3 text-slate-600">{log.detail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Main App ---

export default function App() {
    const [view, setView] = useState('portfolio'); // 'portfolio', 'detail', 'static'
    const [activeProject, setActiveProject] = useState(PROJECTS[0]);
    const [activeTab, setActiveTab] = useState('contracts');
    const [modals, setModals] = useState({ report: false, staffing: false, audit: false });

    const toggleModal = (key, value) => setModals(prev => ({ ...prev, [key]: value }));

    // Static view logic omitted for brevity in live preview, focusing on interactive logic
    if (view === 'static') {
        return (
            <div className="min-h-screen bg-white p-8 font-sans">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Static Wireframes</h1>
                    <button onClick={() => setView('portfolio')} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-slate-700 transition-colors">Exit Review Mode</button>
                </div>

                <StaticWrapper title="1. Project Portfolio Dashboard">
                    <PortfolioViewContent
                        projects={PROJECTS}
                        onViewProject={() => { }}
                    />
                </StaticWrapper>

                <StaticWrapper title="2. Project Detail View">
                    <ProjectDetailContent project={PROJECTS[0]} activeTab="contracts" setActiveTab={() => { }} onToggleModal={() => { }} />
                </StaticWrapper>

                <div className="grid md:grid-cols-2 gap-8">
                    <StaticWrapper title="3. Report Modal">
                        <ReportModalContent />
                    </StaticWrapper>
                    <StaticWrapper title="4. Staffing Modal">
                        <StaffingModalContent />
                    </StaticWrapper>
                </div>

                <StaticWrapper title="5. Audit Log">
                    <AuditModalContent />
                </StaticWrapper>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-20 bg-blue-950 flex flex-col items-center py-8 gap-8 fixed h-full z-20 shadow-xl border-r border-blue-900/50">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">I</div>
                <div className="flex flex-col gap-6">
                    <div className="p-3 text-blue-300 hover:text-white hover:bg-blue-900 rounded-xl cursor-pointer transition-all"><Menu size={24} /></div>
                    <div className="p-3 text-white bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-600/20"><Briefcase size={24} /></div>
                    <div className="p-3 text-blue-300 hover:text-white hover:bg-blue-900 rounded-xl cursor-pointer transition-all"><Users size={24} /></div>
                    <div className="p-3 text-blue-300 hover:text-white hover:bg-blue-900 rounded-xl cursor-pointer transition-all"><FileText size={24} /></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-20 bg-slate-900 min-h-screen">
                <div className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-slate-900/90 border-b border-blue-900/50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-white font-bold text-lg tracking-tight">Ibex<span className="text-blue-500">IQ</span></h2>
                        <span className="text-blue-700">/</span>
                        <span className="text-blue-200 text-sm font-medium">Project Management</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('static')} className="text-white bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors">
                            <Layout size={14} /> Static Review View
                        </button>
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-white">Ali Wagih</div>
                            <div className="text-xs text-blue-300">Project Director</div>
                        </div>
                        <div className="w-10 h-10 bg-blue-800 rounded-full border-2 border-blue-600 flex items-center justify-center text-white font-bold">AW</div>
                    </div>
                </div>

                {view === 'portfolio' ? (
                    <div className="p-8">
                        <PortfolioViewContent
                            projects={PROJECTS}
                            onViewProject={(proj) => {
                                setActiveProject(proj);
                                setView('detail');
                            }}
                        />
                    </div>
                ) : (
                    <div className="p-8 max-w-7xl mx-auto">
                        <button onClick={() => setView('portfolio')} className="text-sm text-blue-200 hover:text-white mb-2 flex items-center gap-1 transition-colors">
                            <ChevronLeft size={16} /> Back to Portfolio List
                        </button>
                        <ProjectDetailContent project={activeProject} activeTab={activeTab} setActiveTab={setActiveTab} onToggleModal={toggleModal} />

                        {modals.report && <Modal title="Generate Project Report" onClose={() => toggleModal('report', false)}><ReportModalContent /></Modal>}
                        {modals.staffing && <Modal title="Staffing Opportunities" onClose={() => toggleModal('staffing', false)}><StaffingModalContent /></Modal>}
                        {modals.audit && <Modal title="Audit Log & History" onClose={() => toggleModal('audit', false)}><AuditModalContent /></Modal>}
                    </div>
                )}
            </div>
        </div>
    );
}