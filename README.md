# react-targem

[![Build Status](https://travis-ci.com/trucknet-io/react-targem.svg?branch=master)](https://travis-ci.com/trucknet-io/react-targem)
[![Coverage Status](https://coveralls.io/repos/github/trucknet-io/react-targem/badge.svg?branch=develop)](https://coveralls.io/github/trucknet-io/react-targem?branch=develop)

**react-targem** is a React library for efficiently implementing Gettext localization in your app with little effort.

It utilises [`node-gettext`](https://github.com/alexanderwallin/node-gettext) as translations tool, but this ought to be modularized in the future.

```js
<T
  message="You have one thingy, {{ itemLink:check it out }}"
  messagePlural="You have {{ count }} thingies, {{ listLink:check them out }}"
  count={items.length}
/>
// items.length === 1 => Du har en grej, <a href="/thingies/281">kolla in den här<a/>.
// items.length === 7 => Du har 7 grejer, <a href="/thingies">kolla in dem här<a/>.
```

## Table of contents

- [react-targem](#react-targem)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using `<T />`](#using-t)
    - [Using `withTranslators(Component)`](#using-withtranslatorscomponent)
    - [Locale switching](#locale-switching)
  - [API](#api)
    - [`withTranslations(Component)`](#withtranslationscomponent)
    - [`<TargemProvider />`](#targemprovider)
  - [Contributing](#contributing)
  - [See also](#see-also)

## Features

- Context and plural
- String interpolation using a `{{ variable }}` style syntax
- **Component interpolation** with translatable child content using a `{{ link:Link text here }}` style syntax
- [Locale switching](#locale-switching) on the fly

## Installation

```sh
npm install --save react-targem

# ...or the shorter...
npm i -S react-targem
```

## Usage

This is an example app showing how to translate some text:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { TargemProvider, T } from 'react-targem'

// messages.json is a JSON file with all translations concatenated into one.
// The format must conform to what node-gettext expects.
//
// See https://github.com/alexanderwallin/node-gettext#Gettext+addTranslations
import messages from './translations/messages.json'

function App({ name, numPotatoes }) {
  return (
    <TargemProvider
      messages={messages}
      locale="sv-SE"
      debug={/* true | false | null */}
    >
      <div className="App">
        <h1><T>Potato inventory</T></h1>
        {/* => <h1><span>Potatisinventarie</span></h1> */}

        <T
          message="Dear {{ name }}, there is one potato left"
          messagePlural="Dear {{ name }}, there are {{ count }} potatoes left"
          count={numPotatoes}
          name={name}
        />
        {/* => <span>Kära Ragnhild, det finns 2 potatisar kvar</span> */}

        <T
          message="By more potatoes {{ link:here }}!"
          link={<a href="http://potatoes.com/buy" />}
        />
        {/* => <span>Köp mer potatis <a href="http://potatoes.com/buy">här</a>!</span> */}
      </div>
    </TargemProvider>
  )
}

ReactDOM.render(
  <App name="Ragnhild" numPotatoes={Math.round(Math.random() * 3))} />,
  document.querySelector('.app-root')
)
```

### Using `<T />`

`<T />` exposes a set of props that make it easy to translate and interpolate your content. Being a React component, it works perfect for when you are composing your UI, like with the example above.

### Using `withTranslators(Component)`

Sometimes, you will need to just translate and interpolate pure strings, without rendering components. To do this you can hook up your components with translator functions using the `withTranslators(Component)` composer function.

`withTranslators(Component)` will provide any component you feed it with a set of translator functions as props. Those props are: `t`, `tn`, `tp`, `tnp`, `tc`, `tcn`, `tcp` and `tcnp`.

```js
import { withTranslators } from "react-targem";

function PotatoNotification({ notificationCode, t }) {
  let message = "";

  if (notificationCode === "POTATOES_RECEIVED") {
    message = t(`You have received potatoes`);
  } else if (notificationCode === "POTATOES_STOLEN") {
    message = t(`Someone stole all your potatoes :(`);
  }

  return <span>{message}</span>;
}

export default withTranslators(PotatoNotification);
```

### Locale switching

react-targem makes it possible to change locale and have all the application's translations instantly update to those of the new locale. `<TargemProvider>` will trigger a re-render of all `<T>` components and components wrapped in `withTranslators()` whenever its `locale` or `messages` props change.

**Note:** For performance reasons, and in favour of immutability, this check is done using shallow equality, which means you need to pass an entirely new object reference as `messages` for it to trigger the re-render. If this is an issue for you, simply make sure you create a new object when you get new messages, for instace by using something like `messages = Object.assign({}, messages)`.

## API

The following table indicates how gettext strings map to parameters in `withTranslations` and props for `<T />`

| Gettext      | `withTranslations` | `<T />`       |
| ------------ | ------------------ | ------------- |
| msgctxt      | context            | context       |
| msgid        | message \| one     | message       |
| msgid_plural | other              | messagePlural |

### `withTranslations(Component)`

Provides `Component` with the `react-targem` context variables as props. These are `locale`, `t`, `tn`, `tp`, `tnp`, `tc`, `tcn`, `tcp` and `tcnp`.

As a little helper, here's what the letters stand for:

| Letter | Meaning                           | Parameters              |
| ------ | --------------------------------- | ----------------------- |
| t      | translate a message               | `message`               |
| c      | ...with injected React components | -                       |
| n      | ...with pluralisation             | `one`, `other`, `count` |
| p      | ...in a certain gettext context   | `context`               |

- #### `locale`

  The currently set locale passed to `<TargemProvider />`.

- #### `t(message, scope = {})`

  Translates and interpolates message.

- #### `tn(one, other, count, scope = {})`

  Translates and interpolates a pluralised message.

- #### `tp(context, message, scope = {})`

  Translates and interpolates a message in a given context.

- #### `tnp(context, one, other, count, scope = {})`

  Translates and interpolates a pluralised message in a given context.

- #### `tc(message, scope = {})`

  Translates and interpolates a message.

- #### `tcn(one, other, count, scope = {})`

  Translates and interpolates a pluralised message.

- #### `tcp(context, message, scope = {})`

  Translates and interpolates a message in a given context.

- #### `tcnp(context, one, other, count, scope = {})`

  Translates and interpolates a plural message in a given context.

### `<TargemProvider />`

A higher-order component that provides the translation functions and state to `<T />` through context.

**Props:**

- `messages` – An object containing translations for all languages. It should have the format created by [gettext-parser](https://github.com/smhg/gettext-parser)
- `locale` – The currently selected locale (which should correspond to a key in `messages`)
- `transformInput` – A function `(input: String) => String` that you can use to transform a string before `<T />` sends it to the translation function. One use case is normalising strings when something like [`prettier`](https://github.com/prettier/prettier) puts child content in `<T />` on new lines, with lots of indentation. The default is a function that simply returns the input as is.

## Contributing

All PRs that passes the tests are very much appreciated! 🎂

## See also

- [lioness](https://github.com/alexanderwallin/lioness) - A React library for efficiently implementing Gettext localization
