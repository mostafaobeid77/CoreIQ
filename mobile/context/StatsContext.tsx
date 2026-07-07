import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DashboardStats, defaultStats } from "../components/dashboard/dashboardUtils";
import { statsService } from "../services/statsService";
import { userService } from "../services/userService";
import { useAuth } from "./AuthContext";

type LoadingState = Record<string, boolean>;

interface StatsContextType {
  statsByDate: { [date: string]: DashboardStats };
  loadStatsForDate: (dateKey: string, force?: boolean) => Promise<void>;
  updateStatsForDate: (dateKey: string, updates: Partial<DashboardStats>) => Promise<void>;
  loadingDates: LoadingState;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statsByDate, setStatsByDate] = useState<Record<string, DashboardStats>>({});
  const [loadingDates, setLoadingDates] = useState<LoadingState>({});
  const loadedDatesRef = useRef<Record<string, boolean>>({});
  const loadingDatesRef = useRef<Record<string, boolean>>({});
  const { user, setUser } = useAuth();

  const calculateAge = useCallback((birthDate?: string) => {
    if (!birthDate) return defaultStats.age;
    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return defaultStats.age;
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.max(0, ageDate.getUTCFullYear() - 1970);
  }, []);

  const baseDemographics = useMemo(
    () => ({
      age: calculateAge(user?.birthDate),
      sex: (user?.gender === "female" ? "female" : "male") as "male" | "female",
    }),
    [calculateAge, user?.birthDate, user?.gender]
  );

  const mergeStats = useCallback(
    (incoming?: Partial<DashboardStats>): DashboardStats => ({
      ...defaultStats,
      ...baseDemographics,
      ...incoming,
      age: incoming?.age ?? baseDemographics.age,
      sex: incoming?.sex ?? baseDemographics.sex,
    }),
    [baseDemographics]
  );

  const resetStats = useCallback(() => {
    setStatsByDate({});
    setLoadingDates({});
    loadedDatesRef.current = {};
    loadingDatesRef.current = {};
  }, []);

  useEffect(() => {
    resetStats();
  }, [resetStats, user?.id]);

  const mapResponseToStats = useCallback((stats?: any): Partial<DashboardStats> | undefined => {
    if (!stats) return undefined;
    return {
      water: stats.water ?? defaultStats.water,
      sleep: stats.sleep ?? defaultStats.sleep,
      mental: stats.mental ?? defaultStats.mental,
      walking: stats.walking ?? defaultStats.walking,
      weight: stats.weight ?? defaultStats.weight,
      height: stats.height ?? defaultStats.height,
      activityLevel: stats.activityLevel ?? defaultStats.activityLevel,
      goalWeight: stats.goalWeight ?? defaultStats.goalWeight,
      workoutsCompleted: stats.workoutsCompleted ?? defaultStats.workoutsCompleted,
      workoutsTotal: stats.workoutsTotal ?? defaultStats.workoutsTotal,
      targetCalories: stats.targetCalories ?? defaultStats.targetCalories,
      targetProtein: stats.targetProtein ?? defaultStats.targetProtein,
      targetCarbs: stats.targetCarbs ?? defaultStats.targetCarbs,
      targetFats: stats.targetFats ?? defaultStats.targetFats,
    };
  }, []);

  const loadStatsForDate = useCallback(
    async (dateKey: string, force: boolean = false) => {
      if (
        !user ||
        (!force && loadedDatesRef.current[dateKey]) ||
        loadingDatesRef.current[dateKey]
      ) {
        return;
      }

      // Clear cache if force reload
      if (force) {
        delete loadedDatesRef.current[dateKey];
      }

      setLoadingDates((prev) => ({ ...prev, [dateKey]: true }));
      loadingDatesRef.current[dateKey] = true;
      try {
        const stats = await statsService.getStats(dateKey);
        setStatsByDate((prev) => ({
          ...prev,
          [dateKey]: mergeStats(mapResponseToStats(stats)),
        }));
        loadedDatesRef.current[dateKey] = true;
      } catch (error) {
        console.error("Failed to load stats:", (error as Error)?.message);
      } finally {
        setLoadingDates((prev) => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
        delete loadingDatesRef.current[dateKey];
      }
    },
    [mapResponseToStats, mergeStats, user]
  );

  const persistableKeys: (keyof DashboardStats)[] = [
    "water",
    "sleep",
    "mental",
    "walking",
    "weight",
    "height",
    "activityLevel",
    "goalWeight",
    "workoutsCompleted",
    "workoutsTotal",
  ];

  const updateStatsForDate = useCallback(
    async (dateKey: string, updates: Partial<DashboardStats>) => {
      if (!user) return;

      setStatsByDate((prev) => {
        const current = prev[dateKey] || mergeStats();
        return {
          ...prev,
          [dateKey]: mergeStats({
            ...current,
            ...updates,
          }),
        };
      });

      const payload = persistableKeys.reduce<Record<string, any>>((acc, key) => {
        if (updates[key] !== undefined) {
          acc[key] = updates[key];
        }
        return acc;
      }, {});

      if (Object.keys(payload).length === 0) {
        return;
      }

      try {
        const response = await statsService.patchStats(dateKey, payload);
        const serverStats = (response as any)?.stats ?? response;

        setStatsByDate((prev) => {
          const current = prev[dateKey] || mergeStats();
          return {
            ...prev,
            [dateKey]: mergeStats({
              ...current,
              ...mapResponseToStats(serverStats),
              ...updates,
            }),
          };
        });
        loadedDatesRef.current[dateKey] = true;

        // Always refetch from the server after a save so the dashboard UI
        // reflects the latest persisted values for water, steps, sleep, and goals.
        await loadStatsForDate(dateKey, true);

        // If weight, height, activityLevel, or goalWeight changed, update User model
        const userStatsChanged =
          updates.weight !== undefined ||
          updates.height !== undefined ||
          updates.activityLevel !== undefined ||
          updates.goalWeight !== undefined;

        if (userStatsChanged) {
          console.log('📤 Updating user profile with physical stats for target calculation...');
          const userPayload: any = {};
          if (updates.weight !== undefined) userPayload.weight = updates.weight;
          if (updates.height !== undefined) userPayload.height = updates.height;
          if (updates.activityLevel !== undefined) userPayload.activityLevel = updates.activityLevel;
          if (updates.goalWeight !== undefined) userPayload.goalWeight = updates.goalWeight;

          const result = await userService.updateUserStats(userPayload);
          console.log('✅ User targets calculated:', {
            targetCalories: result.user.targetCalories,
            targetProtein: result.user.targetProtein,
            targetCarbs: result.user.targetCarbs,
            targetFats: result.user.targetFats,
          });

          // Push the new targets into global user state so the UI reflects them
          setUser((prevUser) => (prevUser ? { ...prevUser, ...result.user } : prevUser));

          // Also stamp the new targets onto this date's local stats so any
          // screen reading stats.targetCalories/targetProtein/etc updates immediately
          setStatsByDate((prev) => {
            const current = prev[dateKey] || mergeStats();
            return {
              ...prev,
              [dateKey]: mergeStats({
                ...current,
                targetCalories: result.user.targetCalories,
                targetProtein: result.user.targetProtein,
                targetCarbs: result.user.targetCarbs,
                targetFats: result.user.targetFats,
              }),
            };
          });
        }
      } catch (error) {
        console.error("Failed to update stats:", (error as Error)?.message);
      }
    },
    [mergeStats, user, setUser]
  );

  const value = useMemo(
    () => ({
      statsByDate,
      loadStatsForDate,
      updateStatsForDate,
      loadingDates,
      resetStats,
    }),
    [statsByDate, loadStatsForDate, updateStatsForDate, loadingDates, resetStats]
  );

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}