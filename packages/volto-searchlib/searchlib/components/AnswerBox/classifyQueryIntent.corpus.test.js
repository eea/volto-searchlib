import { classifyQueryIntent } from './classifyQueryIntent';

// Corpus of realistic advanced-search queries. Encodes the issue 307513
// policy: natural-language questions, exploratory requests and sentence
// claims get an AI summary; keywords, acronyms, document retrieval, short
// noun phrases, implicit data queries and overly long (pasted) input never
// do. Everything else fails closed.

const AI_CASES = [
  // Explicit questions
  ['Who', 'question'],
  ["Who's the capital of France", 'question'],
  ['What is the main cause of air pollution?', 'question'],
  ['How does climate change affect biodiversity?', 'question'],
  ['Why is the ozone layer important?', 'question'],
  ['Where are the main wetlands in Europe?', 'question'],
  ['When was the EU Water Framework Directive adopted?', 'question'],
  ['Which countries use the most renewable energy?', 'question'],
  ['Who publishes the state of the environment report?', 'question'],
  ['What are the health effects of PM2.5?', 'question'],
  ['How much CO2 does Romania emit per year?', 'question'],
  ['What were CO2 emissions in Europe in 2022?', 'question'],
  ['Can electric vehicles fully replace diesel cars?', 'question'],
  ['Are EU air quality standards being met?', 'question'],
  ['Did the Green Deal reduce carbon emissions?', 'question'],
  ['Is the EU on track for climate neutrality by 2050?', 'question'],
  ['How many premature deaths are attributed to PM2.5?', 'question'],
  ['What are PFAS and why do they matter?', 'question'],
  ['When will the new air quality rules apply?', 'question'],
  ['Which transport mode has the lowest pollution?', 'question'],
  // Questions without punctuation or capitalisation
  ['why the sky is blue', 'question'],
  ['is climate change real', 'question'],
  ['Climate real?', 'question'],
  ['Whats the capital of France?', 'question'],
  ["Isn't it true that forests prevent flooding?", 'question'],
  ['Might heatwaves become more frequent?', 'question'],
  ['Must EU members reduce emissions?', 'question'],
  ['How to reduce household energy use?', 'question'],
  ['why did the eu adopt the green deal', 'question'],
  ['are there enough nature reserves in europe', 'question'],

  // Exploratory commands
  ['Explain the European Green Deal', 'exploratory'],
  ['Compare electric vehicles and diesel cars', 'exploratory'],
  ["Describe the state of Europe's rivers", 'exploratory'],
  ['Assess the impact of plastic pollution', 'exploratory'],
  ['Evaluate EU biodiversity policy', 'exploratory'],
  ['Discuss the causes of deforestation', 'exploratory'],
  ['Investigate the link between heatwaves and wildfires', 'exploratory'],
  ['Explore the drivers of species decline', 'exploratory'],
  ["Tell me about the state of Europe's forests", 'exploratory'],
  ['Give me a brief summary of the Green Deal', 'exploratory'],
  ['Give me a summary of the Green Deal', 'exploratory'],
  ['Break down the causes of air pollution', 'exploratory'],
  ['Review the state of the environment in Europe', 'exploratory'],
  ['Ways to reduce plastic use', 'exploratory'],
  ['Tips for cutting household emissions', 'exploratory'],

  // Topic phrases (with or without a leading article)
  ['Effects of microplastics on marine ecosystems', 'exploratory'],
  ['Impact of climate change on agriculture', 'exploratory'],
  ['Causes of air pollution', 'exploratory'],
  ['The impact of climate change on biodiversity', 'exploratory'],
  ['Drivers of deforestation in Europe', 'exploratory'],
  ['Challenges of urban air quality monitoring', 'exploratory'],
  ['Trends in renewable energy adoption', 'exploratory'],
  ['Status of the EU biodiversity targets', 'exploratory'],
  ['Progress on climate neutrality', 'exploratory'],
  ['Overview of the European Green Deal', 'exploratory'],
  ['Analysis of the European Green Deal', 'exploratory'],
  ['the state of the environment in europe', 'exploratory'],

  // Sentence-like claims
  ['Climate change is a hoax', 'claim'],
  ['Renewable energy does not work', 'claim'],
  ['Electric vehicles are worse than diesel cars', 'claim'],
  ['Air pollution causes premature deaths', 'claim'],
  ['CO2 emissions have been rising since 2000', 'claim'],
  ['The EU is failing to protect nature', 'claim'],
  ["Climate change isn't real", 'claim'],
  ['Plastic waste pollutes European rivers', 'claim'],
  ['Poverty leads to deforestation', 'claim'],
  ['Traffic noise affects concentration', 'claim'],
  ['Drought accelerated coastal erosion', 'claim'],
  ['Heatwaves kill thousands of people', 'claim'],
  ['Emissions doubled over the last decade', 'claim'],
  ['The policy undermined local fishing', 'claim'],
  ['Diesel cars are more polluting than expected', 'claim'],
  ['Renewables will dominate the energy market', 'claim'],
  ['The EU should ban single-use plastics', 'claim'],
];

const NO_AI_CASES = [
  // Keywords, acronyms and short noun phrases
  ['SOER', 'retrieval'],
  ['climate', 'retrieval'],
  ['PDF', 'retrieval'],
  ['water quality', 'retrieval'],
  ['biodiversity', 'retrieval'],
  ['circular economy', 'retrieval'],
  ['PFAS', 'retrieval'],
  ['PM2.5', 'retrieval'],
  ['climate adaptation strategy', 'retrieval'],
  ['copernicus climate', 'retrieval'],
  ['waste statistics', 'retrieval'],
  ['European Green Deal', 'retrieval'],
  ['biodiversity loss', 'retrieval'],
  ['green deal', 'retrieval'],
  ['climate action tracker', 'retrieval'],
  ['wholesome', 'retrieval'],
  ['island', 'retrieval'],
  ['🌍 climate', 'retrieval'],

  // Document retrieval (type words and years)
  ['air quality report 2025', 'retrieval'],
  ['SOER 2020', 'retrieval'],
  ['heatwave 2022', 'retrieval'],
  ['2022', 'retrieval'],
  ['co2 2022', 'retrieval'],
  ['european statistics', 'retrieval'],
  ['statistical office data', 'retrieval'],
  ['air quality maps', 'retrieval'],
  ['latest air quality data', 'retrieval'],
  ['co2 emission data', 'retrieval'],
  ['list of eu directives', 'retrieval'],
  ['fact sheet on PM2.5', 'retrieval'],
  ['guidelines for air quality monitoring', 'retrieval'],
  ['white paper on circular economy', 'retrieval'],
  ['inventory of greenhouse gas emissions', 'retrieval'],
  ['eu directive on waste', 'retrieval'],
  ['show me the 2023 air quality report', 'retrieval'],
  ['guides for air quality monitoring', 'retrieval'],
  ['white papers on circular economy', 'retrieval'],
  ['outlines of the green deal', 'retrieval'],
  ['LED lighting guidelines', 'retrieval'],

  // Implicit data queries and unrecognised phrases (fail closed)
  ['romania co2 emissions 2022', 'retrieval'],
  ['co2 emissions by country', 'unknown'],
  ['gdp per capita europe', 'unknown'],
  ['top 10 countries by co2 emissions', 'unknown'],
  ['environment information from several places', 'unknown'],
];

const TOO_LONG_QUESTION =
  'What are the main causes of air pollution in european cities and how ' +
  'have they changed over the last two decades compared to the rest of the world?';
const TOO_LONG_PASTED_TEXT =
  'This is a very long pasted paragraph about the environment that goes on ' +
  'and on and on without being a question at all';

describe('classifyQueryIntent corpus', () => {
  it.each(AI_CASES)('generates an AI summary for: %s', (query, intent) => {
    expect(classifyQueryIntent(query)).toEqual({
      intent,
      shouldGenerateAI: true,
      reason: intent,
    });
  });

  it.each(NO_AI_CASES)('makes no AI call for: %s', (query, intent) => {
    expect(classifyQueryIntent(query)).toEqual({
      intent,
      shouldGenerateAI: false,
      reason: intent,
    });
  });

  it('suppresses queries longer than the configurable word threshold', () => {
    expect(classifyQueryIntent(TOO_LONG_QUESTION)).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'too-long',
    });
    expect(classifyQueryIntent(TOO_LONG_PASTED_TEXT)).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'too-long',
    });
  });

  it('honours a custom maximum query length', () => {
    expect(
      classifyQueryIntent('What is the main cause?', { maxQueryWords: 4 }),
    ).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'too-long',
    });
  });

  it('treats non-string input as empty', () => {
    expect(classifyQueryIntent(null)).toEqual({
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'empty',
    });
  });
});
