import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
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
    return <main className="admin-outreach-page admin-outreach"><header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Campaign learning</p><h1>Close the loop.</h1><p className="admin-muted">The learning ledger is unavailable.</p></div><Button variant="outline" asChild><Link href="/admin/outreach">Back to outreach</Link></Button></header><Alert><AlertTitle>Cannot load campaign history</AlertTitle><AlertDescription>The reporting database or campaign-learning migration is unavailable. No Zoho state has been read or changed.</AlertDescription></Alert></main>;
  }
}
