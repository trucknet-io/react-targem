# react-targem

> Use Gettext localizations in your React app with an ease!

[![Build Status](https://travis-ci.com/trucknet-io/react-targem.svg?branch=develop)](https://travis-ci.com/trucknet-io/react-targem)
[![Coverage Status](https://coveralls.io/repos/github/trucknet-io/react-targem/badge.svg?branch=develop)](https://coveralls.io/github/trucknet-io/react-targem?branch=develop)

```jsx
<T
  message="Hey, {{ name }}, you have one thingy!"
  messagePlural="Hey, {{ name }}, you have {{ count }} thingies!"
  count={items.length}
  scope={{ name: "אלכס" }}
/>
// items.length === 1 => !היי אלכס, יש לך דבר אחד
// items.length === 7 => !היי אלכס, יש לך 7 גיזמוסים
```

## Table of contents

- [react-targem](#react-targem)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [`<TargemProvider />`](#targemprovider)
    - [`<TargemStatefulProvider />`](#targemstatefulprovider)
    - [`<T />`](#t)
    - [`withLocale(Component)`](#withlocalecomponent)
    - [Locale switching](#locale-switching)
  - [Size](#size)
  - [See also](#see-also)

## Features

- Context and plural
- String interpolation using a `{{ variable }}` style syntax
- [Locale switching](#locale-switching) on the fly
- Optional number formatting using [Intl.NumberFormat](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)
- TypeScript support
- SSR friendly

## Installation

```sh
npm install --save react-targem
# ...or the shorter...
npm i -S react-targem
```

## Usage

Below is an example app showing how to translate some text.  
_See **TypeScript** example [here](./dev/src/layouts) or better take a look at the tests: [T.spec.tsx](./src/components/T.spec.tsx), [TargemProvider.spec.tsx](./src/components/TargemProvider.spec.tsx), [TargemStatefulProvider.spec.tsx](./src/components/TargemStatefulProvider.spec.tsx)._

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { TargemProvider, T } from 'react-targem'

// translations.json below is a JSON file with all translations concatenated into one.
// It's just a map of `{ [locale: string]: ParsedPoFile }` where
// ParsedPoFile is an output of `po()` function call from "gettext-parser" package.
// See https://github.com/smhg/gettext-parser

// Also, you should definitely look at
// >>> https://github.com/goooseman/gettext-utils <<<
// as it can extract text from app to .po files and
// generate translations.json from .po files

import translationsJson from './src/i18n/translations.json'

function App({ name, numPotatoes }) {
  return (
    <TargemProvider
      locale="he"
      translations={translationsJson}
    >
      <div className="App">
        <h1><T>Potato inventory</T></h1>
        {/* => <h1><span>מלאי תפוחי אדמה</span></h1> */}

        <T
          message="Dear {{ name }}, there is one potato left"
          messagePlural="Dear {{ name }}, there are {{ count }} potatoes left"
          count={numPotatoes}
          scope={{ name }}
          formatNumbers
        />
        {/* => <span>אלכס היקר, נותרו שתי תפוחי אדמה</span> */}

        <a href="http://potatoes.com/buy">
          <T message="By more potatoes here!" asString />
        </a>
        {/* => <a href="http://potatoes.com/buy">לפי עוד תפוחי אדמה כאן!</a> */}
      </div>
    </TargemProvider>
  )
}

ReactDOM.render(
  <App name="אלכס" numPotatoes={Math.round(Math.random() * 3))} />,
  document.querySelector('.app-root')
)
```

---

### `<TargemProvider />`

```js
import { TargemProvider } from "react-targem";
```

Creates localization context for all child `<T />` components. This context can also be obtained using `withLocale(Component)`.

**Props:**

- `translations` **_(required: Object)_** – Translations as a map of `{ [locale: string]: ParsedPot }` where [ParsedPot](./src/localization/types.ts#L27) is an output of `po()` function call from [gettext-parser](https://github.com/smhg/gettext-parser). See also [gettext-utils](https://github.com/goooseman/gettext-utils).
- `locale` _(optional: string)_ – Current locale. If you don't pass this prop then `defaultLocale` is used (see below).
- `defaultLocale` _(optional: string)_ – Locale that is used when `locale` prop is empty. If you don't pass `defaultLocale` then the first locale from `translations` is used or `"en"` if `translations === {}`.
- `direction` _(optional: "ltr" | "rtl")_ – Current text direction. When omitted direction is resolved based on the current `locale`. There is a [predefined list](./src/utils/constants.ts) of 12 locale codes for which react-targem knows that they are `"rtl"`.
- `controlBodyDir` _(optional: boolean = true)_ – By default (if not SSR) when `direction` changes `TargemProvider` tries to do `document.body.dir = direction`. You can disable this by passing `controlBodyDir={false}`.
- `setBodyDir` _(optional: (dir: "ltr" | "rtl") => void)_ – When `controlBodyDir` is enabled you can pass your own function to override existing `document.body.dir = direction` behavior.

---

### `<TargemStatefulProvider />`

```js
import { TargemStatefulProvider } from "react-targem";
```

A thin wrapper around `<TargemProvider />` that allows you to store and change current locale. When `<TargemStatefulProvider />` is used, wrapping your component with `withLocale(Component)` also provides it with `changeLocale(locale: string)` function. See [withLocale](#withlocalecomponent).

**Props:**

- `translations` **_(required)_** – See [TargemProvider.props.translations](#targemprovider) above.
- `defaultLocale` _(optional)_ – See [TargemProvider.props.defaultLocale](#targemprovider) above.
- `controlBodyDir` _(optional)_ – See [TargemProvider.props.controlBodyDir](#targemprovider) above.
- `setBodyDir` _(optional)_ – See [TargemProvider.props.setBodyDir](#targemprovider) above.

---

### `<T />`

```js
import { T } from "react-targem";
```

Exposes a set of props that make it easy to translate and interpolate your content.

**Props:**

- `message | children` **_(required: string)_** – Message to translate (`msgid` in pot).
- `messagePlural` _(optional: string)_ – Plural version of the message (`msgid_plural` in pot).
- `count` _(optional: number)_ – Used to translate pluralized message and also interpolates into `messagePlural` and `message` as `{{ count }}`.
- `scope` _(optional: Object)_ – Used as variables source when interpolating `message` and `messagePlural`.
- `context` _(optional: string)_ – Translation context (`msgctxt` in pot).
- `asString` _(optional: boolean = false)_ – Whether to render translation as a raw string instead of wrapping it with `<span>` element.
- `formatNumbers` _(optional: boolean = false)_ – Whether to format `count` and all numbers in `scope` object using [Intl.NumberFormat](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat). If browser (or Node) doesn't support `Intl.NumberFormat` then formatting fallbacks to `Number.prototype.toLocaleString()`.

---

### `withLocale(Component)`

```js
import { withLocale } from "react-targem";
```

Provides `Component` with the `react-targem` context variables as props.

**These props are:**

- `locale` _: string_ – Current locale.
- `direction` _: "ltr" | "rtl"_ – Current text direction.
- `changeLocale` _: undefined | (locale: string) => void_ – This function is passed only when `<TargemStatefulProvider />` is used. It changes current locale.
- `t` _: (message: string, scope: Object = {}, context?: string) => string_ – Translates and interpolates message. See the usage below.
- `tn` _: (message: string, messagePlural: string, count: number, scope: Object = {}, context?: string) => string_ – Translates and interpolates pluralized message. See the usage below.
- `tf` – Same as `t` but also formats all numbers. See `formatNumbers` in [`<T/>`](#t) props above.
- `tnf` – Same as `tn` but also formats all numbers. See `formatNumbers` in [`<T/>`](#t) props above.

```jsx
import { withLocale } from "react-targem";

function Head({ locale, t, tn }) {
  const messagesCount = 3;
  const sender = "Alex";

  return (
    <ReactHelmet>
      <html lang={locale} />
      <title>
        {tn(
          "New message from {{ name }}",
          "{{ count }} new messages from {{ name }}",
          messagesCount,
          { name: sender },
          "head title",
        )}
      </title>
      <meta name="description" content={t("Some description")} />
    </ReactHelmet>
  );
}

export default withLocale(Head);
```

---

### Locale switching

react-targem makes it possible to change locale and have all the application's translations instantly update to those of the new locale. `<TargemProvider>` will trigger a re-render of all `<T>` components and components wrapped in `withLocale()` whenever its `locale` or `translations` props change.

**Note:** For performance reasons, and in favour of immutability, this check is done using shallow equality, which means you need to pass an entirely new object reference as `translations` for it to trigger the re-render. If this is an issue for you, simply make sure you create a new object when you get new translations.

## Size

<!--size-start-->
```
      6.79 kB: index.min.mjs
      2.46 kB: index.min.mjs.gz
      2.22 kB: index.min.mjs.br

      7.35 kB: index.umd.min.js
      2.78 kB: index.umd.min.js.gz
       2.5 kB: index.umd.min.js.br
```
<!--size-end-->

## See also

- [gettext-utils](https://github.com/goooseman/gettext-utils) - A set of utils to simplify translation flow in your project.
