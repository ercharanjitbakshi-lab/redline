// The clause categories Redline recognises, with the severity each gets by
// default and the reason for it. This file is data, not logic: it is meant to
// be read and argued with by someone who does not write code.
//
// How to read an entry:
//   severity   — how badly and how irreversibly the clause can hurt the
//                freelancer (docs/adr/0004). Not how common or unusual it is.
//   looksLike  — what the clause says, in plain terms.
//   rationale  — why it fails the asymmetry test: what it lets the other
//                party do with no reciprocal right, no cap, or no cure period,
//                beyond what the deal justifies.
//   notWhen    — the boundary: the version of this clause that is fine.
//
// Context-only categories are shown in the report as normal, never flagged.
// Their rationale says why they pass the asymmetry test.
//
// Source of the ranking: PRD.md §5.

export type Severity = "severe" | "high" | "moderate" | "context-only";

// The severities a flag can carry. Context-only clauses are never flags.
export type FlagSeverity = Exclude<Severity, "context-only">;

export type ClauseCategory = {
  key: string;
  name: string;
  severity: Severity;
  looksLike: string;
  rationale: string;
  notWhen: string;
};

export const clauseLibrary: readonly ClauseCategory[] = [
  // Severe

  {
    key: "ip-pre-existing-work",
    name: "IP assignment that takes your existing work or tools",
    severity: "severe",
    looksLike:
      "The client gets ownership of anything you made before the project, or of general tools, code libraries, templates or methods you use for every client.",
    rationale:
      "The client pays for one deliverable and takes work that was never part of the deal. You cannot get assigned rights back, and losing your tools affects every future client too.",
    notWhen:
      "Pre-existing work and general tools are carved out, or licensed to the client for use in the deliverable only.",
  },
  {
    key: "ip-vests-before-payment",
    name: "IP transfers before you are paid",
    severity: "severe",
    looksLike:
      "Ownership passes to the client on creation, on delivery or on signing, with no link to payment clearing.",
    rationale:
      "The client owns the work even if they never pay. Your leverage in a payment dispute is gone, and withholding the work is no longer an option.",
    notWhen: "Ownership transfers on full payment, or on payment for each part delivered.",
  },
  {
    key: "ip-moral-or-portfolio-rights",
    name: "Waiver of credit or portfolio rights",
    severity: "severe",
    looksLike:
      "You waive moral rights, give up credit for the work, or cannot show the work in your portfolio.",
    rationale:
      "The work stops counting toward your reputation, and the waiver never ends. The client gains nothing from a portfolio ban that a confidentiality window would not give them.",
    notWhen:
      "Portfolio use waits until the work is public, or keeps named confidential details out.",
  },
  {
    key: "uncapped-liability",
    name: "Liability with no cap",
    severity: "severe",
    looksLike:
      "You are liable for the client's losses, including indirect or consequential losses, with no upper limit.",
    rationale:
      "A single dispute can cost more than the whole contract is worth, and more than you have. The client's exposure to you is bounded by the fee; yours to them is not.",
    notWhen:
      "Liability is capped, for example at the fees paid, and indirect losses are excluded for both sides.",
  },
  {
    key: "broad-indemnification",
    name: "Broad indemnity",
    severity: "severe",
    looksLike:
      "You must cover the client's losses, legal costs or third-party claims, beyond claims caused by your own breach or negligence.",
    rationale:
      "You end up paying for risks you do not control, including the client's own decisions and their use of the work, and the client owes you nothing in return.",
    notWhen:
      "The indemnity is limited to claims caused by your breach or negligence, is capped, or is mutual.",
  },

  // High

  {
    key: "termination-without-payment",
    name: "Termination with no payment for work done",
    severity: "high",
    looksLike:
      "The client can end the contract at any time, for any reason, without paying for work already done or committed.",
    rationale:
      "The booked project becomes an option the client holds for free. You carry the cost of work in progress and turned-down projects, and they carry none.",
    notWhen:
      "Early termination pays for all work done to date, or pays a kill fee that reflects the work lost.",
  },
  {
    key: "payment-delayed-or-gated",
    name: "Payment that is delayed or conditional",
    severity: "high",
    looksLike:
      "Payment waits on an undefined approval, falls due 60 or 90 days out, or a kill fee applies once most of the work is done.",
    rationale:
      "The client controls when, or whether, you get paid, and you finance their project in the meantime. This is the most common way freelancers lose money. It ranks below the severe items only because the damage is usually recoverable.",
    notWhen:
      "Payment is due within 30 days of invoice, and any approval step has a fixed window after which the work counts as accepted.",
  },

  // Moderate

  {
    key: "non-compete-exclusivity-non-solicit",
    name: "Non-compete, exclusivity or non-solicit",
    severity: "moderate",
    looksLike:
      "You cannot work for other clients or competitors during or after the engagement, or cannot accept work from the client's contacts.",
    rationale:
      "It narrows your business in exchange for a single project's fee. The client pays nothing for your lost income elsewhere.",
    notWhen:
      "The restriction is narrow, short, limited to named direct competitors, and paid for, or covers only poaching the client's staff.",
  },
  {
    key: "unilateral-amendment",
    name: "Client can change the terms on their own",
    severity: "moderate",
    looksLike: "The client can change the terms at any time without your written agreement.",
    rationale:
      "The deal you signed is not the deal you are bound by, and you hold no matching right.",
    notWhen: "Changes need both parties' written agreement.",
  },

  // Context only: shown as normal, never flagged

  {
    key: "work-for-hire-deliverable",
    name: "Work-for-hire assignment of the deliverable",
    severity: "context-only",
    looksLike:
      "The client owns the specific deliverable they commissioned and paid for.",
    rationale:
      "This is what the client is paying for, and it is standard. It becomes a problem only at the sharp edges above: reaching into pre-existing work, vesting before payment, or taking credit and portfolio rights.",
    notWhen:
      "Not applicable. When one of the sharp edges is present, that clause is flagged under its own category.",
  },
  {
    key: "ordinary-confidentiality",
    name: "Confidentiality",
    severity: "context-only",
    looksLike:
      "You keep the client's non-public information confidential, for a reasonable period or while it stays secret.",
    rationale:
      "It protects information the client has reason to keep private, and it costs you little. It passes the asymmetry test as long as it does not block your portfolio or bind you forever.",
    notWhen:
      "Not applicable. A confidentiality clause used to ban portfolio use is flagged as a portfolio-rights waiver.",
  },
  {
    key: "mutual-limitation",
    name: "Limits that apply to both sides",
    severity: "context-only",
    looksLike:
      "A cap, exclusion, notice period or restriction that binds both parties in the same terms.",
    rationale:
      "A limit both sides accept equally is not asymmetric. It is listed so you can see it was read.",
    notWhen:
      "Not applicable. A clause that is mutual in form but hits only you in practice is flagged under its own category.",
  },
];
