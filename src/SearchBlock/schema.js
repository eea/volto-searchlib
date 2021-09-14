export const SearchBlockSchema = () => ({
  title: 'Searchlib Block',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'registry',
        // 'es_index'
      ],
    },
    // {
    //   id: 'tile',
    //   title: 'Tile rendering',
    //   fields: ['tile_title', 'tile_description', 'tile_url', 'tile_image'],
    // },
  ],

  properties: {
    registry: {
      title: 'Configuration registry',
      // choices: [
      // ],
    },
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
  },

  required: ['url'],
});
