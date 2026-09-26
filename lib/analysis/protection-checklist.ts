// The protections a fair freelance contract should contain. The "Not in this
// contract" section checks each one and reports it present, absent or
// partial (docs/adr/0006). The same list tells a clean result what was
// checked (docs/adr/0005).
//
// This list is opinionated: it encodes Redline's view of a fair freelance
// contract. It is data, not logic, so that view is written down where people
// can read it and push back on it.
//
// How to read an entry:
//   protectsAgainst — what goes wrong for the freelancer without it.
//   presentWhen     — what counts as having it, in any wording.
//   partialWhen     — what counts as only partly having it.

export type Protection = {
  key: string;
  name: string;
  protectsAgainst: string;
  presentWhen: string;
  partialWhen: string;
};

export const protectionChecklist: readonly Protection[] = [
  {
    key: "liability-cap",
    name: "A cap on your liability",
    protectsAgainst:
      "A single dispute costing you more than the contract is worth. With no cap, your liability to the client has no upper limit.",
    presentWhen:
      "Your total liability is limited to a stated amount, such as the fees paid, and indirect or consequential losses are excluded.",
    partialWhen:
      "There is a cap but it leaves out major heads of loss, such as indemnities or indirect losses, or it binds only the client.",
  },
  {
    key: "payment-deadline",
    name: "A payment deadline, and a consequence for missing it",
    protectsAgainst:
      "Being paid whenever the client gets round to it. Without a deadline and a penalty, late payment costs the client nothing.",
    presentWhen:
      "Invoices are due within a fixed number of days, and late payment has a consequence, such as interest, a late fee or the right to pause work.",
    partialWhen: "There is a deadline but nothing happens if the client misses it.",
  },
  {
    key: "pre-existing-ip-carve-out",
    name: "Your existing work and tools stay yours",
    protectsAgainst:
      "Losing ownership of work you made before the project, or of the tools and methods you use for every client.",
    presentWhen:
      "Pre-existing IP and general tools are excluded from the assignment, or licensed to the client for use in the deliverable only.",
    partialWhen:
      "Pre-existing work is carved out but general tools, code libraries or methods are not, or the reverse.",
  },
  {
    key: "payment-on-termination",
    name: "Payment for work done if the contract ends early",
    protectsAgainst:
      "The client ending the contract partway through and paying nothing for the work you have already done.",
    presentWhen:
      "Early termination triggers payment for all work done to date, or a kill fee that reflects the work lost.",
    partialWhen:
      "Some payment is due on termination but it falls well short of the work done, or it applies only to finished milestones.",
  },
  {
    key: "acceptance-window",
    name: "A fixed window for approving the work",
    protectsAgainst:
      "Payment held up indefinitely because the client never formally approves the work.",
    presentWhen:
      "The client has a set number of days to accept or reject, and silence after that counts as acceptance.",
    partialWhen:
      "There is a review period but nothing happens when it runs out, or rejection needs no reason.",
  },
];
