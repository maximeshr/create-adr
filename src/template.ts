type BuildAdrTemplateInput = {
  adrNumber: string;
  title: string;
  date: string;
};

export function buildAdrTemplate({ adrNumber, title, date }: BuildAdrTemplateInput): string {
  return `# ADR-${adrNumber}: ${title}

- Status: proposed
- Date: ${date}

## Context
What problem are we solving? What constraints exist?

## Decision
What do we decide?

## Consequences
### Expected improvements
- Benefit 1
- Benefit 2

### Identified downsides
- Downside 1
- Downside 2

## Alternatives considered
- Option A: reason rejected
- Option B: reason rejected

## Links
- Issue: <link>
- Merge Request: <link>
- Related ADRs: ADR-000X
`;
}
