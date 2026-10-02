import { CampaignLearningManager, type CampaignLearningInitialData } from "@/components/admin/campaign-learning-manager";
import { listCampaignLearning } from "@/lib/campaign-learning-store";

export const dynamic = "force-dynamic";

export default async function CampaignLearningPage() {
  try {
    const data = await listCampaignLearning();
    const initialData: CampaignLearningInitialData = {
      campaigns: data.campaigns.map((campaign) => ({
        ...campaign,
        responseCheckDueAt: campaign.responseCheckDueAt.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
        observations: campaign.observations.map((observation) => ({ ...observation, observedAt: observation.observedAt.toISOString() })),
      })),
      actions: data.actions.map((action) => ({
        ...action,
        createdAt: action.createdAt.toISOString(),
        measurementWindowStartAt: action.measurementWindowStartAt?.toISOString() ?? null,
        measurementWindowEndAt: action.measurementWindowEndAt?.toISOString() ?? null,
        measurementCheckpointAt: action.measurementCheckpointAt?.toISOString() ?? null,
        history: action.history.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
      })),
      comparableCohorts: data.comparableCohorts,
      completeness: data.completeness,
    };
    return <CampaignLearningManager initialData={initialData} />;
  } catch {
    return <main className="admin-outreach"><header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Campaign learning</p><h1>Close the loop.</h1><p className="admin-muted">The learning ledger is unavailable.</p></div><a className="admin-secondary" href="/admin/outreach">Back to outreach</a></header><section className="admin-outreach-card"><h2>Cannot load campaign history</h2><p className="admin-muted">The reporting database or campaign-learning migration is unavailable. No Zoho state has been read or changed.</p></section></main>;
  }
}
