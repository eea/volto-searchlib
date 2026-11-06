/**
 * Resolve the documents actually cited by a streamed chatbot summary.
 *
 * The chatbot message carries two related fields:
 *
 * - `citations`: a map of citation number (1-based, as the superscript
 *   markers in the answer text) to document id. Only documents the model
 *   cited in its answer appear here (the backend falls back to the full
 *   retrieved set when the model emits no citation data at all).
 * - `documents`: the retrieved Onyx documents with display metadata
 *   (`semantic_identifier` title, `link`, ...).
 *
 * The returned list contains only the cited documents, deduplicated by
 * document id, ordered by first citation number, each annotated with the
 * citation number of its first occurrence so the list can be tied back to
 * the superscript markers in the summary text.
 *
 * @param {object} message - MessageProcessor message
 * @returns {Array<object>} cited Onyx documents with an added `index`
 */
export function getSummarySources(message) {
  const { citations, documents } = message || {};
  if (!citations) return [];

  const docsById = new Map(
    (documents || []).filter(Boolean).map((doc) => [doc.document_id, doc]),
  );

  const seen = new Set();
  const sources = [];
  Object.entries(citations)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([citationNum, docId]) => {
      if (!docId || seen.has(docId)) return;
      const doc = docsById.get(docId);
      if (!doc) return;
      seen.add(docId);
      sources.push({
        ...doc,
        index: Number(citationNum) || sources.length + 1,
      });
    });
  return sources;
}
