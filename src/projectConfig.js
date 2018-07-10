'use strict';

const VariationDescriptorSchema = require('./schema');

const {
  consumerOptionsObject,
  consumerOptions,
  defaultConsumerOptions,
  options,
} = VariationDescriptorSchema.definitions;

module.exports = {
  $ref: '#/definitions/project',
  definitions: {
    project: {
      type: 'object',
      properties: {
        components: { $ref: '#/definitions/components' },
        variations: { $ref: '#/definitions/variations' },
        options: { $ref: '#/definitions/options' },
      },
      required: ['components', 'variations'],
      additionalProperties: false,
    },
    components: {
      type: 'string',
      minLength: 1,
    },
    variations: {
      type: 'string',
      minLength: 1,
    },
    require: {
      type: 'array',
      items: { $ref: '#/definitions/requiredFile' },
      uniqueItems: true,
    },
    requiredFile: {
      type: 'string',
      minLength: 1,
      pattern: '^[./]',
    },
    consumerOptionsObject,
    consumerOptions,
    defaultConsumerOptions,
    options,
  },
};
