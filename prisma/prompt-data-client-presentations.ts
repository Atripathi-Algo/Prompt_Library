import type { SeedPrompt } from "./prompt-data";

export const seedPromptsClientPresentations: SeedPrompt[] = [
  {
    category: "Presentation Skills",
    title: "Client Pitch Deck Outline Builder",
    body: "You are a client-facing consultant building a new-business pitch deck.\nProspective client: {{client_name}}.\nTheir stated problem or opportunity: {{client_problem}}.\nOur proposed solution or offering: {{our_solution}}.\nCompetitive context, if known: {{competitive_context}}.\nBuild a slide-by-slide outline (10-14 slides) that opens with the client's own problem framed in their language, builds credibility before pitching the solution, and ends with a clear, low-friction next step.\nFor each slide, give a one-line purpose and the single most persuasive point it should carry — avoid slides that just restate facts with no argument.\nFlag which slide is most likely to lose the room's attention and suggest a fix.",
    variables: ["client_name", "client_problem", "our_solution", "competitive_context"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "Client Proposal Presentation Structure",
    body: "You are a proposal specialist structuring a presentation to accompany a written client proposal.\nProject or engagement: {{project_description}}.\nClient's evaluation criteria, if known: {{evaluation_criteria}}.\nBudget/timeline constraints they've mentioned: {{constraints}}.\nDesign a presentation structure that mirrors how the client will actually evaluate this (their criteria, in their order), not how we'd prefer to present it.\nFor each section, specify what evidence or proof point should back the claim (case study, data, reference), and note where a live demo or artifact would land better than a slide.\nEnd with a one-paragraph strategy for handling the moment budget or timeline concerns are likely to come up.",
    variables: ["project_description", "evaluation_criteria", "constraints"],
    complexity: "Advanced",
  },
  {
    category: "Presentation Skills",
    title: "Quarterly Business Review (QBR) Deck for Client",
    body: "You are an account manager preparing a Quarterly Business Review for an existing client.\nClient name: {{client_name}}.\nKey wins/results this quarter: {{quarter_results}}.\nOpen issues or risks to address: {{open_issues}}.\nWhat we want approved or expanded next quarter: {{next_quarter_ask}}.\nStructure a QBR deck that leads with client-relevant outcomes (not our activity metrics), addresses open issues proactively and candidly before the client raises them, and builds toward the next-quarter ask with a clear rationale.\nRecommend a slide count and pacing appropriate for a client review meeting, and note which single slide the client is most likely to push back on and how to pre-empt that.",
    variables: ["client_name", "quarter_results", "open_issues", "next_quarter_ask"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "Client Renewal or Upsell Pitch Builder",
    body: "You are an account executive building a renewal or expansion pitch for an existing client.\nClient name: {{client_name}}.\nCurrent contract value and term: {{current_contract}}.\nUsage/value delivered so far: {{value_delivered}}.\nExpansion or renewal ask: {{expansion_ask}}.\nBuild a pitch narrative that grounds the ask in demonstrated value delivered (not future promises alone), addresses the most likely reason this client would hesitate to renew or expand, and frames the ask as a natural next step rather than a hard sell.\nInclude 2-3 specific proof points to cite from the value delivered, and a fallback smaller ask if the client resists the full expansion.",
    variables: ["client_name", "current_contract", "value_delivered", "expansion_ask"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "Client Objection-Handling Script for Live Presentations",
    body: "You are a sales enablement specialist preparing objection responses for a live client presentation.\nWhat we're presenting/pitching: {{pitch_topic}}.\nKnown or anticipated objections: {{anticipated_objections}}.\nOur competitive/pricing constraints: {{constraints}}.\nFor each anticipated objection, write a response following acknowledge-reframe-answer structure: acknowledge the concern genuinely (no dismissive language), reframe it in a way that doesn't concede the whole point, then answer with a specific fact, proof point, or trade-off explanation.\nFlag any objection where honesty requires admitting a real limitation rather than spinning it, and write that response too.\nEnd with one objection you'd proactively raise yourself before the client does, and why that builds trust.",
    variables: ["pitch_topic", "anticipated_objections", "constraints"],
    complexity: "Advanced",
  },
  {
    category: "Presentation Skills",
    title: "Client-Facing Executive Summary Slide Writer",
    body: "You are a consultant writing the single executive summary slide a client's leadership will actually remember.\nEngagement or project: {{project_description}}.\nKey findings or recommendations: {{key_findings}}.\nDecision we need from the client: {{decision_needed}}.\nWrite this as ONE slide's worth of content: a headline that states the core takeaway as a claim (not a topic label), 3-4 supporting points in the client's business language rather than our internal jargon, and a single explicit statement of the decision or action we need from them.\nKeep total word count under 90 words for the slide itself, then provide a separate 2-sentence speaker-note version of what to say while showing it.",
    variables: ["project_description", "key_findings", "decision_needed"],
    complexity: "Beginner",
  },
  {
    category: "Presentation Skills",
    title: "Client Presentation Tone and Professionalism Review",
    body: "You are a client relationship specialist reviewing a presentation draft before it goes in front of a client.\nPresentation content or outline: {{presentation_content}}.\nClient relationship context (new/established, formal/informal): {{relationship_context}}.\nSensitive topics to handle carefully, if any: {{sensitive_topics}}.\nReview the draft for tone issues that could land badly with this specific client: language that sounds defensive, internally-focused jargon, unintentionally condescending explanations, or overpromising.\nFor each issue found, quote the problematic line and suggest a client-appropriate rewrite.\nEnd with an overall read on whether the tone matches the stated relationship context and one adjustment that would most improve how the client perceives us.",
    variables: ["presentation_content", "relationship_context", "sensitive_topics"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "Client Deck Template and Documentation Standard",
    body: "You are building a documented template standard so every client-facing deck across the team looks and reads consistently.\nTeam or department: {{team_name}}.\nTypes of client presentations this needs to cover: {{presentation_types}}.\nBrand or formatting constraints already in place: {{brand_constraints}}.\nDocument a client-deck standard covering: required slides (cover, agenda, executive summary, next steps) and their order, tone/voice guidelines specific to external client audiences, a checklist to run before any deck goes to a client (proofread, data accuracy, confidentiality check for other clients' info), and naming/versioning conventions for deck files.\nOutput as a reference doc with clear headings a new team member could follow without additional explanation.",
    variables: ["team_name", "presentation_types", "brand_constraints"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "In-Person vs. Virtual Client Presentation Format Recommendation",
    body: "You are a client engagement strategist deciding how to deliver an upcoming client presentation.\nPresentation purpose and stakes: {{presentation_purpose}}.\nClient's location/availability constraints: {{client_constraints}}.\nContent type (data-heavy, relationship-building, negotiation, technical demo): {{content_type}}.\nCompare in-person, live virtual, and async-recorded delivery for this specific presentation, weighing relationship stakes, the client's constraints, and how well the content type translates to each format.\nRecommend one format with clear reasoning, and if virtual or hybrid, name the two biggest risks to engagement in that format and how to mitigate each.\nEnd with a one-line fallback plan if the recommended format falls through close to the date.",
    variables: ["presentation_purpose", "client_constraints", "content_type"],
    complexity: "Intermediate",
  },
  {
    category: "Presentation Skills",
    title: "Post-Client-Meeting Follow-Up Summary Writer",
    body: "You are an account lead writing the follow-up summary after a client presentation or meeting.\nMeeting purpose: {{meeting_purpose}}.\nKey points discussed and any decisions made: {{meeting_notes}}.\nOpen questions or action items, with owners if known: {{action_items}}.\nWrite a concise client-facing follow-up email that confirms shared understanding of what was discussed, restates any decisions or commitments made (protecting us from later ambiguity) without sounding like a legal disclaimer, and lists action items with clear owners and target dates.\nKeep it under 200 words, warm but professional in tone, and end with a specific, easy-to-answer next step rather than a vague \"let us know if you have questions.\"",
    variables: ["meeting_purpose", "meeting_notes", "action_items"],
    complexity: "Beginner",
  },
];
