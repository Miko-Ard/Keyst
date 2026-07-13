import { Dashboard } from "@/components/dashboard";
import { getSessions, syncAchievements } from "@/lib/data";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  let sessions = [] as Awaited<ReturnType<typeof getSessions>>;
  let achievements: Awaited<ReturnType<typeof syncAchievements>> = [];

  try {
    sessions = await getSessions();
    achievements = await syncAchievements(sessions);
  } catch {
    // Database not yet migrated/seeded — render an empty, still-beautiful state.
  }

  const stats = computeStats(sessions);

  return <Dashboard initial={{ sessions, achievements, stats }} />;
}
