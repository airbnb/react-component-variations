import VariationDescriptorSchema from './schema.json';

const {
  consumerOptionsObject,
  consumerOptions,
  defaultConsumerOptions,
  options,
} = VariationDescriptorSchema.definitions;

export default {
  $ref: '#/definitions/project',
  definitions: {
    project: {
      type: 'object',
      properties: {
        components: { $ref: '#/definitions/components' },
        variations: { $ref: '#/definitions/variations' },
        options: { $ref: '#/definitions/options' },
        require: { $ref: '#/definitions/require' },
        extensions: { $ref: '#/definitions/extensions' },
        flattenComponentTree: { type: 'boolean' },
        extras: { $ref: '#/definitions/extras' },
      },
      required: ['components', 'variations'],
      additionalProperties: false,
    },
    components: {
      oneOf: [{
        $ref: '#/definitions/relativeGlobPath',
      }, {
        type: 'array',
        items: { $ref: '#/definitions/relativeGlobPath' },
        uniqueItems: true,
      }],
    },
    variations: {
      oneOf: [{
        $ref: '#/definitions/relativeGlobPath',
      }, {
        type: 'array',
        items: { $ref: '#/definitions/relativeGlobPath' },
        uniqueItems: true,
      }],
    },
    require: {
      type: 'array',
      items: { $ref: '#/definitions/requiredFile' },
      uniqueItems: true,
    },
    relativeGlobPath: {
      type: 'string',
      minLength: 1,
    },
    requiredFile: {
      type: 'string',
      minLength: 1,
    },
    extensions: {
      type: 'array',
      items: { $ref: '#/definitions/extension' },
      uniqueItems: true,
      minLength: 1,
    },
    extension: {
      type: 'string',
      minLength: 1,
      pattern: '^\\..+$',
    },
    extras: {
      type: 'object',
      properties: {},
      additionalProperties: { $ref: '#/definitions/requiredFile' },
    },
    consumerOptionsObject,
    consumerOptions,
    defaultConsumerOptions,
    options,
  },
};
