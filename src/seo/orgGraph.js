// SINGLE SOURCE OF TRUTH for the site-wide Organization + WebSite JSON-LD graph.
//
// Injected into index.html at build time (vite.config.js → inject-org-jsonld
// plugin) so every pre-rendered route carries it, AND imported by
// api/_lib/render.js so the SSR blog pages carry the identical node. One
// definition → the blog and the static pages can never drift apart again.
//
// Pure data only (imported by the Vite config and a serverless function): no
// React, CSS, or browser globals. The homepage-specific nodes (WebPage,
// #casestudy-sendr, FAQPage) stay per-route in the page body, not here.
export const ORG_WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://rankedtag.com/#org",
      "name": "RankedTag",
      "alternateName": "RankedTag SEO Agency",
      "url": "https://rankedtag.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://rankedtag.com/#logo",
        "url": "https://rankedtag.com/rankedtag-logo.png",
        "contentUrl": "https://rankedtag.com/rankedtag-logo.png",
        "caption": "RankedTag logo",
        "width": 1000,
        "height": 1000
      },
      "image": { "@id": "https://rankedtag.com/#logo" },
      "description": "RankedTag is a B2B SaaS SEO, AI SEO, AEO and GEO agency. Senior strategists plus AI build inbound engines that get ranked on Google and cited by ChatGPT, Perplexity, Gemini and Claude — feeding qualified pipeline inside 90 days.",
      "slogan": "SEO, AI SEO, AEO & GEO for B2B SaaS.",
      "foundingDate": "2026",
      "email": "bhushan@rankedtag.com",
      "priceRange": "$$",
      "areaServed": { "@type": "Place", "name": "Worldwide" },
      "knowsLanguage": "en",
      "knowsAbout": [
        "Search Engine Optimization (SEO)",
        "AI SEO",
        "Generative Engine Optimization (GEO)",
        "Answer Engine Optimization (AEO)",
        "LLM SEO (LLMO)",
        "AI search optimization",
        "Google AI Overviews",
        "ChatGPT, Perplexity, Gemini and Claude citations",
        "SaaS SEO",
        "B2B SaaS inbound marketing",
        "Programmatic SEO",
        "Technical SEO",
        "Content strategy for SaaS"
      ],
      "keywords": "B2B SaaS SEO agency, AI SEO agency, GEO agency, generative engine optimization, answer engine optimization, LLM SEO, AI search optimization",
      "founder": {
        "@type": "Person",
        "@id": "https://rankedtag.com/#founder",
        "name": "Bhushan Raj Shakya",
        "jobTitle": "Founder",
        "worksFor": { "@id": "https://rankedtag.com/#org" },
        "sameAs": ["https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/"]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "bhushan@rankedtag.com",
        "url": "https://rankedtag.com/",
        "availableLanguage": "en"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "RankedTag Services",
        "url": "https://rankedtag.com/services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "B2B SaaS SEO",
              "serviceType": "Search Engine Optimization",
              "url": "https://rankedtag.com/services/b2b-saas-seo",
              "description": "Full-stack SEO for B2B SaaS: technical foundations, content engine and link strategy built to rank on Google and feed qualified pipeline.",
              "provider": { "@id": "https://rankedtag.com/#org" },
              "areaServed": { "@type": "Place", "name": "Worldwide" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI SEO",
              "serviceType": "AI Search Optimization",
              "url": "https://rankedtag.com/services/ai-seo",
              "description": "Optimization for AI-driven search surfaces including Google AI Overviews and LLM-powered answers.",
              "provider": { "@id": "https://rankedtag.com/#org" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Answer Engine Optimization (AEO)",
              "serviceType": "Answer Engine Optimization",
              "url": "https://rankedtag.com/services/answer-engine-optimization",
              "description": "Structuring content and entities so your SaaS becomes the answer in AI Overviews, featured snippets and answer engines.",
              "provider": { "@id": "https://rankedtag.com/#org" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Generative Engine Optimization (GEO)",
              "serviceType": "Generative Engine Optimization",
              "url": "https://rankedtag.com/services/generative-engine-optimization",
              "description": "Getting your brand cited and recommended inside ChatGPT, Perplexity, Gemini and Claude responses.",
              "provider": { "@id": "https://rankedtag.com/#org" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Technical SEO",
              "serviceType": "Technical SEO",
              "url": "https://rankedtag.com/services/technical-seo",
              "description": "52-point technical foundation: crawlability, Core Web Vitals, schema graphs, internal linking and AI-crawler readiness.",
              "provider": { "@id": "https://rankedtag.com/#org" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "SEO Content Engine",
              "serviceType": "Content Marketing",
              "url": "https://rankedtag.com/services/saas-content-marketing",
              "description": "Senior-written, AI-accelerated SaaS content that ranks on Google and gets cited by LLMs — shipped weekly with schema and conversion paths.",
              "provider": { "@id": "https://rankedtag.com/#org" }
            }
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://rankedtag.com/#website",
      "url": "https://rankedtag.com/",
      "name": "RankedTag",
      "description": "The inbound engine for B2B SaaS founders — SEO, GEO, and free SEO tools.",
      "publisher": { "@id": "https://rankedtag.com/#org" },
      "inLanguage": "en"
    }
  ]
};
