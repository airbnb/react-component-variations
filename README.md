# react-component-variations

**react-component-variations** is a library for traversing data from a project's component variations.

**What is a Component Variation?**


Airbnb uses Storybook (https://github.com/storybooks/storybook) to iteratively test and develop react components, as well as for documentation. We use an abstraction called a *variation* on top of Storybook, which logically represents the specific usages of a more general component inside of our codebase. For example, in [react-dates](http://airbnb.io/react-dates/?selectedKind=DayPicker&selectedStory=default&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel), the DayPicker component has variations for when the component has no border, when it has an info panel, when it is vertical, etc. Variations help engineers correctly use the abstractions built into their components by providing examples of concrete usage.

## Usage:

`npm install react-component-variations`

## API for [Consumers](#consumer):

There are four main functions exposed by `react-component-variations`. You can use them by including `react-component-variations/traversal/<nameOfFunction>` at the top of your file.

The design of `react-component-variations` encourages users to build their own traversal methods out of the functions defined below. If a function like `forEachProjectVariation` doesn't fit your use case directly, consider writing your own using the other functions below.

`forEachProjectVariation` is the main API exposed. Try using this first before trying the more advanced options:

* `forEachProjectVariation`
    * **Input**: consumer, options
        * consumer*
        * options:
            * projectRoot: path to project root. Defaults to process.cwd()
            * selectProjectNames : defaults to the identity function. Function that filters project names.
            * getDescriptor: passed to forEachDescriptor.
            * getExtras: passed to forEachDescriptor.
    * **Output**:
      *function* that can be passed a callback. This callback is passed into forEachVariation on each project specified.

*These functions are for more advanced users who want to implement their own traversal functionality:*

* `forEachDescriptor`
    * **Input**: projectConfig, options
        * projectConfig
        * options
            * projectRoot: path to project root. Defaults to process.cwd()
            * getDescriptor: function grabs descriptor object. Defaults to internal implementation.
            * getExtras: passed to getDescriptor.
    * **Output**: *function* that can be passed a callback. This callback has access to:
          **descriptor** and **variationProvider**.
* `forEachProject`
    * **Input**: projects, projectNames, callback
        * projects: the projectConfig object.
        * projectNames: list of projects to actually iterate through (can be subset of projects object).
        * callback: function that has access to two objects, the name of the project, and the actual project object from projectConfig. Is executed for each project.

* `forEachVariation`
    * **Input**: descriptor, consumer, callback
        * descriptor*
        * consumer*
        * callback: Function to be passed in which runs on each variation object. The contents of this object can be found [here](https://github.com/airbnb/react-component-variations/blob/85c463f32b869700598082b40d4c283a5b01efd8/src/traversal/forEachVariation.js#L50).

(*) means this is described in the *Terms* section.

## Terms:

**projectConfig:**
The projectConfig is specified either in your package.json or specified elsewhere. It follows the schema defined [here](https://github.com/airbnb/react-component-variations/blob/master/src/projectConfig.js).

**consumer:**
String representing who is consuming the variations. The projectConfig can implement logic depending on who is consuming the variations. Consider making this just the name of your project.

**descriptor:**
The descriptor object which contains your variation data. Properties on this object can be found [here](https://github.com/airbnb/react-component-variations/blob/85c463f32b869700598082b40d4c283a5b01efd8/src/traversal/forEachVariation.js#L9).

**variationProvider**:
*Object containing information about the path to the variationProvider file specified.
