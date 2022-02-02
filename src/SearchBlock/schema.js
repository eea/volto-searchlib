import React from 'react';

export const SearchBlockSchema = ({ formData = {} }) => ({
  title: 'Searchlib Block',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['appName'],
    },
    {
      id: 'general',
      title: 'General settings',
      fields: [
        'headline',
        'subheadline',
        'promptQueries',
        'promptQueryInterval',
        'debugQuery',
        'customConfig',
        'enableNLP',
      ],
    },
    ...(formData?.enableNLP
      ? [
          {
            id: 'nlp',
            title: 'NLP Capabilities Settings',
            fields: [
              'use_qa_dp',
              'qa_queryTypes',
              'cutoffScore',
              'rawIndex',
              'dprIndex',
              'topKRetriever',
              'topKReader',
            ],
          },
        ]
      : []),
  ],

  properties: {
    appName: {
      title: 'Searchlib app',
      choices: [],
    },

    enableNLP: {
      type: 'boolean',
      title: 'Enable NLP capabilities?',
      configPath: 'enableNLP',
    },

    customConfig: {
      widget: 'textarea',
      title: 'Custom configuration',
      description:
        'Enter a valid JSON object. It will be added to the configuration and it can overwrite existing configuration fields',
      default: '{}',

      modifyConfig: (config, data) => {
        let extra = {};
        try {
          extra = JSON.parse(data);
        } catch {
          // eslint-disable-next-line
          console.log('Not a valid JSON object', data);
          return config;
        } finally {
          return { ...config, extra };
        }
      },
    },

    debugQuery: {
      type: 'boolean',
      title: 'Enable debugging?',
      configPath: 'debugQuery',
    },

    headline: {
      title: 'Main headline',
      configPath: 'title',
    },
    subheadline: {
      title: 'Text below headline',
      configPath: 'subheadline',
    },
    promptQueries: {
      title: 'Prompt queries',
      configPath: 'promptQueries',
      widget: 'textarea',
    },
    promptQueryInterval: {
      title: 'Prompt interval',
      description: 'Interval when to change the prompt query',
      configPath: 'promptQueryInterval',
      type: 'number',
      default: 10000,
    },

    use_qa_dp: {
      title: 'Use DensePassageRetrieval for QA?',
      description: (
        <>
          If enabled, it will use{' '}
          <a href="https://github.com/facebookresearch/DPR">DPR</a> for basic
          query retrieval instead of ES BM25
        </>
      ),
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
      // modifyConfig: (config) => config,
      // default: ['query:interrogative']
    },
    cutoffScore: {
      title: 'Cutoff score',
      description:
        'Only answers with scores bigger then the cutoff score will be displayed. Enter a float number smaller then 1.',
      default: 0.1,
      configPath: 'nlp.qa.cutoffScore',
    },
    rawIndex: {
      title: 'ElasticSearch Index',
      configPath: 'nlp.qa.raw_index',
    },
    dprIndex: {
      title: 'DPR ElasticSearch Index',
      configPath: 'nlp.qa.dpr_index',
    },
    topKRetriever: {
      title: 'TopK Retriever',
      type: 'number',
      defaultValue: 10,
      configPath: 'nlp.qa.topk_retriever',
    },
    topKReader: {
      title: 'TopK Reader',
      type: 'number',
      defaultValue: 10,
      configPath: 'nlp.qa.topk_reader',
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
