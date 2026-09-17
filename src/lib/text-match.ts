const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is",
  "are", "be", "this", "that", "i", "you", "we", "our", "my", "your", "it",
  "as", "at", "by", "from", "if", "then", "will", "can", "please", "write",
  "create", "into", "about", "using", "use", "want", "need", "me", "us",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[{}]/g, " ")
    .replace(/[^a-z0-9_\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Simple weighted keyword-overlap score: title matches count more than body matches. */
export function scoreMatch(queryTokens: Set<string>, title: string, body: string): number {
  const titleMatches = new Set(tokenize(title).filter((t) => queryTokens.has(t)));
  const bodyMatches = new Set(tokenize(body).filter((t) => queryTokens.has(t)));
  return titleMatches.size * 3 + bodyMatches.size;
}
