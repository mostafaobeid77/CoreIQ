
import { Activity, Users, Database, Zap, ArrowUp, ArrowDown, Server } from 'lucide-react'

export function SystemMonitor() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Active Athletes"
                    value="1,248"
                    change="+12%"
                    trend="up"
                    icon={Users}
                    color="text-emerald-400"
                    bg="bg-emerald-400/10"
                />
                <MetricCard
                    label="Knowledge Base"
                    value="842"
                    subvalue="Items"
                    change="+5"
                    trend="up"
                    icon={Database}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <MetricCard
                    label="System Load"
                    value="42%"
                    subvalue="Optimal"
                    change="-2%"
                    trend="down"
                    icon={Server}
                    color="text-violet-400"
                    bg="bg-violet-400/10"
                />
                <MetricCard
                    label="API Latency"
                    value="24ms"
                    subvalue="Global"
                    change="+2ms"
                    trend="up"
                    icon={Zap}
                    color="text-amber-400"
                    bg="bg-amber-400/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visualizer */}
                <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Neural Traffic Pulse</h3>
                            <p className="text-sm text-slate-400">Real-time API request volume</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-500">Live</span>
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for Canvas Graph */}
                    <div className="h-64 w-full flex items-end gap-1 relative z-10 opacity-50">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-violet-500/50 rounded-t-sm transition-all duration-300"
                                style={{ height: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.5 }}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-0" />
                </div>

                {/* Live Log */}
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm p-0 overflow-hidden flex flex-col h-[380px]">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-violet-400" /> System Events
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">LIVE_FEED</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        <LogItem time="10:42:15" action="User Login" user="alex.j" status="success" />
                        <LogItem time="10:41:55" action="Workout Complete" user="sarah.fit" status="success" />
                        <LogItem time="10:40:12" action="Plan Generated" user="mike_v2" status="info" />
                        <LogItem time="10:38:45" action="Failed Login" user="unknown" status="error" />
                        <LogItem time="10:35:22" action="Weight Updated" user="jessica.m" status="success" />
                        <LogItem time="10:32:10" action="User Signup" user="david.k" status="success" />
                        <LogItem time="10:30:00" action="System Backup" user="SYSTEM" status="warning" />
                        <LogItem time="10:28:15" action="Workout Started" user="tom.h" status="success" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ label, value, subvalue, change, trend, icon: Icon, color, bg }: any) {
    return (
        <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity ${color}`}>
                <Icon className="w-16 h-16 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${bg}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
                        }`}>
                        {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {change}
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
                        {subvalue && <span className="text-xs text-slate-600 border-l border-slate-700 pl-2">{subvalue}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

function LogItem({ time, action, user, status }: any) {
    const statusColors = {
        success: 'text-emerald-400',
        error: 'text-rose-400',
        warning: 'text-amber-400',
        info: 'text-blue-400'
    }
    return (
        <div className="flex items-center gap-3 text-sm group">
            <span className="font-mono text-xs text-slate-600 group-hover:text-slate-500 transition-colors">{time}</span>
            <div className="flex-1 border-b border-dashed border-white/5 pb-1">
                <span className="text-slate-300 font-medium">{action}</span>
                <span className="text-slate-500 text-xs ml-2">by <span className="text-slate-400">{user}</span></span>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${(statusColors as any)[status] || 'text-slate-500'} bg-current`} />
        </div>
    )
}
