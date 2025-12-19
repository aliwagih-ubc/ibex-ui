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

const PROJECTS = [
  { id: 1, name: "Pier 61 Decommissioning", code: "24-001", client: "Trans Mountain", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Good", margin: 46.5, revenue: 1200000 },
  { id: 2, name: "Strathcona Dam Project", code: "24-042", client: "BC Hydro", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Warning", margin: 38.2, revenue: 850000 },
  { id: 3, name: "Westridge Delivery Line", code: "23-115", client: "Trans Mountain", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Good", margin: 42.1, revenue: 2100000 },
  { id: 4, name: "Cambie Bridge Upgrade", code: "24-088", client: "City of Vancouver", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Critical", margin: 12.4, revenue: 320000 },
  { id: 5, name: "Iona Island WWTP", code: "24-099", client: "Metro Vancouver", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Good", margin: 41.0, revenue: 550000 },
  { id: 6, name: "Broadway Subway", code: "24-101", client: "TI Corp", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Warning", margin: 35.5, revenue: 980000 },
  { id: 7, name: "Massey Tunnel Replacement", code: "24-105", client: "TI Corp", pm: "Ali Wagih", branch: "Vancouver", discipline: "Project Management", status: "Active", health: "Good", margin: 44.2, revenue: 1500000 },
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
  </div>
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
  // Prevent crash if data is empty or undefined during initial load
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 text-slate-400">
        Loading EVM Data...
      </div>
    );
  }

  // Simple SVG Chart
  const width = 700;
  const height = 350;
  const padding = 50;
  
  // Calculate max Y for scaling including EAC
  const maxVal = Math.max(
      bac * 1.2,
      ...data.map(d => Math.max(d.pv || 0, d.ev || 0, d.ac || 0, d.eac || 0))
  );

  const getX = (index) => padding + (index * (width - 2 * padding) / (data.length - 1));
  const getY = (val) => height - padding - (val / maxVal) * (height - 2 * padding);

  const makePath = (key, color, dash = "") => {
    // Safe access
    if (!data[0] || data[0][key] === undefined) return null;

    let d = "";
    let started = false;
    
    for (let i = 0; i < data.length; i++) {
        const val = data[i][key];
        if (val !== undefined && val !== null) {
            if (!started) {
                d += `M ${getX(i)} ${getY(val)}`;
                started = true;
            } else {
                d += ` L ${getX(i)} ${getY(val)}`;
            }
        }
    }
    return <path d={d} fill="none" stroke={color} strokeWidth="2" strokeDasharray={dash} />;
  };

  return (
    <div className="w-full overflow-x-auto">
        <svg width={width} height={height} className="bg-white rounded-lg border border-slate-200">
            {/* Title */}
            <text x={width/2} y={20} textAnchor="middle" className="text-xs font-bold fill-slate-700">Project Performance S-Curve</text>

            {/* Axes */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Y-Axis Label */}
            <text x={15} y={height/2} transform={`rotate(-90 15,${height/2})`} textAnchor="middle" className="text-xs fill-slate-500 font-bold">Cost ($)</text>
            
            {/* X-Axis Label */}
            <text x={width/2} y={height - 10} textAnchor="middle" className="text-xs fill-slate-500 font-bold">Timeline</text>

            {/* BAC Line */}
            <line x1={padding} y1={getY(bac)} x2={width - padding} y2={getY(bac)} stroke="#94a3b8" strokeDasharray="4" />
            <text x={width - padding - 30} y={getY(bac) - 5} className="text-[10px] fill-slate-500 font-bold">BAC: ${bac/1000}k</text>

            {/* X-Axis Ticks */}
            {data.map((d, i) => (
                <text key={i} x={getX(i)} y={height - padding + 15} textAnchor="middle" className="text-[10px] fill-slate-600">
                    {d.month}
                </text>
            ))}

            {/* Y-Axis Ticks (Approx) */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
                const val = maxVal * tick;
                return (
                    <g key={i}>
                        <text x={padding - 5} y={getY(val) + 3} textAnchor="end" className="text-[10px] fill-slate-400">
                            ${(val/1000).toFixed(0)}k
                        </text>
                        <line x1={padding - 3} y1={getY(val)} x2={padding} y2={getY(val)} stroke="#cbd5e1" />
                    </g>
                )
            })}

            {/* Curves */}
            {makePath('pv', '#3b82f6')} {/* Blue PV */}
            {makePath('ac', '#ef4444')} {/* Red AC */}
            {makePath('ev', '#10b981')} {/* Green EV */}
            {makePath('eac', '#a855f7', "5,5")} {/* Purple Dashed EAC */}

            {/* Legend */}
            <g transform={`translate(${padding + 20}, ${padding + 10})`}>
                <rect width="10" height="10" fill="#3b82f6" y="0" />
                <text x="15" y="9" className="text-[10px] fill-slate-600">Planned Value (PV)</text>
                
                <rect width="10" height="10" fill="#10b981" y="15" />
                <text x="15" y="24" className="text-[10px] fill-slate-600">Earned Value (EV)</text>
                
                <rect width="10" height="10" fill="#ef4444" y="30" />
                <text x="15" y="39" className="text-[10px] fill-slate-600">Actual Cost (AC)</text>

                <line x1="0" y1="50" x2="10" y2="50" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,2"/>
                <text x="15" y="54" className="text-[10px] fill-slate-600">Est. at Completion (EAC)</text>
            </g>
        </svg>
    </div>
  );
};

// --- Views ---

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
                    onChange={(e) => setFilters({...filters, [key]: e.target.value})}
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
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${proj.health === 'Good' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : proj.health === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{proj.health}</span></td>
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

const ProjectDetailContent = ({ activeTab, setActiveTab, onToggleModal }) => {
    // --- Detail View State ---
    const [useSubs, setUseSubs] = useState(false);
    const [subCount, setSubCount] = useState(0);
    const [subNames, setSubNames] = useState([]);
    
    const [hasEscalation, setHasEscalation] = useState(null);
    const [escalationExercised, setEscalationExercised] = useState(null);
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [evData, setEvData] = useState([]);
    
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
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        // Mocking monthly Actuals from Acumatica (Cumulative AC)
        const mockAC = [180000, 380000, 590000, null, null, null]; 
        
        // Mocking Planned Value (Linear for simplicity)
        const totalBudget = tasks.reduce((acc, t) => acc + t.budget, 0);
        
        const data = months.map((m, i) => {
            const plannedValue = Math.min(totalBudget, (totalBudget / months.length) * (i + 1));
            const actualCost = mockAC[i];
            
            // To draw a curve, we normally need historical EV. 
            // For this wireframe, we'll interpolate EV based on the current Total EV we calculated above
            // assuming steady progress for months 1-3.
            let earnedValue = null;
            if (i <= 2) { 
               // Distribute current EV roughly over the 3 active months for the curve
               earnedValue = (totalCurrentEV / 3) * (i + 1); 
            }

            // Calculate EAC for historical points
            let histEAC = null;
            if (actualCost && earnedValue) {
                const cpi = earnedValue / actualCost;
                histEAC = cpi > 0 ? totalBudget / cpi : 0;
            }

            return {
                month: m,
                pv: plannedValue,
                ac: actualCost,
                ev: earnedValue,
                eac: histEAC
            };
        });
        setEvData(data);
    }, [tasks, budget]); // Recalculate if tasks change

    // Current Metrics
    const currentAC = 590000; // From Month 3
    const cpi = currentAC > 0 ? (totalCurrentEV / currentAC).toFixed(2) : 0;
    const spi = evData[2]?.pv > 0 ? (totalCurrentEV / evData[2].pv).toFixed(2) : 0;
    const eac = cpi > 0 ? (budget / cpi).toFixed(0) : 0;
    const etc = eac - currentAC;

    return (
  <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border-l-8 border-l-emerald-500">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Pier 61 Decommissioning</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md font-bold border border-emerald-200">Active</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Project: 24-001 • <span className="font-semibold">Acumatica PM: Ali Wagih</span> • Client: Trans Mountain</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financials */}
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
              <div className="text-2xl font-bold text-emerald-600">46.5%</div>
              <div className="text-[10px] text-slate-400">Target: 40%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium mb-1">Last Mo. Income</div>
              <div className="text-2xl font-bold text-slate-800">$42k</div>
              <div className="text-[10px] text-slate-400">Avg: $38k</div>
            </div>
          </div>
          <ProgressBar label="Budget Remaining" current={1200000} total={2100000} colorClass="bg-emerald-500" />
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
             <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Accruals</div>
                <div className="text-lg font-bold text-slate-800">$85,000</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1"><CheckCircle2 size={12}/> Accrued</div>
                <div className="text-xs text-slate-400">AR Aging: 15 Days</div>
             </div>
          </div>
        </div>

        {/* Performance Snapshot */}
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

        {/* Critical Alerts / Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-b from-white to-slate-50 flex flex-col h-full">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Action Items
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="mt-0.5 p-1.5 bg-rose-100 text-rose-600 rounded-md"><AlertTriangle size={14} /></div>
                <div>
                    <div className="text-sm font-bold text-slate-800">Pending Change Order</div>
                    <div className="text-xs text-slate-500">Contract value vs Pending CO ratio is high.</div>
                </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="mt-0.5 p-1.5 bg-emerald-100 text-emerald-600 rounded-md"><CheckCircle2 size={14} /></div>
                <div>
                    <div className="text-sm font-bold text-slate-800">AR Check Passed</div>
                    <div className="text-xs text-slate-500">No invoices {'>'} 60 days.</div>
                </div>
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
                <div className="space-y-4">
                    {!useSubs || subCount === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg">
                            No subcontractors identified in Contracts tab.
                        </div>
                    ) : (
                        subNames.map((name, idx) => (
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
                        ))
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

      {/* Earned Value Management Section */}
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

                    {/* Monthly Actuals Table (Acumatica Input) */}
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-slate-50 h-full">
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Monthly Actuals (from Acumatica)</h3>
                            <div className="overflow-x-auto max-h-[250px]">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-200">
                                        <tr>
                                            <th className="p-2">Month</th>
                                            <th className="p-2">Actual Cost (Cumulative)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {evData.map((d, i) => (
                                            <tr key={i} className="border-b last:border-0 bg-white">
                                                <td className="p-2">{d.month}</td>
                                                <td className="p-2">
                                                    {d.ac !== null ? `$${d.ac.toLocaleString()}` : <span className="text-slate-400 italic">--</span>}
                                                </td>
                                            </tr>
                                        ))}
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
                                                <td className="p-2">{d.pv.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                                <td className="p-2">{d.ev ? d.ev.toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}</td>
                                                <td className="p-2">{d.ac ? d.ac.toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}</td>
                                                <td className={`p-2 font-bold ${rowCPI < 1 && rowCPI !== '-' ? 'text-rose-600' : 'text-emerald-600'}`}>{rowCPI}</td>
                                                <td className={`p-2 font-bold ${rowSPI < 1 && rowSPI !== '-' ? 'text-rose-600' : 'text-emerald-600'}`}>{rowSPI}</td>
                                                <td className="p-2">{d.eac ? Number(d.eac).toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}</td>
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
  </div>
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
                  onViewProject={() => {}} 
              />
          </StaticWrapper>

          <StaticWrapper title="2. Project Detail View">
              <ProjectDetailContent activeTab="contracts" setActiveTab={() => {}} onToggleModal={() => {}} />
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
                    onViewProject={(proj) => setView('detail')}
                />
            </div>
        ) : (
            <div className="p-8 max-w-7xl mx-auto">
                <button onClick={() => setView('portfolio')} className="text-sm text-blue-200 hover:text-white mb-2 flex items-center gap-1 transition-colors">
                    <ChevronLeft size={16} /> Back to Portfolio List
                </button>
                <ProjectDetailContent activeTab={activeTab} setActiveTab={setActiveTab} onToggleModal={toggleModal} />
                
                {modals.report && <Modal title="Generate Project Report" onClose={() => toggleModal('report', false)}><ReportModalContent /></Modal>}
                {modals.staffing && <Modal title="Staffing Opportunities" onClose={() => toggleModal('staffing', false)}><StaffingModalContent /></Modal>}
                {modals.audit && <Modal title="Audit Log & History" onClose={() => toggleModal('audit', false)}><AuditModalContent /></Modal>}
            </div>
        )}
      </div>
    </div>
  );
}