# Graph Report - trialmatch-ai  (2026-05-14)

## Corpus Check
- 26 files · ~11,176 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 72 nodes · 51 edges · 3 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `handleIntakeSubmit()` - 3 edges
2. `Badge()` - 2 edges
3. `cn()` - 2 edges
4. `handleDemoInstant()` - 2 edges
5. `analyzeIndividualTrial()` - 2 edges
6. `searchTrials()` - 2 edges
7. `analyzeTrial()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleIntakeSubmit()` --calls--> `searchTrials()`  [INFERRED]
  src\App.tsx → src\lib\api.ts
- `Badge()` --calls--> `cn()`  [INFERRED]
  components\ui\badge.tsx → lib\utils.ts
- `analyzeIndividualTrial()` --calls--> `analyzeTrial()`  [INFERRED]
  src\App.tsx → src\lib\api.ts

## Communities

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (2): handleDemoInstant(), handleIntakeSubmit()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (3): analyzeTrial(), searchTrials(), analyzeIndividualTrial()

### Community 4 - "Community 4"
Cohesion: 0.5
Nodes (2): Badge(), cn()

## Knowledge Gaps
- **Thin community `Community 1`** (10 nodes): `handleDemo()`, `handleDemoInstant()`, `handleIntakeSubmit()`, `handleTrialClick()`, `showFooterInfo()`, `showToast()`, `startIntake()`, `toggleSaveTrial()`, `App.tsx`, `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (4 nodes): `Badge()`, `badge.tsx`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handleIntakeSubmit()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `analyzeIndividualTrial()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `searchTrials()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._