import { systemPrompt, summaryPrompt } from './prompts';

// Contract for the prompts sent to the summary agent. The query-intent
// service already decides which queries may spend an LLM call, so the
// prompts must not re-do that classification - they only steer how an
// eligible query is answered.
describe('AI summary prompts', () => {
  it('keeps the NOT_A_QUESTION refusal token the component checks for', () => {
    expect(summaryPrompt).toContain('NOT_A_QUESTION');
  });

  it('keeps the response format line that works with the persona', () => {
    // The persona's own system prompt owns the bracket-citation format;
    // this wording was verified live to produce inline citations without
    // a trailing source list.
    expect(summaryPrompt).toMatch(/no sources, no preamble/);
    expect(summaryPrompt).toMatch(/inline citations/i);
  });

  it('does not prime the model with trailing reference lists', () => {
    // Naming a "References:" section backfired live: the model added one.
    expect(summaryPrompt).not.toContain('References:');
    expect(summaryPrompt).not.toContain('Sources:');
  });

  it('covers factual claims, not only questions', () => {
    expect(summaryPrompt).toMatch(/claim/i);
  });

  it('refuses when the retrieved documents do not address the query', () => {
    expect(summaryPrompt).toMatch(/do not actually address/i);
  });

  it('no longer carries the local gate job of classifying keywords and terms', () => {
    // These instructions described queries the gate blocks before any
    // LLM call; keeping them contradicts the search-page behavior.
    expect(summaryPrompt).not.toMatch(/implicit data requests/i);
    expect(summaryPrompt).not.toContain('romania co2 emissions 2022');
    expect(summaryPrompt).not.toMatch(/gibberish/i);
  });

  it('answers in the language of the query', () => {
    expect(summaryPrompt).toMatch(/same language/i);
  });

  it('system prompt no longer references the removed detailed mode', () => {
    expect(systemPrompt).not.toMatch(/detailed/i);
  });
});
