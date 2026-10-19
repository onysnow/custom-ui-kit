import { useState } from "react";
import {
  BlockSwatch,
  ChartFrame,
  ContestedMark,
  FootStat,
  KeyRow,
  KeySection,
  LineSwatch,
  Segmented,
} from "@onysnow/ui/chart-frame";

export default function ChartFrameDemo() {
  const [view, setView] = useState<"owners" | "money">("owners");
  return (
    <div className="w-full max-w-3xl">
      <ChartFrame
        kind="network"
        title="Who is linked to whom"
        question="Which companies sit behind this contract?"
        rule={{
          label: "Arranged by control:",
          text: "each owner sits above what it owns.",
          why: "Chosen because 6 links are ownership.",
        }}
        tools={
          <Segmented
            label="Arrangement"
            value={view}
            onChange={setView}
            options={[
              { value: "owners", label: "Owners" },
              { value: "money", label: "Money" },
            ]}
          />
        }
        legend={
          <>
            <KeySection title="Parties" channel="colour">
              <KeyRow swatch={<BlockSwatch colour="var(--accent-1)" />}>Company</KeyRow>
              <KeyRow swatch={<BlockSwatch colour="var(--accent-2)" dashed />}>
                Person (unconfirmed)
              </KeyRow>
            </KeySection>
            <KeySection title="Links" channel="line">
              <KeyRow swatch={<LineSwatch colour="var(--text)" arrow />}>Owns</KeyRow>
              <KeyRow swatch={<LineSwatch colour="var(--text-muted)" dash="4 3" />}>Alleged</KeyRow>
              <KeyRow swatch={<ContestedMark />}>Contested</KeyRow>
            </KeySection>
          </>
        }
        footer={
          <>
            <FootStat value={9}>parties</FootStat>
            <FootStat value={12}>links</FootStat>
            <span>2 links left out: no source.</span>
          </>
        }
      >
        <div className="grid h-48 place-items-center text-sm text-muted-foreground">
          [{view} chart goes here]
        </div>
      </ChartFrame>
    </div>
  );
}
