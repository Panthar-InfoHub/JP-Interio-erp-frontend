"use client";

import { RANKING_LABELS, TopAsmsChart } from "@/components/dashboard/TopAsmsChart";
import { TopPartnersList } from "@/components/dashboard/TopPartnersList";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AsmRanking, Leaderboards } from "@/types/dashboard";

const RANKINGS: AsmRanking[] = ["points", "scans", "newPartners"];

/** Top 5 ASMs (bar chart, with a ranking switch) and top 5 partners. */
export function LeaderboardsSection({
  boards,
  rankAsmsBy,
  onRankChange,
}: {
  boards: Leaderboards;
  rankAsmsBy: AsmRanking;
  onRankChange: (ranking: AsmRanking) => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2" aria-label="Top performers">
      <Card>
        <CardHeader>
          <CardTitle>Top ASMs</CardTitle>
          <CardAction>
            <Select
              value={rankAsmsBy}
              items={RANKING_LABELS}
              onValueChange={(value) => value && onRankChange(value as AsmRanking)}
            >
              <SelectTrigger className="w-40" aria-label="Rank ASMs by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANKINGS.map((ranking) => (
                  <SelectItem key={ranking} value={ranking}>
                    {RANKING_LABELS[ranking]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TopAsmsChart items={boards.topAsms.items} rankedBy={boards.topAsms.rankedBy} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top partners by points</CardTitle>
        </CardHeader>
        <CardContent>
          <TopPartnersList items={boards.topPartners} />
        </CardContent>
      </Card>
    </section>
  );
}
