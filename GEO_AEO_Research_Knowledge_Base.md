# GEO / AEO Research Knowledge Base

## Purpose

Build a public, crawlable, highly structured company knowledge layer for SEO, AEO and GEO.

The goal is to make the company's important facts easy for search engines and answer engines to discover, understand, retrieve, verify and cite.

> **Important:** This is not an AI-only or hidden page. The content should be public, useful, factual and accessible to normal users as well as crawlers.

---

# 1. Core Strategy

The `/research/` section should function as a **structured public source of truth** for the company.

It can contain:

- Company information
- Products
- Features
- Pricing
- Use cases
- Industries
- Integrations
- Competitors
- Comparisons
- Alternatives
- Technical information
- Security information
- Results and case studies
- FAQs
- Glossary / terminology
- Sources and evidence

The objective is not to trick Google or LLMs.

The objective is to make the company extremely easy to understand as an entity and to give answer engines strong, factual source material.

---

# 2. Important Technical Principle

Do **not** assume that `.md`, `.txt`, `/research.paper`, or a crawler-only URL has an inherent ranking advantage.

The recommended architecture is:

```text
Markdown / MDX source
        ↓
Website build system
        ↓
Clean semantic HTML
        ↓
Search engines + users + answer engines
```

Markdown is an excellent **authoring format**, but the public research pages should normally be rendered as normal crawlable HTML.

Do not create different essential versions of the content for Google, ChatGPT, Perplexity, Gemini or humans.

---

# 3. Exact `/research/` Architecture

```text
/research/
│
├── company/
│   ├── overview/
│   ├── what-is-[company]/
│   ├── customers/
│   └── industries/
│
├── products/
│   └── [product]/
│
├── features/
│   └── [feature]/
│
├── pricing/
│   ├── plans/
│   └── faq/
│
├── use-cases/
│   └── [use-case]/
│
├── industries/
│   └── [industry]/
│
├── integrations/
│   └── [integration]/
│
├── competitors/
│   └── [competitor]/
│
├── comparisons/
│   └── [company]-vs-[competitor]/
│
├── alternatives/
│   └── alternatives-to-[company]/
│
├── technical/
│   ├── how-it-works/
│   ├── security/
│   ├── data/
│   └── api/
│
├── results/
│   ├── case-studies/
│   ├── statistics/
│   └── customer-results/
│
├── faq/
│
├── glossary/
│   └── [term]/
│
└── sources/
```

This is a framework, not a requirement to create every directory.

**Do not generate hundreds of thin pages.** Start with roughly 10–20 strong pages and expand only when genuine information exists.

---

# 4. Recommended Initial Build

Start with:

```text
/research/
/research/company/overview/
/research/products/[product]/
/research/features/[major-feature]/
/research/pricing/
/research/use-cases/[primary-use-case]/
/research/integrations/[major-integration]/
/research/comparisons/[company]-vs-[competitor]/
/research/alternatives/alternatives-to-[company]/
/research/technical/how-it-works/
/research/technical/security/
/research/faq/
/research/glossary/
```

Only create pages supported by genuine company information and a distinct information need.

---

# 5. `/research/` Homepage Template

```markdown
# [Company] Research & Knowledge Base

[Company] is a [category] company/platform that helps [audience] [primary outcome].

## Key Facts

- Company: [Company]
- Category: [Category]
- Products: [Products]
- Primary users: [Users]
- Main markets: [Markets]
- Pricing: [Pricing]
- Availability: [Availability]

## Company

- [Company overview]
- [What is Company?]
- [Customers / industries]

## Products

- [Product]

## Features

- [Feature]

## Pricing

- [Pricing research]

## Use Cases

- [Use case]

## Industries

- [Industry]

## Integrations

- [Integration]

## Comparisons

- [Company] vs [Competitor]

## Alternatives

- Alternatives to [Company]

## Technical Information

- How [Company] works
- Security
- Data
- API

## Results

- Case studies
- Customer results
- Statistics

## FAQ

[Questions]

## Glossary

[Terms]

Last verified: YYYY-MM-DD
```

---

# 6. Universal Research Page Template

Use this as the default structure, adapting sections to the topic.

```markdown
# [Primary Question or Topic]

## Direct Answer

[2–4 concise factual sentences answering the main question immediately.]

## Key Facts

- Company:
- Product:
- Category:
- Primary users:
- Availability:
- Pricing:
- Supported platforms:

## Overview

[Clear factual explanation.]

## How It Works

1. [Step]
2. [Step]
3. [Step]

## Key Capabilities

- [Capability]
- [Capability]
- [Capability]

## Who Is It For?

[Audience and use cases.]

## Who Is It Not For?

[Honest limitations / unsuitable scenarios.]

## Pricing

[Verified pricing information or link to official pricing.]

## Limitations

[Known limitations.]

## Integrations

- [Integration]

## Related Features

- [Feature]

## Related Use Cases

- [Use case]

## Related Research

- [Research page]

## Official Resources

- [Official page]
- [Official documentation]

## Sources / Evidence

- [Source]

Last Updated: YYYY-MM-DD
Last Verified: YYYY-MM-DD

[Relevant CTA]
```

Not every section must appear on every page. Never add filler just to make a page longer.

---

# 7. Answer-First Content Rules

Important questions should be answered immediately.

Bad structure:

```text
Long marketing introduction
↓
Generic background
↓
Several paragraphs
↓
Actual answer
```

Preferred:

```text
Question
↓
Direct answer
↓
Supporting detail
↓
Evidence
↓
Related information
```

Example:

```markdown
### Does [Company] support WhatsApp?

**Yes. [Company] supports WhatsApp outreach through [specific capability].**
```

Then explain the details.

---

# 8. Citation-Ready Facts

Write important facts as standalone statements that remain understandable if extracted from the page.

Examples:

```text
[Company] supports email, LinkedIn and WhatsApp outreach.

[Company] starts at $X per month.

[Company] integrates with [Tool].

[Company] provides personalised AI video for outbound campaigns.

[Company] is designed primarily for [audience].

[Company] has X customers as of YYYY-MM-DD.
```

Do not use vague claims such as:

```text
We are the world's best solution.
Our revolutionary platform changes everything.
```

unless the claim is genuinely supportable.

---

# 9. Entity Consistency

Maintain consistent terminology for:

- Company
- Products
- Features
- Categories
- Target users
- Integrations
- Competitors
- Industries

Use the official product/entity name consistently.

Descriptive synonyms are acceptable, but do not constantly rename the same entity in a way that creates ambiguity.

---

# 10. Knowledge Graph Model

```text
                         COMPANY
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
       PRODUCTS          PRICING          CUSTOMERS
          │                 │                 │
       FEATURES          PLANS             RESULTS
          │                 │
       USE CASES       COMPARISONS
          │
      INDUSTRIES
          │
    INTEGRATIONS
          │
      TECHNICAL
          │
       SIGNUP
```

The site should make these relationships explicit using:

- internal links
- consistent entity names
- breadcrumbs
- structured data
- related-content sections
- factual statements

---

# 11. Internal Linking Architecture

The research layer must not be isolated.

Use two-way relationships between commercial and research pages.

```text
Commercial page
      ↕
Research page
      ↕
Related research pages
```

Examples:

```text
/research/pricing/
    → /pricing/

/research/features/ai-video/
    → /features/ai-video/

/research/use-cases/saas/
    → /solutions/saas/

/research/comparisons/[company]-vs-[competitor]/
    → /signup/
```

Relevant commercial pages can link back:

```text
/pricing/
    → /research/pricing/

/features/ai-video/
    → /research/features/ai-video/
```

Use descriptive anchor text.

Prefer:

```text
Learn how [Company]'s AI video feature works
```

over:

```text
Click here
```

---

# 12. Exact Entity Model

```text
Organization
    │
    ├── Product
    │     ├── Feature
    │     ├── Integration
    │     └── Use Case
    │
    ├── Pricing / Plans
    ├── Industries
    ├── Customers
    ├── Results
    ├── Comparisons
    └── Glossary Terms
```

Keep entity relationships consistent throughout the site.

---

# 13. Schema Strategy

Use structured data only when it accurately represents visible page content.

Potential mapping:

| Page | Primary / Appropriate Schema |
|---|---|
| `/research/` | Organization, WebSite, WebPage, BreadcrumbList |
| Company | Organization, WebPage, BreadcrumbList |
| Product | SoftwareApplication and/or Product, WebPage, BreadcrumbList |
| Feature | WebPage, BreadcrumbList |
| Pricing | WebPage, BreadcrumbList; Product/Offer only where genuinely applicable |
| FAQ | FAQPage, BreadcrumbList where eligible and accurate |
| Comparison | Article, WebPage, BreadcrumbList |
| Case Study | Article, WebPage, BreadcrumbList |
| Glossary | DefinedTerm / DefinedTermSet, WebPage, BreadcrumbList |
| Technical | TechArticle or Article where appropriate, WebPage, BreadcrumbList |

Structured data does not guarantee rankings, rich results or AI citations.

---

# 14. Organization Schema

Use one consistent organization identity across the site where possible.

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Example Company",
  "url": "https://example.com/"
}
```

Only add information that is accurate and supported.

---

# 15. Software / Product Schema

Where appropriate:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Product]",
  "applicationCategory": "[Category]",
  "operatingSystem": "Web",
  "url": "https://example.com/product/"
}
```

Only include offers, pricing, provider, category or other properties when accurate and applicable.

---

# 16. FAQ / AEO Architecture

Central FAQ:

```text
/research/faq/
```

Possible question clusters:

```text
What is [Company]?
What does [Company] do?
How does [Company] work?
How much does [Company] cost?
Who is [Company] for?
Does [Company] support [feature]?
Does [Company] integrate with [tool]?
What are [Company] alternatives?
[Company] vs [Competitor]
```

Do not create one extremely thin page for every question. Cluster closely related questions into strong topical pages.

---

# 17. GEO / Recommendation Queries

Useful legitimate query themes may include:

```text
best AI outreach platforms
best AI outreach tools for SaaS
AI outreach platform for agencies
best personalised video outreach tools
tools for multichannel B2B outreach
AI outbound platform
[Company] alternatives
[Company] vs [Competitor]
```

Do not manufacture fake "best" claims.

When comparing products, define objective criteria such as:

- channels supported
- automation
- personalisation
- pricing
- integrations
- analytics
- team features
- ideal customer profile
- limitations

---

# 18. Competitor Pages

Example:

```text
/research/competitors/[competitor]/
```

Recommended structure:

```text
H1: [Competitor]

Direct answer

What [Competitor] is
What it does
Primary audience
Major capabilities
Pricing, if publicly verified
Strengths
Limitations
Relevant integrations
How it relates to [Company]
Official source
Last verified
```

Do not fabricate weaknesses, partnerships, prices or customer claims.

---

# 19. Comparison Pages

Example:

```text
/research/comparisons/[company]-vs-[competitor]/
```

Template:

```markdown
# [Company] vs [Competitor]

## Direct Answer

[2–4 factual sentences summarising the key difference.]

## Quick Comparison

| Category | [Company] | [Competitor] |
|---|---|---|
| Primary use | | |
| Channels | | |
| Personalisation | | |
| Automation | | |
| Integrations | | |
| Pricing | | |
| Ideal customer | | |

## [Company] Overview

...

## [Competitor] Overview

...

## Feature Comparison

...

## Pricing Comparison

...

## Best For

### [Company]

...

### [Competitor]

...

## Limitations

...

## Sources

...

Last Verified: YYYY-MM-DD
```

---

# 20. Alternatives Pages

Example:

```text
/research/alternatives/alternatives-to-[company]/
```

Include:

- what [Company] does
- why someone may seek an alternative
- alternative options
- comparison criteria
- strengths and limitations
- pricing where verified
- integrations
- ideal use cases
- sources

The page must genuinely help users evaluate alternatives.

---

# 21. Pricing Page

Recommended URL:

```text
/research/pricing/
```

Template:

```markdown
# [Company] Pricing

## Direct Answer

[Current factual pricing summary.]

## Current Plans

[Plan comparison.]

## Included Features

...

## Usage Limits

...

## Free Trial / Free Plan

...

## Additional Costs

...

## Enterprise / Custom Pricing

...

## Who Each Plan Is For

...

## Pricing FAQ

...

## Official Pricing Source

[URL]

Last Verified: YYYY-MM-DD
```

Pricing changes frequently. Always verify it.

---

# 22. Feature Page

Example:

```text
/research/features/[feature]/
```

Template:

```markdown
# What Is [Feature]?

## Direct Answer

[Company]'s [Feature] is [definition].

## Key Facts

- Company:
- Product:
- Category:
- Primary users:
- Availability:
- Pricing:

## What Is [Feature]?

...

## How Does It Work?

1. ...
2. ...
3. ...

## Key Capabilities

- ...

## Who Is It For?

...

## Who Is It Not For?

...

## Limitations

...

## Related Features

...

## Related Use Cases

...

## Official Resources

...

## Sources

...

Last Verified: YYYY-MM-DD
```

---

# 23. Use Case Page

Example:

```text
/research/use-cases/saas/
```

Include:

- why the audience uses the product
- common workflows
- relevant features
- relevant integrations
- example process
- expected outcomes only where evidence exists
- limitations
- related research
- relevant commercial page

Do not invent customer results.

---

# 24. Industry Pages

Example:

```text
/research/industries/saas/
```

Include:

- industry definition
- common problems
- relevant workflows
- relevant features
- integrations
- limitations
- related use cases

Avoid dozens of near-identical industry pages.

---

# 25. Integration Pages

Example:

```text
/research/integrations/[integration]/
```

Template:

```markdown
# [Company] + [Integration]

## Direct Answer

[Explain what the integration does.]

## What the Integration Does

...

## Supported Data

...

## Supported Workflows

...

## Setup Requirements

...

## Limitations

...

## Pricing Implications

...

## Security Considerations

...

## Official Documentation

...

Last Verified: YYYY-MM-DD
```

Only publish real integrations.

---

# 26. Technical Research

Recommended pages:

```text
/research/technical/how-it-works/
/research/technical/security/
/research/technical/data/
/research/technical/api/
```

Possible topics:

- architecture
- workflows
- APIs
- authentication
- security
- data handling
- integrations
- infrastructure
- supported formats
- technical limitations

Technical pages can answer detailed questions that normal marketing pages do not cover.

---

# 27. Results / Evidence

Recommended:

```text
/research/results/case-studies/
/research/results/statistics/
/research/results/customer-results/
```

For important statistics use:

```text
Metric:
Value:
Source:
Date:
Methodology:
Scope:
```

Never fabricate:

- customer counts
- revenue
- traffic
- conversion rates
- performance improvements
- market share
- rankings

---

# 28. Glossary

Recommended:

```text
/research/glossary/
```

Individual terms:

```text
/research/glossary/ai-outreach/
/research/glossary/personalisation/
/research/glossary/geo/
/research/glossary/aeo/
```

Template:

```markdown
# [Term]

## Definition

[Clear definition.]

## Why It Matters

...

## How It Works

...

## Example

...

## Related Terms

...

## Related [Company] Features

...

## Sources

...
```

Potential schema:

- DefinedTerm
- DefinedTermSet
- WebPage
- BreadcrumbList

Only when correctly implemented.

---

# 29. Sources and Evidence

Preferred sources:

1. Official documentation
2. Official product pages
3. Official pricing pages
4. Official case studies
5. Official announcements
6. Published research
7. Reliable third-party sources
8. Verified datasets

For volatile information:

```text
Last Updated: YYYY-MM-DD
Last Verified: YYYY-MM-DD
```

Do not cite a source that does not actually support the claim.

---

# 30. Content Freshness

Prioritise updates for:

- pricing
- features
- integrations
- API information
- security
- availability
- statistics
- customer numbers
- comparison data

Do not change a date simply to make old content look fresh.

---

# 31. Content Length

These are guidelines only:

| Page type | Useful approximate range |
|---|---:|
| Company | 800–1,500 words |
| Product | 800–2,000 words |
| Feature | 500–1,500 words |
| Pricing | 500–1,200 words |
| Use case | 800–1,500 words |
| Comparison | 1,000–2,500 words |
| FAQ | 500–2,000 words |
| Glossary | 150–500 words |
| Technical | As needed |

**Information density matters more than word count.**

---

# 32. Crawlability Requirements

Every intended research page should ideally be:

- public
- HTTP 200
- indexable
- internally linked
- included in the XML sitemap where appropriate
- canonicalised correctly
- mobile friendly
- rendered as normal HTML
- accessible without requiring JavaScript to reveal core information

Check:

```text
robots.txt
meta robots
canonical
XML sitemap
HTTP status
internal links
rendered HTML
mobile usability
performance
```

---

# 33. AI Crawler Considerations

Inspect the existing `robots.txt` before making changes.

For ChatGPT Search, review the site's policy for `OAI-SearchBot` where applicable.

Do not blindly replace existing robots rules.

Do not build separate artificial pages such as:

```text
/research/chatgpt/
/research/gemini/
/research/perplexity/
```

unless there is a genuine user-facing reason.

Build one strong factual source layer that multiple systems can retrieve.

---

# 34. Metadata

Every page should have appropriate:

```text
Title
Meta description
Canonical URL
H1
Breadcrumbs
Open Graph metadata
Relevant structured data
```

Example:

```text
Title:
[Company] Pricing: Plans, Costs and Features

Meta description:
Understand [Company] pricing, plans, included features, limits and billing options.
```

Avoid keyword stuffing.

---

# 35. Search Intent Mapping

| Page | Primary intent |
|---|---|
| Company overview | Informational |
| Product | Commercial / informational |
| Feature | Informational / commercial |
| Pricing | Commercial |
| Use case | Commercial / informational |
| Integration | Commercial / technical |
| Comparison | Commercial investigation |
| Alternatives | Commercial investigation |
| Technical | Technical / informational |
| FAQ | Informational |
| Glossary | Informational |

Every page should have a genuine primary purpose.

---

# 36. AI Retrieval Optimisation

Make important facts easy to extract.

Use:

- short paragraphs
- descriptive headings
- direct answers
- tables where comparison is genuinely useful
- bullet lists
- explicit definitions
- consistent entity names
- source attribution
- dates
- factual language

Avoid putting critical information only inside:

- images
- videos
- screenshots
- canvas
- interactive sliders
- complex JavaScript components

Important facts should exist as normal text.

---

# 37. Anti-Manipulation Rules

Never use:

- cloaking
- hidden text
- invisible keywords
- crawler-only content
- fake structured data
- deceptive redirects
- fake reviews
- fake statistics
- fabricated customer evidence
- doorway pages
- mass-produced near-duplicate pages
- keyword stuffing
- misleading competitor claims

The same core factual information should be available to normal users and crawlers.

---

# 38. Quality Checklist

Before publishing each page:

```text
[ ] Page genuinely useful
[ ] Primary question obvious
[ ] Direct answer near the top
[ ] Claims accurate
[ ] Important claims supported
[ ] Statistics sourced
[ ] Pricing verified
[ ] Integrations real
[ ] Competitors represented fairly
[ ] Entity naming consistent
[ ] Related pages linked
[ ] Commercial destination relevant
[ ] Page indexable
[ ] Canonical correct
[ ] Sitemap handled correctly
[ ] Structured data accurate
[ ] Important content in HTML
[ ] Mobile friendly
[ ] Last verified date meaningful
[ ] No unnecessary keyword stuffing
[ ] No cloaking / hidden content
```

---

# 39. Measurement Framework

## SEO

Track:

- impressions
- clicks
- CTR
- average position
- indexed pages
- ranking queries
- long-tail queries
- rich-result visibility
- AI Overview visibility where measurable

## AEO / GEO

Track:

- brand mentions in AI answers
- product mentions
- citation frequency
- cited URLs
- questions producing mentions
- competitor mentions
- category visibility
- recommendation inclusion
- AI referral traffic
- AI-originated conversions where measurable

Maintain a recurring test set.

---

# 40. AI Visibility Test Set

Run a consistent set of questions periodically.

```text
What is [Company]?
What does [Company] do?
How does [Company] work?
How much does [Company] cost?
What are the best [category] tools?
What are [Company] alternatives?
[Company] vs [Competitor]
Best [category] for SaaS
Best [category] for agencies
Does [Company] support [feature]?
Does [Company] integrate with [tool]?
Is [Company] good for [audience]?
```

Record:

```text
Date
Platform
Question
Brand mentioned?
URL cited?
Competitors mentioned?
Order / position if visible
Answer accuracy
Notes
```

---

# 41. Research Content Matrix

| Entity | Questions | Evidence | Related entities | Commercial destination |
|---|---|---|---|---|
| Company | What is it? What does it do? | Official company info | Product, category | Homepage |
| Product | What is it? How does it work? | Product docs | Features, use cases | Product page |
| Feature | What does it do? | Product docs | Product, use cases | Feature page |
| Pricing | How much does it cost? | Pricing page | Plans, features | Pricing page |
| Use case | How is it used? | Docs / case studies | Features, industries | Use-case page |
| Integration | Does it integrate? | Official docs | Product, workflow | Integration page |
| Comparison | Which is better for X? | Product sources | Competitor | Product / signup |
| Technical | How does it work? | Technical docs | API, security | Docs |
| FAQ | Common questions | Official sources | All entities | Relevant page |
| Glossary | What does term mean? | Reliable sources | Related concepts | Relevant research |

---

# 42. Full Example Feature Page

```markdown
# What Is [Feature]?

## Direct Answer

[Company]'s [Feature] is [one-sentence factual definition].

## Key Facts

- Company: [Company]
- Product: [Product]
- Category: [Category]
- Primary users: [Users]
- Availability: [Availability]
- Pricing: [Pricing]

## What Is [Feature]?

[Concise factual explanation.]

## How Does [Feature] Work?

1. Step one
2. Step two
3. Step three

## Key Capabilities

- Capability one
- Capability two
- Capability three

## Who Is [Feature] For?

- Audience one
- Audience two

## Who Is It Not For?

- Constraint one
- Constraint two

## Pricing

[Clear factual pricing information.]

## Limitations

[Honest limitations.]

## Integrations

- [Integration]

## Related Features

- [Feature]

## Related Use Cases

- [Use case]

## Related Research

- [Research page]

## Official Resources

- [Official product page]
- [Official documentation]

## Sources

Primary source: [URL]

Last verified: YYYY-MM-DD
```

---

# 43. Full Example Company Overview

```markdown
# What Is [Company]?

## Direct Answer

[Company] is a [category] platform that helps [target users] [primary outcome]. It provides [key capabilities].

## Key Facts

- Founded: [Year]
- Category: [Category]
- Primary users: [Audience]
- Main products: [Products]
- Main markets: [Markets]
- Pricing: [Pricing]
- Availability: [Availability]

## What Does [Company] Do?

[Detailed factual explanation.]

## How Does [Company] Work?

[Workflow.]

## Key Products

- [Product]

## Key Features

- [Feature]

## Who Is [Company] For?

[Audience.]

## Who Is It Not For?

[Honest limitations.]

## Pricing

[Verified information.]

## Alternatives

[Relevant alternatives.]

## Comparisons

[Relevant comparisons.]

## Official Resources

[Links.]

## Sources

[Sources.]

Last Updated: YYYY-MM-DD
```

---

# 44. CMS / Content Model

A CMS or content system can use:

```yaml
title:
description:
slug:
category:
entity:
primary_question:
direct_answer:
key_facts:
content:
related_pages:
related_entities:
sources:
last_updated:
last_verified:
canonical:
indexable:
schema_type:
cta:
```

Example:

```yaml
title: "What Is [Company]?"
description: "[Company] explained: what it does, who it is for, key features, pricing and use cases."
slug: "/research/company/what-is-company/"
category: "company"
entity: "[Company]"
primary_question: "What is [Company]?"
indexable: true
schema_type: "Organization"
```

---

# 45. Editorial Rules

Use:

- British English
- concise sentences
- factual language
- clear headings
- active voice
- explicit definitions
- evidence-backed claims
- consistent terminology

Avoid:

- exaggerated marketing copy
- unnecessary fluff
- keyword stuffing
- fake certainty
- unsupported superlatives
- repetitive introductions
- excessive jargon

Do not use an em dash in copy.

---

# 46. Research Page Lifecycle

```text
Research
   ↓
Verify facts
   ↓
Map search questions
   ↓
Draft direct answer
   ↓
Add supporting evidence
   ↓
Add related entities
   ↓
Add internal links
   ↓
Add schema
   ↓
Technical QA
   ↓
Publish
   ↓
Monitor indexing
   ↓
Test AI visibility
   ↓
Update when facts change
```

---

# 47. Prioritisation

## Priority 1

- company
- main product
- major features
- pricing
- primary use cases

## Priority 2

- integrations
- comparisons
- alternatives
- technical pages
- security

## Priority 3

- glossary
- secondary industries
- secondary use cases
- deeper technical topics

Do not let low-value glossary or long-tail pages consume most of the effort.

---

# 48. What Makes a Page Worth Publishing?

A page should have at least one strong reason to exist:

- unique factual information
- distinct search intent
- meaningful comparison value
- useful technical information
- unique evidence
- important entity relationship
- important customer question
- meaningful commercial relevance

If a page only swaps a keyword, city or industry while keeping almost identical content, do not publish it.

---

# 49. Common Mistakes

## Mistake 1: AI-only content

Do not make the page accessible only to bots.

## Mistake 2: Hundreds of thin pages

Do not mass-produce near-identical pages.

## Mistake 3: Hidden content

Do not use invisible text or crawler-only information.

## Mistake 4: Fabricated data

Do not invent customers, results, statistics or partnerships.

## Mistake 5: Schema manipulation

Do not use structured data that does not accurately represent visible content.

## Mistake 6: Platform-specific obsession

Do not build the entire system around one AI platform.

## Mistake 7: Ignoring the main website

The research layer should strengthen the existing website rather than become an isolated SEO island.

---

# 50. Final Architecture

```text
WEBSITE
│
├── Commercial Layer
│   ├── Product
│   ├── Features
│   ├── Pricing
│   ├── Solutions
│   └── Signup
│
├── Documentation
│
└── Research Knowledge Layer
    │
    ├── Company
    ├── Products
    ├── Features
    ├── Pricing
    ├── Use Cases
    ├── Industries
    ├── Integrations
    ├── Competitors
    ├── Comparisons
    ├── Alternatives
    ├── Technical
    ├── Results
    ├── FAQ
    ├── Glossary
    └── Sources
```

The research layer should connect to the rest of the site rather than replace it.

---

# 51. Success Criteria

## Search

- research pages are indexed
- relevant queries generate impressions
- pages rank for appropriate informational and commercial searches
- internal links strengthen topical relationships

## Answer Engines

- company is mentioned for relevant questions
- product facts are represented accurately
- research pages are cited where appropriate
- comparison/category questions generate relevant mentions

## Users

- answers are easy to find
- pages are readable
- facts are trustworthy
- deeper information is easy to navigate
- relevant commercial actions are easy to access

## Business

- qualified organic traffic increases
- AI-originated traffic becomes measurable
- research pages contribute to discovery and conversion
- entity understanding becomes more consistent

---

# 52. Claude Code Implementation Prompt

Copy this prompt into Claude Code after providing this file:

```text
You are implementing a public SEO/AEO/GEO Research Knowledge Base for our website.

Read the entire GEO_AEO_Research_Knowledge_Base.md specification before making changes.

OBJECTIVE

Build a crawlable /research/ knowledge layer containing accurate, structured, citation-ready information about the company, products, features, pricing, use cases, industries, integrations, competitors, comparisons, alternatives, technical information, results, FAQs and glossary terms.

IMPORTANT

This is NOT a hidden AI-only section.

Do not create crawler-only content, cloaking, hidden text, fake statistics, fake structured data, doorway pages or thin mass-generated pages.

The public output should be normal, accessible HTML.

Markdown/MDX can be used as the authoring source if appropriate.

BEFORE CODING

1. Inspect the existing website architecture.
2. Inspect the framework and routing system.
3. Inspect the CMS/content system.
4. Inspect existing sitemap.xml.
5. Inspect robots.txt.
6. Inspect existing canonical tags.
7. Inspect existing schema/JSON-LD.
8. Inspect existing internal-linking patterns.
9. Inspect current product, feature, pricing and documentation pages.
10. Identify existing information that can be reused.
11. Identify conflicting or duplicate information.

Then present a concise implementation plan before making major structural changes.

IMPLEMENTATION

Create the /research/ section using the architecture in the specification.

Start with the highest-value pages only. Do not manufacture content where the company does not have verified information.

Use clean semantic HTML.

If the site uses Markdown or MDX, render it as crawlable HTML.

Do not create a special .md public URL merely for SEO.

PAGE STRUCTURE

Use the universal research template where appropriate:

- Breadcrumbs
- H1
- Direct Answer
- Key Facts
- Overview
- How It Works
- Key Capabilities
- Who Is It For?
- Who Is It Not For?
- Pricing
- Limitations
- Integrations
- Related Features
- Related Use Cases
- Related Research
- Official Resources
- Sources / Evidence
- Last Updated
- Last Verified
- Relevant CTA

The Direct Answer must answer the primary question in 2–4 concise factual sentences near the top.

INTERNAL LINKING

Build relationships between:

Company
Products
Features
Pricing
Use Cases
Industries
Integrations
Comparisons
Alternatives
Technical pages
Results
FAQ
Glossary

Use descriptive anchor text.

SCHEMA

Implement only accurate structured data supported by visible content.

Potential mappings:

Research hub:
Organization, WebSite, WebPage, BreadcrumbList

Company:
Organization, WebPage, BreadcrumbList

Product:
SoftwareApplication and/or Product, WebPage, BreadcrumbList

FAQ:
FAQPage, BreadcrumbList where eligible and accurate

Comparison:
Article, WebPage, BreadcrumbList

Glossary:
DefinedTerm, DefinedTermSet, WebPage, BreadcrumbList

Technical:
TechArticle or Article where appropriate, WebPage, BreadcrumbList

Use a stable Organization @id across the website where possible.

TECHNICAL SEO

Ensure:

- HTTP 200
- indexable
- correct canonical
- internal links
- XML sitemap handling
- mobile-friendly rendering
- important information present in HTML
- no accidental noindex
- no accidental robots blocking
- no requirement for JavaScript to reveal core information

Review the site's robots.txt before modifying it.

For ChatGPT Search, inspect the site's existing policy for OAI-SearchBot where applicable. Do not blindly overwrite existing robots rules.

CONTENT RULES

Use British English.

Do not use em dashes.

Use concise, factual language.

Never invent:

- customers
- statistics
- pricing
- features
- integrations
- partnerships
- case-study results
- rankings
- market share

If information is unavailable, omit it or clearly mark it as unavailable.

SOURCES

Where important claims are made, include evidence/source information.

For statistics use:

Metric
Value
Source
Date
Methodology
Scope

For volatile facts use:

Last Updated
Last Verified

QUALITY

Do not generate hundreds of thin pages.

Prioritise 10–20 high-quality pages first.

Before completing the implementation:

1. Run the site's build/test process.
2. Check all research routes.
3. Check generated HTML.
4. Check canonical tags.
5. Check sitemap implications.
6. Check robots implications.
7. Check JSON-LD validity.
8. Check internal links.
9. Check duplicate content.
10. Check mobile rendering.
11. Check page performance where practical.
12. Confirm that essential content is accessible without client-side interaction.

FINAL REPORT

Report:

- Files changed
- Components created
- Routes created
- URLs created
- Schema implemented
- Sitemap changes
- Robots changes
- Internal-link changes
- Content created
- Information still needed
- Technical issues
- QA results
- Recommended next steps

Do not claim something was implemented if it was not actually implemented.
```

---

# 53. Recommended First Sprint

Build in this order:

```text
1. /research/
2. /research/company/overview/
3. /research/products/[product]/
4. /research/features/[major-feature]/
5. /research/pricing/
6. /research/use-cases/[primary-use-case]/
7. /research/integrations/[major-integration]/
8. /research/comparisons/[major-competitor]/
9. /research/technical/how-it-works/
10. /research/faq/
```

Then measure indexing, search visibility and AI visibility before expanding.

---

# 54. Final Philosophy

The research layer should be:

```text
Structured company knowledge graph
        +
Factual reference layer
        +
Answer-engine resource
        +
Semantic internal-link hub
        +
Authoritative company information
        =
Strong SEO + AEO + GEO foundation
```

The objective is not to trick search engines or LLMs.

The objective is to make the company's most important facts:

- easy to crawl
- easy to understand
- easy to retrieve
- easy to verify
- easy to cite
- easy for users to navigate

Build the research section as the website's **structured factual knowledge source** for both humans and machines.
