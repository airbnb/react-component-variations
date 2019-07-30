# react-component-variations

⚠️ **Warning: this project is still very alpha**

This project is:
* A format called "variations" for specifying React component **_examples_** and providing **_documentation_** for them.
* Tools for finding, validating, and iterating over variations.

A variation looks like:

```jsx
// ButtonVariationProvider.jsx

import React from 'react';
import Button from '../components/Button';

export default function ButtonVariationProvider({ action }) {
  return {
    component: Button,

    usage: 'Buttons are things you click on!',

    variations: [
      {
        title: 'Default',
        render: () => <Button onClick={() => action('onClick')}>click me!</Button>,
      },
      {
        title: 'Disabled',
        render: () => <Button disabled>Nope</Button>
      }
    ],
  };
}
```

We also have "consumers" that use the variation provider to perform tasks. Example consumers are:
* Rendering variations in [Storybook](https://storybook.js.org/)
* Running in tests with [Enzyme](https://github.com/airbnb/react-component-variations-consumer-enzyme)
* Taking screenshots with [Happo](https://happo.io/)
* Checking for accessibility violations with [Axe](https://www.deque.com/axe/)

## Contribution Guidelines:

1. Fork this Repo
2. Install dependencies by running `npm install` in the root of the project directory.
3. To run lint and test run locally, in the project root run `npm test`. To run tests only, `npm run tests-only`.

Make sure new helpers and traversal functions have related tests.
