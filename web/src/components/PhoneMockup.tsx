import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../lib/motion";
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Settings,
  Apple,
  Heart,
  Footprints,
  Droplets,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Flame,
  Beef,
  Wheat,
  Users,
  Target,
} from "lucide-react";

type Tab = "Home" | "Meals" | "Workouts" | "AI" | "Settings";

const navTabs = [
  { label: "Home" as Tab, icon: Home },
  { label: "Meals" as Tab, icon: UtensilsCrossed },
  { label: "Workouts" as Tab, icon: Dumbbell },
  { label: "AI" as Tab, icon: Brain },
  { label: "Settings" as Tab, icon: Settings },
];

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
        <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-indigo-500/30 via-cyan-400/15 to-emerald-400/14 blur-2xl" />
        <motion.div
          initial={{ rotate: -8, y: 34, opacity: 0 }}
          whileInView={{ rotate: -4, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full rounded-[38px] border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_21px_55px_-22px_rgba(79,70,229,0.28)] p-3"
        >
          {/* Notch with fake status bar (only for full mode) */}
          {!minimalLogoOnly && (
            <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center pt-2">
              <div className="flex flex-row items-center justify-between w-[78%] mx-auto mb-1 select-none text-[11px] text-slate-500 font-semibold">
                <span>9:41</span>
                {/* Fake signal dots */}
                <div className="flex gap-[2px]">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                </div>
                {/* Fake battery icon */}
                <div className="flex items-center gap-1">
                  <span className="h-3 w-5 rounded-[2px] border border-slate-400 flex items-center justify-center">
                    <span className="block h-2 w-3.5 rounded-[1.5px] bg-green-400 ml-0.5"></span>
                  </span>
                  <span className="h-1 w-0.5 rounded bg-slate-400 mr-0.5" />
                </div>
              </div>
              <div className="h-5 w-28 rounded-b-2xl bg-slate-950 mt-1" />
            </div>
          )}
          {/* Minimal logo view for Download section */}
          {minimalLogoOnly ? (
            <div className="flex flex-col h-full w-full items-center justify-center relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[76%] flex justify-between items-center px-4 text-slate-500 text-xs font-semibold z-20 select-none">
                <span className="font-bold tracking-wide">09:41</span>
                {/* Signal bars */}
                <span className="flex space-x-0.5">
                  <span className="inline-block w-0.5 h-2 rounded-sm bg-slate-400 opacity-80" />
                  <span className="inline-block w-0.5 h-2.5 rounded-sm bg-slate-400 opacity-85" />
                  <span className="inline-block w-0.5 h-3 rounded-sm bg-slate-400 opacity-90" />
                  <span className="inline-block w-0.5 h-3.5 rounded-sm bg-slate-400" />
                </span>
                {/* Battery icon */}
                <span className="flex items-center">
                  <span className="w-5 h-3.5 border border-slate-400 rounded-sm flex items-center">
                    <span className="block h-2 w-3 rounded-[1.5px] bg-green-400 ml-0.5"></span>
                  </span>
                  <span className="w-0.5 h-1.5 bg-slate-400 rounded mr-0.5 ml-0.5" />
                </span>
              </div>
              {/* Soft radial glow behind circle */}
              <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 sm:h-56 sm:w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.19),_transparent_80%)] pointer-events-none" />
              <div className="flex items-center justify-center rounded-full border-4 border-blue-500 bg-white h-32 w-32 sm:h-36 sm:w-36 shadow-lg relative z-20">
                <img
                  src="/coreiq-logo.png"
                  alt="CoreIQ logo"
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-contain drop-shadow"
                />
              </div>
            </div>
          ) : (
            // Screen Content
            <div className="relative h-full overflow-hidden rounded-[32px] bg-slate-900">
              {/* Header */}
              <div className="border-b border-slate-800 bg-slate-950 px-5 pb-3 pt-12">
                <div className="flex items-center justify-between">
                  <div>
                    {activeTab === "Home" && (
                      <>
                        <p className="text-sm text-slate-400">Welcome,</p>
                        <p className="text-base font-semibold text-white">
                          User <span className="text-lg">👋</span>
                        </p>
                      </>
                    )}
                    {activeTab !== "Home" && (
                      <p className="text-base font-semibold text-white">
                        {activeTab}
                      </p>
                    )}
                  </div>
                </div>
                {activeTab === "Home" && (
                  <div className="mt-3 flex items-center justify-between">
                    <button className="text-slate-400">
                      <ChevronLeft size={20} />
                    </button>
                    <button className="text-sm font-medium text-slate-200">
                      Monday, Jan 15
                    </button>
                    <button className="text-slate-400">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="h-[calc(100%-140px)] overflow-y-auto bg-slate-900 px-5 pt-6 pb-24">
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
                      {/* Today's Overview */}
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-white">
                          Today&apos;s Overview
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <Apple className="mb-2 h-8 w-8 text-amber-500" />
                            <p className="mb-1 text-xs text-slate-400">
                              Nutritions
                            </p>
                            <p className="text-sm font-semibold text-white">
                              1,240 / 2,200 kcal
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <Heart className="mb-2 h-8 w-8 text-green-500" />
                            <p className="mb-1 text-xs text-slate-400">
                              Mind & Sleep
                            </p>
                            <p className="text-sm font-semibold text-white">
                              7h, Motivated
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <Footprints className="mb-2 h-8 w-8 text-emerald-400" />
                            <p className="mb-1 text-xs text-slate-400">
                              Activity
                            </p>
                            <p className="text-sm font-semibold text-white">
                              8,420 / 10,000 steps
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <Droplets className="mb-2 h-8 w-8 text-blue-400" />
                            <p className="mb-1 text-xs text-slate-400">Water</p>
                            <p className="text-sm font-semibold text-white">
                              1,500 / 2,000 ml
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Physical Stats */}
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-white">
                          Physical Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <div className="mb-2 h-6 w-6 rounded bg-amber-500/20" />
                            <p className="mb-1 text-xs text-slate-400">
                              Weight
                            </p>
                            <p className="text-sm font-semibold text-white">
                              75.5 kg
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <div className="mb-2 h-6 w-6 rounded bg-emerald-500/20" />
                            <p className="mb-1 text-xs text-slate-400">
                              Height
                            </p>
                            <p className="text-sm font-semibold text-white">
                              175 cm
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Goals & Activity */}
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-white">
                          Goals & Activity
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <div className="mb-2 h-6 w-6 rounded bg-orange-500/20" />
                            <p className="mb-1 text-xs text-slate-400">
                              Activity Level
                            </p>
                            <p className="text-sm font-semibold text-white">
                              Moderate
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                            <div className="mb-2 h-6 w-6 rounded bg-green-500/20" />
                            <p className="mb-1 text-xs text-slate-400">
                              Weight Goal
                            </p>
                            <p className="text-sm font-semibold text-white">
                              Lose Weight
                            </p>
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
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search foods..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Macros Summary */}
                      <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                        <p className="mb-3 text-sm font-semibold text-white">
                          Daily Macros
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center">
                            <Flame className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                            <p className="text-xs font-semibold text-white">
                              1,240
                            </p>
                            <p className="text-[10px] text-slate-400">kcal</p>
                          </div>
                          <div className="text-center">
                            <Beef className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                            <p className="text-xs font-semibold text-white">
                              85g
                            </p>
                            <p className="text-[10px] text-slate-400">
                              protein
                            </p>
                          </div>
                          <div className="text-center">
                            <Wheat className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
                            <p className="text-xs font-semibold text-white">
                              145g
                            </p>
                            <p className="text-[10px] text-slate-400">carbs</p>
                          </div>
                          <div className="text-center">
                            <Droplets className="mx-auto mb-1 h-5 w-5 text-pink-400" />
                            <p className="text-xs font-semibold text-white">
                              42g
                            </p>
                            <p className="text-[10px] text-slate-400">fats</p>
                          </div>
                        </div>
                      </div>

                      {/* Meal Sections */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">
                              Breakfast
                            </p>
                            <p className="text-xs text-slate-400">320 kcal</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Oatmeal with berries
                              </p>
                              <p className="text-xs text-slate-400">✓</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">
                              Lunch
                            </p>
                            <p className="text-xs text-slate-400">520 kcal</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Grilled chicken salad
                              </p>
                              <p className="text-xs text-slate-400">✓</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">
                              Dinner
                            </p>
                            <p className="text-xs text-slate-400">400 kcal</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Salmon with vegetables
                              </p>
                              <p className="text-xs text-slate-400">○</p>
                            </div>
                          </div>
                        </div>
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
                      className="space-y-6"
                    >
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search workouts..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Workout Categories */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/20 p-2">
                              <Target className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">
                                Chest
                              </p>
                              <p className="text-xs text-slate-400">
                                3 exercises
                              </p>
                            </div>
                            <p className="text-xs text-slate-400">2/3</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Bench Press
                              </p>
                              <p className="text-xs text-green-400">✓</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">Push-ups</p>
                              <p className="text-xs text-green-400">✓</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Cable Fly
                              </p>
                              <p className="text-xs text-slate-400">○</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-lg bg-green-500/20 p-2">
                              <Target className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">
                                Back
                              </p>
                              <p className="text-xs text-slate-400">
                                2 exercises
                              </p>
                            </div>
                            <p className="text-xs text-slate-400">1/2</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">Pull-ups</p>
                              <p className="text-xs text-green-400">✓</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Barbell Row
                              </p>
                              <p className="text-xs text-slate-400">○</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="rounded-lg bg-red-500/20 p-2">
                              <Target className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">
                                Cardio
                              </p>
                              <p className="text-xs text-slate-400">
                                1 exercise
                              </p>
                            </div>
                            <p className="text-xs text-slate-400">0/1</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                              <p className="text-xs text-slate-300">
                                Running (30 min)
                              </p>
                              <p className="text-xs text-slate-400">○</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 px-0 pb-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20">
                            <Brain className="h-4 w-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 rounded-2xl rounded-tl-none bg-slate-800/60 px-4 py-3">
                            <p className="text-xs text-white">
                              Hi! I&apos;m your AI fitness coach. How can I help
                              you today?
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start justify-end gap-3">
                          <div className="flex-1 rounded-2xl rounded-tr-none bg-indigo-500/20 px-4 py-3">
                            <p className="text-xs text-white">
                              What&apos;s a good workout for chest today?
                            </p>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                            <Users className="h-4 w-4 text-slate-300" />
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20">
                            <Brain className="h-4 w-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 rounded-2xl rounded-tl-none bg-slate-800/60 px-4 py-3">
                            <p className="text-xs text-white">
                              Based on your progress, I recommend: Bench Press
                              (3 sets), Push-ups (3 sets), and Cable Fly (3
                              sets). Focus on progressive overload!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Input Area */}
                      <div className="flex items-center gap-2 border-t border-slate-800 px-5 py-2">
                        <input
                          type="text"
                          placeholder="Ask your AI coach..."
                          className="flex-1 min-w-0 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                        <button className="flex-shrink-0 rounded-xl bg-indigo-500 p-2.5 text-white transition hover:bg-indigo-600">
                          <Send className="h-5 w-5" />
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
                      <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                        <p className="mb-4 text-sm font-semibold text-white">
                          Profile
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-300">Name</p>
                            <p className="text-xs text-white">User</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-300">Email</p>
                            <p className="text-xs text-white">
                              user@example.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                        <p className="mb-4 text-sm font-semibold text-white">
                          Preferences
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-300">Units</p>
                            <p className="text-xs text-white">Metric</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-300">
                              Notifications
                            </p>
                            <p className="text-xs text-white">Enabled</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
                        <p className="mb-4 text-sm font-semibold text-white">
                          About
                        </p>
                        <p className="text-xs text-slate-300">CoreIQ v1.0.0</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Navbar */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950 px-2 pb-2 pt-2">
                <div className="flex items-center justify-around">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.label;
                    return (
                      <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className="flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-slate-900"
                      >
                        <Icon
                          size={20}
                          className={
                            isActive ? "text-indigo-500" : "text-slate-500"
                          }
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            isActive ? "text-indigo-500" : "text-slate-500"
                          }`}
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
