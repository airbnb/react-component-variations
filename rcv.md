# React Component Variations

!!! warning "Disclaimer"
    The [react-component-variations](https://github.com/airbnb/react-component-variations) library is still in alpha and thus, a lot of this information is subject to change! However, it doesn't make sense to have zero documentation when this product is already in use internally.

## The General Concept

Variations are examples of usage as data in a React application.

If you have a button, your variations might be big button, small button, cancel button, etc. By defining them, you are implicitly creating tests that check if it renders, looks as expected, meets accessibility criteria, and validates prop types and typed props.

The way you can get these benefits is through enabling _variation_ _consumers_ such as Enzyme, Happo, Storybook, and Axe.

With enough consumers, the amount of boilerplate tests you need to write is dramatically reduced. However, you'll still need tests for advanced interactions and you'll want tests to cover specific bugs and regressions.

Variations also give you additional benefits that you don't get from tests, such as visual diffing and display and discovery of available components at dev time.

**⚠️ Prerequisites for using rcv in a frontend project:**

- All components must live in under a single directory
- All variation providers for a project must live under a single directory
- All images and fonts used in variations must be smaller than the max size in the webpack config
  - Max sizes as of 3/5/2019
    - `.ttf .eot .woff .woff2`: 100kb
    - `.png .jpg .jpeg .gif .otf .ico`: 20kb
    - `.svg`: 10kb


## example config:
```js
// package.json
{
  "react-component-variations": {
    "projects": {
        // ensure that all the paths below exist before
        // committing these changes.
        "my-new-project": {
          // path relative to the repo root
          componentRoot: "./frontend/my-new-project/components/",
          // path relative to the component root
          components: "./**/*.{jsx,tsx}",
          // path relative to the repo root
          variationsRoot: "./frontend/my-new-project/variations/",
          // path relative to the variations root
          variations: "./**/*VariationProvider.{jsx,tsx}"
        }
    },
  ...
}
```

This configuration lets RCV know where to source components and variation providers.

!!! note "Note 3/25/19"
    The plan is to move this configuration out of `package.json` and into individual project `project.json` files eventually. This functionality has not been added to [react-component-variations](https://github.com/airbnb/react-component-variations) yet. PRs welcome!

Currently, RCV will fail in CI without at least one component with a variation provider checked into the repository. This is where the `npm run component:frontend` script comes in.

#### VariationProvider.jsx

The variation provider contains component metadata that is consumed by variation consumers.

This file should export a function that returns a config object. The benefit of doing this work up front, is that it helps enable usage of all of the consumers through a static representation of a components various states.

**A basic variation provider file may look something like this:**

```js
// MyTestComponentVariationProvider.jsx
import MyTestComponent from '../components/MyTestComponent';

export default function MyTestComponentVariationProvider() {
  return {
    component: MyTestComponent,
    usage: 'This is a description of how my component is used on our website.',
    metadata: {
        // manually include phrase keys along with default values
        // to use in storybook and happo diffs
        phrases: {
          'phrase_key_test': 'test'
        },
        trebuchets: {},
    },

    // consumer options
    options: {
        // you only need this for custom configuration
        // for a view that does not use the default viewport sizes
        happo: {
           viewports: [
             'small',
             'medium',
           ]
        },
        storybook: {
          // tags used for searching related components on storybook
          tags: ['Image', 'fade'],
          // custom height and width
          width: '100%',
          height: '100%',
          // if you need a dark background, default is light
          background: 'dark',
        },
      // Used for DLS docs in dls core
      docs: {
        tags: [],
        specName: '',
      },
    },
    // variation render methods
    variations: [
      {
        title: 'default',
        render: () => {
            return <MyTestComponent ...requiredProps />
       },
      },
      {
        title: 'variation1',
        render: () => {
            return <MyTestComponent rausch ...requiredProps />
        },
      },
    ],
  }
}
```

In general, component level configurations can be included in the root rcv config in `package.json`. If you would like to reuse a custom render wrapper or phrase keys across all components in your project.

You can define these fields in the `package.json` configuration for your project. eg:

```json
// package.json
{
  "react-component-variations" {
    "projects": {
      ...
      "my-new-project": {
        metadata: {
          phrases: "./frontend/my-new-project/variations/phrases/",
          fixtures: "./frontend/my-new-project/variations/fixtures/",
        },
        componentRoot: "./frontend/my-new-project/components/",
        components: "./**/*.{jsx,tsx}",
        variationsRoot: "./frontend/my-new-project/variations/",
        variations: "./**/*VariationProvider.{jsx,tsx}",
        renderWrapper: "./frontend/my-new-project/variations/renderWrapper",
      }
    }
  }
}
```

## Happo

!!! warning "Note 3/25/19"
    This will change we switch to using Happo.io in the monorepo. These instructions are specific to open source happo. If you're in dls-web you can skip spurious happo tests through the happo.io dashboard.

Happo is a visual diffing tool that screenshots your changes and displays them on a PR. This is a good way to catch possible regressions and unintended side effects.

By default Happo uses the standard supported viewport sizes [defined in the default configuration]. These, like all options can be overwritten to include require additional stylesheets in the consumer options in your variation provider.

> Note: Variation providers can be generated using `npm run component:frontend`

```js
// MyTestComponentVariationProvider.jsx

export default function MyTestComponentVariationProvider() {
  return {
    options: {
      happo: {
        // Define Happo viewport sizes
         viewports: [
           'small',
           'medium',
           'large',
         ],
        // Define screen shot background
        background: 'light',
        // disabled default is `false`
        // set this to true if you want to skip running happo on this component
        disabled: false,
      },
    ...
  }
}
```

To opt out of using Happo for a single component, set the `disabled` field to `true` in the component variation provider.

### Running Happo in CI

To run Happo in CI, add the Happo job to `frontend/[project name]/_infra/ci/dispatch.yml`

> Note: The `dispatch.yml` changes below can be generated by `npm run frontend:scaffold` and opting into Happo.

eg:

```yml
# frontend/[project name]/_infra/ci/dispatch.yml
---
version: 3
jobs:
- name: ":happo: Visual Diffs"
  path: "../../_infra/ci/jobs/happo-frontend.yml"
  variants:
  - env:
      PROJECT: test-project
      BROWSER: firefox-56.*
      ENABLE_COMMENTING: 'false'
  options:
    large: true
```

When you push up a PR containing a change made to a project level `dispatch.yml`, you should see those changes reflected in buildkite immediately.

### Spurious Diffs

Spurious diffs can occur in certain components that happen to render in a different state in each screenshot. They are most noticeable when a PR containing no visual changes or unrelated changes triggers a Happo diff.

Spurious diffs are often a result of dynamic image loading, auto-resizing images, animations without mocks, and auto-focusing components.
For example, [this spurious diff on an image with a fade animation].

If you aren't sure that a Happo comment contains a spurious diff, drop into the [#happo channel on slack](https://airbnb.slack.com/messages/C2HA71TD4/) and let us know. Feel free to tag @web-toolers.

If you are confident that you are seeing a spurious diff, feel free to disable that diff for that component by setting `disabled` to `true` in the component's variation provider. This will prevent the diff from appearing on more related PRs.
[Here's an example commit turning off a spurious diff for a component].

## Enzyme RCV Consumer

To enable the enzyme variation consumer for your project, you will need to add `variations.test.js` file to your project's test directory.

Here's [an example `variations.test.js` file]:

```js
// airbnb/frontend/test-project/variations.test.js
// REVIEWERS: airbnb/web-tools
import enzymeTestVariations from ":spec/enzymeTestVariations";
enzymeTestVariations(__dirname); // __dirname = test-project
```

Once you've added this file, you can run the variation enzyme tests by running `npm run jest -- frontend/errors/tests/variations.test.js`.

### Skipping Tests for Variations:

If you would like to skip an enzyme test for a variation, you can pass in an additional argument to disable testing specific components in `frontend/[project name]/variations.test.js`.

The enzyme consumer tests a few things:

- is the component is valid, i.e. does it throw when the render function is invoked?
- does it render with a DOM?
- does it render without a DOM?

For example:

```js
import enzymeTestVariations from ":spec/enzymeTestVariations";

enzymeTestVariations(__dirname, {
  skip: {
    // Skip testing this component render on the DOM
    TripsCardRow: { skipDOM: true },
    // Skip testing this component render without a DOM
    TripsCardRow: { skipNonDOM: true },
    // [DO NOT USE] Skip testing if valid react component
    TripsCardRow: { skipValid: true },
    // Skip all enzyme tests for this component
    TripsCardRow: true,
    // NOTE these can be combined to skip multiple kinds of tests:
    TripsCardRow: { skipDOM: true, skipNonDOM: true }
  }
});
```

Source code for the enzyme consumer: [react-component-variations-consumer-enzyme](https://github.com/airbnb/react-component-variations-consumer-enzyme)
