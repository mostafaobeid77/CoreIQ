
import { motion } from 'framer-motion'

export function PhoneMockup() {
    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800 relative">
                {/* Screen Content */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col">
                    {/* Status Bar */}
                    <div className="h-12 w-full bg-slate-950 flex justify-between items-center px-6 text-white text-xs font-medium z-20">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-2.5 bg-white rounded-sm" />
                            <div className="w-0.5 h-1 bg-white/50" />
                        </div>
                    </div>

                    {/* Dynamic Island Area */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20" />

                    {/* App UI Placeholder */}
                    <div className="flex-1 p-4 overflow-hidden relative">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 mt-2">
                            <div>
                                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Thursday, 25</div>
                                <div className="text-white text-xl font-bold">Today's Plan</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                                AI
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-3">
                            {/* Workout Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-4 text-white relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="text-xs font-medium text-white/70 mb-1">Workout • 45m</div>
                                    <h3 className="text-lg font-bold mb-3">Push Pull Legs A</h3>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 rounded-md bg-white/20 text-xs backdrop-blur-sm">4 Exercises</div>
                                        <div className="px-2 py-1 rounded-md bg-white/20 text-xs backdrop-blur-sm">High Volume</div>
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-8 translate-y-8" />
                            </motion.div>

                            {/* Nutrition Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold">Nutrition</span>
                                    <span className="text-xs text-slate-400">1,240 / 2,400 kcal</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[52%] bg-emerald-500 rounded-full" />
                                </div>
                                <div className="mt-3 flex justify-between text-xs text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <span className="text-emerald-400 font-medium">110g</span>
                                        <span>Protein</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-blue-400 font-medium">145g</span>
                                        <span>Carbs</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-amber-400 font-medium">42g</span>
                                        <span>Fats</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                    </div>

                    {/* Bottom Nav Placeholder */}
                    <div className="h-16 px-6 flex justify-between items-center text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                        <div className="w-6 h-6 rounded-md bg-slate-800" />
                        <div className="w-6 h-6 rounded-md bg-slate-800" />
                        <div className="w-6 h-6 rounded-md bg-slate-800" />
                    </div>
                </div>
            </div>
        </div>
    )
}
