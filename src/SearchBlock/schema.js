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
      fields: ['headline', 'subheadline', 'enableNLP'],
    },
    ...(formData?.enableNLP
      ? [
          {
            id: 'nlp',
            title: 'NLP Capabilities Settings',
            fields: ['use_qa_dp', 'qa_queryTypes', 'cutoffScore'],
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

    headline: {
      title: 'Main headline',
      configPath: 'title',
    },
    subheadline: {
      title: 'Text below headline',
      configPath: 'subheadline',
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
