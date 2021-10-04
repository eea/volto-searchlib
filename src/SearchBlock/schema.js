export const SearchBlockSchema = () => ({
  title: 'Searchlib Block',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['appName'],
    },
    {
      id: 'nlp',
      title: 'NLP Settings',
      fields: ['use_qa_dp', 'qa_queryTypes'],
    },
  ],

  properties: {
    appName: {
      title: 'Searchlib app',
      choices: [],
    },
    use_qa_dp: {
      title: 'Use DeepPassageRetrieval for QA?',
      description:
        'If enabled, it will use DPR for basic query retrieval instead of ES BM25',
      type: 'boolean',
      configPath: 'nlp.qa.use_dp',
    },
    qa_queryTypes: {
      title: 'QA Query types',
      description: 'The QA system will be used for these types of queries',
      choices: [
        ['query:interrogative', 'Question'],
        ['query:declarative', 'Statement'],
        ['query:keyword', 'Keyword'],
      ],
      configPath: 'nlp.qa.qa_queryTypes',
      isMulti: true,
      // default: ['query:interrogative']
    },
  },

  required: ['appName'],
});

// {
//   id: 'tile',
//   title: 'Tile rendering',
//   fields: ['tile_title', 'tile_description', 'tile_url', 'tile_image'],
// },
// url: {
//   title: 'ES URL',
//   default: '',
// },
// es_index: {
//   widget: 'elasticsearch_select_index',
// },
// tile_title: {
//   title: 'Title field',
//   widget: 'elasticsearch_select_field',
// },
// tile_description: {
//   title: 'Description field',
//   widget: 'elasticsearch_select_field',
// },
// tile_url: {
//   title: 'Primary URL field',
//   widget: 'elasticsearch_select_field',
// },
// tile_image: {
//   title: 'Image field',
//   widget: 'elasticsearch_select_field',
// },
