import { getOrCreateCreator, getClickCounts, getLeads } from "./data";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export default async function DashboardPage() {
  const { creator, links } = await getOrCreateCreator();
  const clickCounts = await getClickCounts(creator.id);
  const totalClicks = Object.values(clickCounts).reduce((a, b) => a + b, 0);
  const leads = await getLeads(creator.id);

  return (
    <DashboardTabs
      creator={creator}
      links={links}
      clickCounts={clickCounts}
      totalClicks={totalClicks}
      leads={leads}
    />
  );
}
