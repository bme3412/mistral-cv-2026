import type { FinanceEvidence } from "@/types";

/**
 * Qualitative finance evidence intentionally avoids confidential metrics.
 * Focus areas are operating range and execution track.
 */
export const financeEvidence: FinanceEvidence[] = [
  {
    id: "operating-range",
    title: "Operating Range in Tech Investing",
    evidence: [
      "Helped scale a global technology equity investing strategy from roughly $500M to $5B.",
      "Invested through pre-pandemic, pandemic, and post-pandemic market regimes during one of the most important and high-performing eras for technology markets, with a front-row seat to major structural shifts in software, semis, and AI.",
      "Built repeatable research workflows across software, semiconductors, AI infrastructure, and application-layer companies.",
    ],
    methods: [],
  },
  {
    id: "execution-track",
    title: "Execution Track Record (Non-Confidential)",
    evidence: [
      "Generated strong qualitative performance over time while maintaining explicit risk framing and scenario discipline.",
      "Observed and acted through major platform shifts, including the acceleration of AI and the rise of NVDA as a central market narrative.",
      "Improved decision velocity by combining deep industry synthesis with increasingly technical product understanding.",
    ],
    methods: [
      "Scenario trees with disconfirming-evidence checks.",
      "Catalyst tracking with explicit trigger conditions.",
      "Tight feedback loops between research, investment decisions, and outcome reviews.",
    ],
  },
];

