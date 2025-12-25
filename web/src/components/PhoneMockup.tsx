import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../lib/motion";
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Settings,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Send,
  Flame,
  Beef,
  Wheat,
  Users,
  Moon,
  Scale,
  Ruler,
  Target,
  Activity,
  TrendingUp,
} from "lucide-react";

type Tab = "Home" | "Meals" | "Workouts" | "AI" | "Settings";

// Match actual mobile app tabs
const navTabs = [
  { label: "Home" as Tab, icon: Home },
  { label: "Meals" as Tab, icon: UtensilsCrossed },
  { label: "Workouts" as Tab, icon: Dumbbell },
  { label: "AI" as Tab, icon: Brain },
  { label: "Settings" as Tab, icon: Settings },
];

// Mobile app actual color palette
const THEME = {
  bg: "#000000",
  card: "#121212",
  primary: "#8b5cf6",
  text: "#ffffff",
  textMuted: "#A0A0A0",
  border: "#333333",
};

export function PhoneMockup({
  minimalLogoOnly = false,
}: { minimalLogoOnly?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<Tab>("Home");

  return (
    <div className="relative mx-auto flex max-w-lg justify-center lg:justify-end">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="relative h-[520px] w-[240px] sm:h-[580px] sm:w-[290px]"
      >
        {/* Glow effect */}
        <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-violet-500/30 via-purple-400/15 to-fuchsia-400/14 blur-2xl" />

        <motion.div
          initial={{ rotate: -8, y: 34, opacity: 0 }}
          whileInView={{ rotate: -4, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full rounded-[38px] border border-neutral-700/60 p-3"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a, #000, #0a0a0a)' }}
        >
          {/* Status bar */}
          {!minimalLogoOnly && (
            <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center pt-2">
              <div className="flex flex-row items-center justify-between w-[78%] mx-auto mb-1 select-none text-[11px] text-neutral-500 font-semibold">
                <span>9:41</span>
                <div className="flex gap-[2px]">
                  <span className="h-1 w-1 rounded-full bg-neutral-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span className="h-2 w-2 rounded-full bg-neutral-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-5 rounded-[2px] border border-neutral-400 flex items-center justify-center">
                    <span className="block h-2 w-3.5 rounded-[1.5px] bg-green-400 ml-0.5"></span>
                  </span>
                  <span className="h-1 w-0.5 rounded bg-neutral-400 mr-0.5" />
                </div>
              </div>
              <div className="h-5 w-28 rounded-b-2xl bg-black mt-1" />
            </div>
          )}

          {minimalLogoOnly ? (
            <div className="flex flex-col h-full w-full items-center justify-center relative">
              <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 sm:h-56 sm:w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.19),_transparent_80%)] pointer-events-none" />
              <div className="flex items-center justify-center rounded-full border-4 border-violet-500 bg-white h-32 w-32 sm:h-36 sm:w-36 shadow-lg relative z-20">
                <img
                  src="/coreiq-logo.png"
                  alt="CoreIQ logo"
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-contain drop-shadow"
                />
              </div>
            </div>
          ) : (
            <div className="relative h-full overflow-hidden rounded-[32px]" style={{ backgroundColor: THEME.bg }}>
              {/* Header - matches mobile DashboardHeader */}
              <div className="px-5 pb-3 pt-12" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    {activeTab === "Home" && (
                      <>
                        <p className="text-sm" style={{ color: THEME.textMuted }}>Welcome,</p>
                        <p className="text-base font-bold" style={{ color: THEME.text }}>
                          <span style={{ color: THEME.primary }}>User</span> <span className="text-lg">👋</span>
                        </p>
                      </>
                    )}
                    {activeTab !== "Home" && (
                      <p className="text-base font-bold" style={{ color: THEME.text }}>
                        {activeTab}
                      </p>
                    )}
                  </div>
                </div>
                {activeTab === "Home" && (
                  <div className="mt-3 flex items-center justify-center">
                    <button style={{ color: THEME.textMuted }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className="text-sm font-semibold mx-4 py-1" style={{ color: THEME.text }}>
                      Monday, Jan 15
                    </button>
                    <button style={{ color: THEME.textMuted }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="h-[calc(100%-140px)] overflow-y-auto px-5 pt-6 pb-24" style={{ backgroundColor: THEME.bg }}>
                <AnimatePresence mode="wait">
                  {activeTab === "Home" && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Today's Overview - Mobile Style Cards */}
                      <div>
                        <h2 className="mb-4 text-lg font-bold" style={{ color: THEME.text }}>
                          Today's Overview
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Nutrition Card */}
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                              <Flame className="h-5 w-5 text-amber-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Nutrition</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>1,842 kcal</p>
                          </div>
                          {/* Sleep Card */}
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                              <Moon className="h-5 w-5 text-violet-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Sleep</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>7h 30m</p>
                          </div>
                          {/* Steps Card */}
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                              <Activity className="h-5 w-5 text-emerald-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Steps</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>8,420</p>
                          </div>
                          {/* Water Card */}
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                              <Droplets className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Water</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>1.5 / 2L</p>
                          </div>
                        </div>
                      </div>

                      {/* Physical Stats */}
                      <div>
                        <h2 className="mb-4 text-lg font-bold" style={{ color: THEME.text }}>
                          Physical Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                              <Scale className="h-4 w-4 text-amber-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Weight</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>75.5 kg</p>
                          </div>
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                              <Ruler className="h-4 w-4 text-emerald-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Height</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>175 cm</p>
                          </div>
                        </div>
                      </div>

                      {/* Goals */}
                      <div>
                        <h2 className="mb-4 text-lg font-bold" style={{ color: THEME.text }}>
                          Goals
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                              <Target className="h-4 w-4 text-orange-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Activity</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>Moderate</p>
                          </div>
                          <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                              <TrendingUp className="h-4 w-4 text-violet-500" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: THEME.textMuted }}>Goal</p>
                            <p className="text-sm font-bold" style={{ color: THEME.text }}>Gain Muscle</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Meals" && (
                    <motion.div
                      key="meals"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Macros Summary */}
                      <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                        <p className="mb-3 text-sm font-bold" style={{ color: THEME.text }}>Daily Macros</p>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center">
                            <Flame className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                            <p className="text-xs font-bold" style={{ color: THEME.text }}>1,842</p>
                            <p className="text-[10px]" style={{ color: THEME.textMuted }}>kcal</p>
                          </div>
                          <div className="text-center">
                            <Beef className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                            <p className="text-xs font-bold" style={{ color: THEME.text }}>142g</p>
                            <p className="text-[10px]" style={{ color: THEME.textMuted }}>protein</p>
                          </div>
                          <div className="text-center">
                            <Wheat className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
                            <p className="text-xs font-bold" style={{ color: THEME.text }}>198g</p>
                            <p className="text-[10px]" style={{ color: THEME.textMuted }}>carbs</p>
                          </div>
                          <div className="text-center">
                            <Droplets className="mx-auto mb-1 h-5 w-5 text-pink-400" />
                            <p className="text-xs font-bold" style={{ color: THEME.text }}>65g</p>
                            <p className="text-[10px]" style={{ color: THEME.textMuted }}>fats</p>
                          </div>
                        </div>
                      </div>

                      {/* Meal Cards */}
                      <div className="space-y-3">
                        {["Breakfast", "Lunch", "Dinner"].map((meal, i) => (
                          <div key={meal} className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-bold" style={{ color: THEME.text }}>{meal}</p>
                              <p className="text-xs" style={{ color: THEME.textMuted }}>{[420, 620, 540][i]} kcal</p>
                            </div>
                            <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                              <p className="text-xs" style={{ color: THEME.textMuted }}>
                                {["Oatmeal with berries", "Grilled chicken salad", "Salmon with vegetables"][i]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Workouts" && (
                    <motion.div
                      key="workouts"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {[
                        { name: "Chest", color: "text-blue-400", bg: "rgba(59, 130, 246, 0.1)", exercises: ["Bench Press ✓", "Push-ups ✓", "Cable Fly"] },
                        { name: "Back", color: "text-green-400", bg: "rgba(16, 185, 129, 0.1)", exercises: ["Pull-ups ✓", "Barbell Row"] },
                        { name: "Cardio", color: "text-red-400", bg: "rgba(239, 68, 68, 0.1)", exercises: ["Running 30min"] },
                      ].map((group) => (
                        <div key={group.name} className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                          <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-xl p-2" style={{ backgroundColor: group.bg }}>
                              <Dumbbell className={`h-5 w-5 ${group.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold" style={{ color: THEME.text }}>{group.name}</p>
                              <p className="text-xs" style={{ color: THEME.textMuted }}>{group.exercises.length} exercises</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {group.exercises.map((ex) => (
                              <div key={ex} className="rounded-2xl px-3 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                <p className="text-xs" style={{ color: ex.includes("✓") ? "#10b981" : THEME.textMuted }}>{ex}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "AI" && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col h-full"
                    >
                      <div className="flex-1 overflow-y-auto space-y-4 px-0 pb-2">
                        {/* AI Message */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                            <Brain className="h-4 w-4 text-violet-400" />
                          </div>
                          <div className="flex-1 rounded-3xl rounded-tl-none px-4 py-3" style={{ backgroundColor: THEME.card }}>
                            <p className="text-xs" style={{ color: THEME.text }}>
                              Hey! Ready to crush your goals today. What can I help you with?
                            </p>
                          </div>
                        </div>
                        {/* User Message */}
                        <div className="flex items-start justify-end gap-3">
                          <div className="flex-1 rounded-3xl rounded-tr-none px-4 py-3" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                            <p className="text-xs" style={{ color: THEME.text }}>
                              Create a meal plan for muscle gain
                            </p>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: THEME.card }}>
                            <Users className="h-4 w-4" style={{ color: THEME.textMuted }} />
                          </div>
                        </div>
                        {/* AI Response */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                            <Brain className="h-4 w-4 text-violet-400" />
                          </div>
                          <div className="flex-1 rounded-3xl rounded-tl-none px-4 py-3" style={{ backgroundColor: THEME.card }}>
                            <p className="text-xs" style={{ color: THEME.text }}>
                              I've created a 2,800 kcal bulking plan with 180g protein. Check your Plans tab! 💪
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Input */}
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="text"
                          placeholder="Ask your AI coach..."
                          className="flex-1 min-w-0 rounded-2xl py-2.5 px-4 text-sm focus:outline-none"
                          style={{ backgroundColor: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}` }}
                        />
                        <button className="flex-shrink-0 rounded-2xl p-2.5 transition hover:opacity-80" style={{ backgroundColor: THEME.primary }}>
                          <Send className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "Settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                        <p className="mb-4 text-sm font-bold" style={{ color: THEME.text }}>Profile</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: THEME.textMuted }}>Name</p>
                            <p className="text-xs font-medium" style={{ color: THEME.text }}>User</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: THEME.textMuted }}>Email</p>
                            <p className="text-xs font-medium" style={{ color: THEME.text }}>user@example.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                        <p className="mb-4 text-sm font-bold" style={{ color: THEME.text }}>Preferences</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: THEME.textMuted }}>Theme</p>
                            <p className="text-xs font-medium" style={{ color: THEME.primary }}>Dark</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: THEME.textMuted }}>Units</p>
                            <p className="text-xs font-medium" style={{ color: THEME.text }}>Metric</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl p-4" style={{ backgroundColor: THEME.card, border: `1px solid ${THEME.border}` }}>
                        <p className="text-xs" style={{ color: THEME.textMuted }}>CoreIQ v1.0.0</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Navbar - matches mobile style */}
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-2" style={{ backgroundColor: THEME.bg, borderTop: `1px solid ${THEME.border}` }}>
                <div className="flex items-center justify-around">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.label;
                    return (
                      <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className="flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition hover:opacity-80"
                      >
                        <Icon
                          size={20}
                          style={{ color: isActive ? THEME.primary : THEME.textMuted }}
                        />
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: isActive ? THEME.primary : THEME.textMuted }}
                        >
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
