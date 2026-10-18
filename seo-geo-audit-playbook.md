# Website SEO \+ GEO Audit Playbook

This is the full methodology used to audit beesoul.co, written up so it can be run again on any other website or project. It covers the thinking, the tools, the order of operations, the standing rules, and a copy-paste prompt at the bottom that starts the whole process on a new site. Nothing here is specific to Beesoul except the examples used to illustrate each step.

No em dashes are used anywhere in this document.

## What this playbook produces


A full run of this playbook produces four deliverables:

1. A strategy document (Word doc): the CMO-level diagnosis, the strategic tension, the keyword tiers, the phased roadmap. This is the "why" document.  
2. A page-level audit spreadsheet: every page in scope, its current performance, its issue, its recommended bucket, and a status tracker. This is the "what, for every page" document.  
3. One or more extensive content plan documents: full, ready-to-publish content briefs for the highest-priority pages, batched into files of roughly 20 pages each so no single file becomes unwieldy. This is the "here is the actual copy" document.  
4. A standalone backlink playbook: kept separate because it is usually executed later, after the content work is live. This is the "how to earn links" document.

Each is described in full below, in the order they get built.

## Phase 0: Establish business context before touching any data

Before pulling a single number, get clear, in writing if possible, on: what the business sells, who the ideal customer actually is (not who they wish it was), what action a visitor should take, and what has changed recently (a pivot, a new offering, a rebrand). This context is what turns a generic SEO audit into a CMO-level one, because it is what lets you say "this page ranks well but for the wrong audience" instead of just reporting the ranking.

If a brand brief already exists for the project, read it first. If not, this is worth capturing explicitly before starting, since every downstream decision (which pages to prune, which keywords are worth chasing even at zero measured search volume, which case studies are trustworthy) depends on knowing the ICP cold.

## Phase 1: Pull every available data source before forming any opinion

Do not start writing recommendations from assumption or from general SEO knowledge. Pull the real data first, for this specific site, every time.

**Google Search Console**, if connected: select the right property, then pull performance grouped by page for the longest window available (note that a free-tier connection may cap this at 30 days and 100 rows, which is a real limitation worth disclosing in the final document, not silently working around). Sort by impressions to find the highest-visibility pages, but also check clicks and average position separately, since a page with high impressions and near-zero clicks is a different problem (a CTR or title tag problem) than a page with low impressions (a visibility problem). Use URL inspection on a sample of pages to confirm what Google actually sees, especially if there is any reason to suspect a crawler-blocking issue (see Phase 2).

**DataForSEO or an equivalent keyword/competitive data tool**: pull a domain rank overview, a full list of currently ranked keywords, a backlinks summary, and, for each priority page, related keyword and search intent data. If the site sits in a genuinely new category (a new product category, a new tool space, terminology that predates measurable search volume), expect near-zero measurable volume on the category's own core terms. Do not force a volume-driven strategy onto a market that does not have volume yet. This is a real, correct finding, not a tool failure, and it changes the strategy: content aimed at that category should be optimized for being found and cited by AI answer engines (see the GEO section below) rather than for classic keyword volume, since the volume simply is not there to chase yet.

**Competitor analysis**: identify the 3 to 5 real organic competitors for the site's core commercial terms, not assumed competitors. Use a domain intersection or competitors-by-domain style query to find who actually ranks alongside the site for its target keywords, not who the client believes their competitors are. For each real competitor found, pull their ranked keywords and compare against the site's own list to find genuine content gaps (terms they rank for that the site does not, especially where search intent is commercial or informational and directly relevant to the ICP). Pull their backlink profile summary as well, both to gauge how large a gap exists in domain authority and to mine their referring domains for realistic link targets (a directory or publication that links to three competitors and not to this site is a strong, specific outreach lead, stronger than a cold guess). Do not recommend competing head-on for a term a much larger, better-established competitor dominates if a smaller, more specific, less contested angle exists instead; this is a judgment call worth making explicitly and disclosing, not a default.

**Live-fetch every page before writing anything about it.** This is the single most important rule in this whole playbook and the one most likely to be skipped under time pressure. Search Console and keyword tools tell you how a page is performing. They do not tell you what is actually on the page right now. Every specific claim made about a page's current content (its title tag, whether a stat is stale, whether a case study is real, whether the FAQ actually answers its own questions) must come from reading the live page, not from an assumption based on the page's name or its past performance. This is how the mismatched-content bug, the fabricated-looking case studies, the broken placeholder FAQ, and the stray AI-image-prompt-as-caption bug were all found on Beesoul's site: by actually reading pages that looked fine from the outside, in the data.

## Phase 2: Diagnose, using a standing checklist of what tends to be broken

Across every page fetched, actively check for the following, since these are the categories of bug that showed up repeatedly and are worth checking on any site, not just the one that happened to have them:

- **Inconsistent stats across pages.** The same claim (a client count, a project count, a dollar figure) stated differently on different pages is one of the most common and most damaging bugs, since it directly undermines trust the moment a reader compares two pages. Grep or manually scan for the same category of number across every priority page and flag every inconsistency found, standardizing on whichever number is most current and most defensible.  
- **Broken or unresolved template variables.** Title tags or meta descriptions showing a literal unresolved placeholder (an SEO plugin's `%sitename%` token, a CMS merge field, an AI image prompt sitting where alt text should be) rather than the resolved value. These are easy to miss by skimming rendered pages casually but show up immediately in a raw fetch of the page source or in a browser tab title.  
- **Content that does not belong on the page it is on.** A block of copy describing a different product, a different client, or a different offering, pasted into the middle of otherwise-correct content. This is a serious finding, not a minor one, since it means real readers are currently seeing incorrect information about what they are looking at. Flag as urgent and describe exactly what needs to be removed and what needs to replace it, using only facts already verified elsewhere on the site.  
- **Generic or shared template content that does not actually answer anything.** A repeated FAQ block, present identically across many pages, whose answers do not address their own questions, is a common symptom of a template being copied without being filled in properly. Fix once at the template level rather than page by page once found.  
- **Unverifiable specific claims, especially named clients, executives, or quoted figures.** If a page contains a detailed, specific claim (a named person, a named company, a funding figure, a press citation) that does not appear anywhere else on the site's verified case study or press material, do not treat it as true and do not build content around it. Flag it explicitly as needing the client's own verification before anything further happens to that page. Never invent a replacement claim and never quietly delete a claim that might be real without asking; the client may have the missing context.  
- **Bot or crawler access issues.** If an on-page crawl tool gets redirected to a CAPTCHA or bot-challenge page instead of real content, check separately whether this affects real search engine crawlers (Google Search Console's URL inspection is authoritative for Google specifically) versus other automated crawlers (AI answer engine crawlers, third-party SEO tools). A site can be fully indexed by Google while still being invisible to the crawlers that power AI answer engines, which matters enormously for a GEO-focused strategy and is worth testing for specifically, not assuming either way.  
- **Canonical tags used where a real redirect is needed.** A canonical tag alone does not consolidate two URLs in Search Console reporting the way a 301 redirect does. If two URLs appear to describe the same content, check which mechanism is actually in place and flag the gap if a real redirect is missing.  
- **Author or byline URL inconsistencies.** The same author appearing with two different author-page URLs across different posts is a small thing individually but compounds into a trust and site-structure signal problem at scale, and is easy to catch once you are reading pages live rather than assuming templates are applied consistently.

Every finding from this phase goes into a "site-wide bugs" section at the top of whichever document it most affects, written in plain language, with the exact fix specified, before any page-by-page content work begins. Bugs that affect trust or accuracy (the mismatched content, the unverifiable case studies) get flagged as urgent and separated from the ordinary content-quality findings.

## Phase 3: Bucket every page using one consistent framework

Every page in scope gets sorted into exactly one of four buckets. This framework is what turns a long list of pages into a prioritized plan instead of a flat todo list.

- **Protect and expand**: strong current performance, strong ICP fit. Do not risk what is working; invest further (schema, freshness updates, expanded FAQ coverage) rather than rewriting from scratch.  
- **Keep and reposition**: decent performance or ranking equity, but currently aimed at the wrong angle, wrong audience, or overlapping confusingly with another page. Rewrite the framing and the internal links pointing to it, not necessarily the underlying facts.  
- **Consolidate**: two or more pages competing for the same intent, splitting ranking signal and internal link equity. Merge into one stronger page and 301 redirect the weaker URL into the survivor.  
- **Prune** (meaning: stop investing, not necessarily delete): off-ICP, low relevance to the current business, or fundamentally undifferentiated content that would not become excellent even with a rewrite. Do not write new content for a page in this bucket; doing so wastes effort against your own recommendation. State the reasoning specifically for each page (not just "low traffic") so the client can override any individual call they disagree with.

A useful additional check when sorting: pages already performing genuinely well, once actually read live, should not be rewritten just because they are high-priority by traffic. Classify explicitly as "already strong, light touch only" and say so, rather than producing a full rewrite nobody asked for and that risks breaking something that already works. Proportionate effort, clearly explained, beats uniform effort applied everywhere.

## Phase 4: Build the strategy document

Structure: Executive Summary, Current State Diagnosis (including an explicit methodology and limitations caveat, for example clarifying that "most-viewed" is derived from whatever traffic data source was actually available, not from a source that was not connected), Critical Technical Findings (the Phase 2 bugs), the Core Strategic Tension the business actually faces (for example: the target keywords have no measurable search volume yet because the category is new, so classic SEO and GEO/AI-citation strategy have to be pursued together rather than sequentially), Keyword and Content Strategy broken into tiers by intent and confidence of the data, Priority Pages, a Phased Roadmap, Success Metrics, and a closing Methodology and Limitations section that states plainly what data was and was not available and how that shaped the recommendations.

## Phase 5: Build the page-level audit spreadsheet

One row per page in scope. Columns: rank/priority order, URL, page type and ICP fit, the performance metrics pulled in Phase 1 (impressions, clicks, average position, whatever window was available), the specific issue found, the recommended action, the bucket from Phase 3, a priority level, and a Status column for tracking execution over time. Use conditional formatting on the Status column (for example, a consistent color per status category: green for "already strong," blue for "rewrite planned," amber for "decision needed," red for "urgent fix," grey for "prune, no further investment") so the sheet is scannable at a glance without reading every cell. Include a legend. Every status entry should be specific enough to act on later without re-reading the original audit ("full rewrite planned, merge with row 19" rather than just "in progress").

## Phase 6: Build the extensive content plans

This is where the actual page copy gets written, but only for pages that genuinely warrant it. Batch into files of roughly 15 to 20 full page briefs each if the page count is large, rather than one enormous file, and open each batch file with any new site-wide bugs discovered while researching that batch specifically.

For every page that gets a full brief:

- Confirm its bucket and whether it needs a full rewrite, a light touch, or a merge, based on what was actually found on the live page, not assumed from its metrics alone.  
- Real, current keyword targets pulled from the actual keyword tool data for that specific page, not invented. If the topic genuinely has no measurable volume yet (a new category), say so plainly and target the terms directionally with an explicit note that this is a GEO bet, not a volume-backed keyword.  
- Title tag and meta description, character-counted to standard limits.  
- An H1.  
- For pages getting full content, open with a direct, extractable "quick answer" style opening paragraph before any narrative content. This is the single highest-leverage formatting choice for being cited by AI answer engines: they extract direct answers, not scene-setting introductions. Structure the rest of the page with clear, descriptive subheadings, since both human skimmers and AI extraction favor scannable structure over long unbroken prose.  
- A frequently-asked-questions section written to directly and completely answer its own question in the first sentence, structured so it could sit inside FAQPage schema markup. This is both a GEO tactic and a genuine reader service; it was the exact category of bug (FAQs that do not answer their own questions) found and flagged repeatedly during diagnosis, so getting this right in every rewrite matters.  
- Internal linking specified in both directions: which existing pages this new or revised page should link out to, and which existing pages should be updated to link into it. Check for and explicitly resolve any cannibalization risk between two pages targeting adjacent intent (for example, a commercial service page and an educational guide covering an overlapping topic) by differentiating their angle and cross-linking deliberately rather than letting them compete silently.  
- An image prompt wherever a new or replacement image is needed, written with a specific style, color palette, and aspect ratio, and an explicit instruction that the image should not contain visible text, since AI-generated images render text unreliably and a text-in-image bug was found in this exact research process.  
- A slug recommendation where the current URL is genuinely suboptimal, clearly marked as a recommendation only, not applied, since changing a live, indexed URL is a decision with real ranking risk that the client needs to make deliberately, not something to change silently as part of a content pass.

For pages in the prune bucket, do not write a full brief. Write a short, specific decision entry instead: the page, its real performance numbers, the reason it is not worth further investment, and an explicit invitation for the client to override the call if they have context that changes the picture (an existing relationship, a secondary revenue line, personal conviction). This respects both the client's time and their authority over their own business.

Close each batch file with a short summary of what remains undecided or deferred, so nothing silently falls off the list.

## Phase 7: Build the backlink strategy as a separate document, to run later

Keep this genuinely separate from the content plans, since it is normally executed after the content work is live and has something worth linking to.

Start with the same discipline as everywhere else: pull the real current backlink data (total backlinks, referring domains, domain rank, spam score, TLD and platform and country breakdowns) before recommending anything. If the referring domain data shows a large, specific cluster from a single unusual TLD or a generically-registered domain pattern, flag this explicitly as worth a manual spam/quality audit and a possible disavow filing before starting any new outreach, rather than building new links on top of an unreviewed existing risk.

Prioritize link-building tactics by genuine relevance to the site's actual ecosystem, not by generic "best practices" ranked the same way for every client. The single most relevant, most commonly overlooked opportunity is usually the tool or platform ecosystem the business's own product or service is built around (a plugin marketplace, a developer tool community, an industry-specific directory) since these produce both highly relevant links and direct qualified referral traffic, and a backlink audit frequently reveals this exact category is completely untapped. From there, look at whether the business already owns any genuinely citable first-party data (a proprietary statistic, a survey, an audit finding across many customers) since specific, sourced data is what press and newsletter writers actually link to, far more reliably than generic guest post pitches. Round out the plan with founder visibility (podcasts, interviews, since these tend to produce higher-authority links than solicited placements), traditional guest posting and resource-page outreach, and directory or review-platform presence as the lowest-priority, highest-volume tier.

Always include an explicit "what not to do" section: no purchased links, no automated link networks, no generic off-topic guest posting pursued in volume, and no outreach pointed at pages that were not actually rebuilt to earn a link (point outreach at the pages produced in Phase 6, not at legacy or prune-bucket pages).

End with a simple tracking structure and a suggested cadence, but do not assign real calendar dates unless the client has confirmed they are starting this phase now.

## Standing rules that apply across every phase

- No em dashes, anywhere, including inside ready-to-publish copy.  
- Every piece of copy delivered should be immediately copy-paste ready with no markdown artifacts or formatting the client would need to clean up before publishing.  
- Never fabricate a statistic, a client name, a quote, or a case study detail. If a number is needed and not verified, say so explicitly rather than inventing a plausible one.  
- Never silently do less than what was asked. If a page turns out to already be excellent and does not need the full treatment requested, say so explicitly and explain why, rather than quietly producing a thin brief.  
- Never silently make a judgment call that deviates from the literal request. If deviating (for example, re-prioritizing which pages get full briefs based on ICP fit rather than raw traffic), state the deviation and the reasoning plainly, so the client can overrule it.  
- Never change a live slug, redirect, or published page as part of a planning exercise. Recommendations only, clearly marked as not applied, unless the client has explicitly asked for execution rather than planning.  
- Always verify a page's actual current content live before making any claim about it, every time, even for a page that was fetched recently for a different purpose, since content can change between sessions.  
- Flag every trust-relevant bug (fabricated-looking claims, mismatched content, inconsistent stats) as its own clearly marked, urgent item, separated from ordinary SEO recommendations, since these carry business and legal risk beyond lost rankings.  
- Before delivering any file, double check it actually reflects the latest edits (do not copy a stale draft to the final delivery location) and grep for the em dash rule as a final check.

## The injectable prompt

Copy the block below into a new conversation for a new project, filling in the bracketed sections, to start the same process from scratch.

You are acting as CMO for \[BUSINESS NAME\], running a full SEO and GEO audit and content plan for \[DOMAIN\]. This is a planning session; do not implement or publish anything without explicit approval.

Business context: \[what the business sells, who the ICP is, what action a visitor should take, anything that recently changed like a pivot or rebrand\]

Do the following, in order:

1\. Pull all available Google Search Console data for this property: performance by page for the longest available window, sorted by impressions and separately by clicks, plus a URL inspection sample. Note any data source limitations explicitly.

2\. Pull DataForSEO (or equivalent) data: domain rank overview, full ranked keyword list, backlinks summary, and keyword/intent data for the highest-priority pages. If core category terms show near-zero measured volume, say so plainly rather than forcing a volume-driven strategy.

3\. Identify 3 to 5 real organic competitors using domain intersection or competitor discovery data, not assumed competitors. Pull their ranked keywords and backlink profiles and find genuine content and link gaps.

4\. Identify the top 50 (or however many I specify) most-viewed pages and live-fetch every one of them before making any claim about their content. Do not rely on the page name or past performance data alone.

5\. While fetching, actively check for: inconsistent stats across pages, unresolved template placeholders, content blocks that do not belong on the page they are on, broken or generic shared template content, unverifiable specific claims (named clients, executives, figures), crawler or bot access issues, canonical-vs-redirect gaps, and author or byline inconsistencies. Flag every one found, in plain language, with the exact fix, before any content work begins. Separate urgent trust-relevant bugs from ordinary content-quality ones.

6\. Bucket every page into exactly one of: Protect and expand, Keep and reposition, Consolidate, or Prune, with specific reasoning per page.

7\. Build a strategy document (Word doc) covering the diagnosis, the technical findings, the core strategic tension, tiered keyword and content strategy, priority pages, a phased roadmap, success metrics, and a methodology and limitations section.

8\. Build a page-level audit spreadsheet, one row per page in scope, with a color-coded Status column and a legend.

9\. Build extensive content plan document(s) with full, ready-to-publish briefs (real keyword targets, title tag, meta description, H1, a direct-answer opening for GEO, FAQ-schema-ready questions, internal linking in both directions, image prompts with no visible text in the image, and slug recommendations marked as not applied) for every page that genuinely warrants a full rewrite. Give proportionate, shorter treatment to pages that are already strong or already recommended for pruning. Batch into files of roughly 15 to 20 pages if the page count is large.

10\. Build a separate backlink strategy document, starting with an audit of the existing backlink profile for spam or quality risk before recommending any new outreach, prioritized by genuine relevance to this business's actual ecosystem.

11\. No em dashes anywhere. No fabricated facts, statistics, or case studies. Flag every judgment call and every deviation from a literal instruction explicitly rather than making it silently. Do not change any live slugs, redirects, or published pages, recommendations only, clearly marked as not applied.

Review your own plan critically before presenting it. If you find gaps or contradictions, revise before showing me the final version.

## Notes on adapting this for a different project

The bucketing framework, the bug checklist, the content brief format, and the standing rules all transfer directly to any content-driven website regardless of industry. What needs re-evaluating for a new project every time: whether the new business's category has measurable search volume yet (do not assume it does or does not, check), what the real competitive set actually is (pull it, do not assume it), and what the single most relevant, most-overlooked link-building channel is for that specific business's ecosystem (it will not always be a developer tool community; for a different business it might be an industry association, a marketplace, or a professional certification body). The thinking process stays the same. The specific answers do not.  
