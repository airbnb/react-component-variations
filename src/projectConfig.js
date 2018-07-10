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
        require: { $ref: '#/definitions/require' },
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
    consumerOptionsObject,
    consumerOptions,
    defaultConsumerOptions,
    options,
  },
};
