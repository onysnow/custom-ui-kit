import {
  Container,
  FlexCard,
  FlexCardBody,
  FlexCardFooter,
  Grid,
  Section,
} from "@onysnow/ui/layout";

export default function LayoutDemo() {
  return (
    <Section tone="bordered" size="sm">
      <Container width="content">
        <Grid cols={3}>
          {["One", "Two with a longer title that wraps", "Three"].map((title) => (
            <FlexCard key={title} className="border border-border p-4">
              <FlexCardBody>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">Cards in a row share one height.</p>
              </FlexCardBody>
              <FlexCardFooter className="pt-3 text-sm text-primary">Read more</FlexCardFooter>
            </FlexCard>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
