export const SearchBlockSchema = ({ formData = {}, assistants }) => ({
  title: 'Searchlib Block',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'appName',
        // 'defaultResultView',
      ],
    },
    {
      id: 'general',
      title: 'General settings',
      fields: [
        'headline',
        'subheadline',
        'searchInputPlaceholder',
        'promptQueries',
        'promptQueryInterval',
        'debugQuery',
        'customConfig',
        'enableChatbotAnswer',
        'enableMatomoTracking',
      ],
    },
    ...(formData?.enableChatbotAnswer && assistants?.length > 0
      ? [
          {
            id: 'assistants',
            title: 'AI Answer Settings',
            fields: ['chatbotAssistant'],
          },
        ]
      : []),
  ],

  properties: {
    appName: {
      title: 'Searchlib app',
      choices: [],
    },

    defaultResultView: {
      title: 'Default view',
      choices: [],
    },

    searchEnginePath: {
      title: 'Search Engine path',
      configPath: 'searchEnginePath',
    },

    enableChatbotAnswer: {
      type: 'boolean',
      title: 'Enable AI-generated answers?',
      configPath: 'enableChatbotAnswer',
    },

    chatbotAssistant: {
      title: 'Assistant',
      choices: assistants?.map(({ id, name }) => [id.toString(), name]) || [],
      configPath: 'chatbotAnswer.personaId',
    },

    enableMatomoTracking: {
      type: 'boolean',
      title: 'Enable Matomo Tracking?',
      configPath: 'enableMatomoTracking',
      default: true,
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
        } finally {
          Object.assign(config, extra);
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
      configPath: 'headline',
    },
    subheadline: {
      title: 'Text below headline',
      configPath: 'subheadline',
    },
    searchInputPlaceholder: {
      title: 'Search input placeholder',
      default: 'Search with a question or keyword...',
      configPath: 'searchInputPlaceholder',
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
