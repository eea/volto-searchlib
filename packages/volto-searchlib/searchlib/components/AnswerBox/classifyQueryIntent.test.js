import { classifyQueryIntent } from './classifyQueryIntent';

describe('classifyQueryIntent', () => {
  it('classifies an explicit natural-language question for AI generation', () => {
    expect(
      classifyQueryIntent('How does climate change affect biodiversity?'),
    ).toEqual({
      intent: 'question',
      shouldGenerateAI: true,
      reason: 'question',
    });
  });

  it.each([
    'Compare electric vehicles and diesel cars',
    'Explain biodiversity loss in Europe',
    'Effects of microplastics on marine ecosystems',
  ])('classifies an exploratory query for AI generation: %s', (query) => {
    expect(classifyQueryIntent(query)).toEqual({
      intent: 'exploratory',
      shouldGenerateAI: true,
      reason: 'exploratory',
    });
  });

  it.each([
    'Climate change is a hoax',
    'Renewable energy does not work',
    'Electric vehicles are worse than diesel cars',
    'Air pollution causes premature deaths',
  ])('classifies a sentence-like claim for AI generation: %s', (query) => {
    expect(classifyQueryIntent(query)).toEqual({
      intent: 'claim',
      shouldGenerateAI: true,
      reason: 'claim',
    });
  });

  it.each([
    'SOER',
    'biodiversity',
    'circular economy',
    'air quality report 2025',
    'climate adaptation strategy',
  ])('keeps a retrieval query on traditional search: %s', (query) => {
    expect(classifyQueryIntent(query)).toEqual({
      intent: 'retrieval',
      shouldGenerateAI: false,
      reason: 'retrieval',
    });
  });

  it('fails closed for empty and unrecognised input', () => {
    expect(classifyQueryIntent('')).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'empty',
    });
    expect(
      classifyQueryIntent('environment information from several places'),
    ).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'unknown',
    });
  });

  it('supports a configurable minimum claim length', () => {
    expect(
      classifyQueryIntent('Climate is worsening', { minimumClaimWords: 3 }),
    ).toEqual({
      intent: 'claim',
      shouldGenerateAI: true,
      reason: 'claim',
    });
  });
});
