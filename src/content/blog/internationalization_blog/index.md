---
title: "Internationalization made easy with react-intl"
summary: "Making Internationalization Easy with Next.js and react-intl"
date: "Apr 23 2023"
draft: false
tags:
- NextJS
- Internationalization
- React
- Tutorial
---


Internationalization (i18n) is an important aspect of modern web development. It enables us to create websites that are accessible to users from all over the world, regardless of their language or location. In this article, we’ll explore how we can make i18n easy with Next.js and react-intl.

#### Installation

To get started with i18n in Next.js and react-intl, we need to install the react-intl library:

`npm install react-intl`

```typescript
"react-intl": "^6.4.1"
```

#### NextJS Config

This is all we need for our `next.config.js` file.

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // instead of wrapping our Component inside <StricMode/> we set this to true.
  reactStrictMode: true,
  i18n:{
    locales: ['en', 'de'],
    defaultLocale: 'en',
  }
}

module.exports = nextConfig
```

#### Folder structure

This is our folder structure

![folder structure](https://cdn-images-1.medium.com/max/1600/1*nZNehnOFCdIYmtAWtbNGow.png)

`lang` folder contains our `json` files as well as `flattenMessages.ts` which we’ll explain later.

`hooks` contains `useLocale.ts` and `useTranslate.ts` which we’ll also explain.

`pages` folder is NextJS folder in which we’ll put our routes!

#### React Itl Config

**react-intl** is an awsome library which makes it very easy to work with **internaliztion**! It provides super cool features ( we won’t cover most of them today! we’ll just focus on how we can handle basic **internalization** )

```typescript
export default function App({ Component, pageProps }: AppProps) {
  // useLocale is a custom hook.
  const { locale, messages } = useLocale();

  return (
    <IntlProvider locale={locale as string} messages={messages}>
      <Component {...pageProps} />
    </IntlProvider>
  );
}
```

In our `_app.tsx` file, we’re just importing the `IntlProvider` and wrapping our `Component.`

`IntlProvider:` expects 2 required props. `locale` which is in our case `en` or `de` & `messages:` an object with `key` `value` pair because we can’t have a nested object here! but if we take a look at our `[locale].json` files we’ll see that our files contain **nested** json!   
Why? Because **nested** json makes it very easy to split our keys by screens or topics! so they can have a clear structure which won’t be the case with simple `key-value` json.

![](https://cdn-images-1.medium.com/max/1600/1*c_R_Gt2WQ3a6Ec6x_dKU4Q.png)

So to resolve this issue, we have this `flattenMessages` method which just takes any json and `flattens` it to make it `key-value` pair!

```typescript
// This interface is using Indexed signature and Recursive type utility in TS.
// It just means our json might have key and value of type string or nested json.
export interface INestedMessages {
  [key: string]: string | INestedMessages;
}
export const flattenMessages = (
  nestedMessages: INestedMessages,
  prefix = ""
): Record<string, string> => {
  return Object.keys(nestedMessages).reduce(
    (messages: Record<string, string>, key) => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") {
        messages[prefixedKey] = value;
      } else {
        Object.assign(messages, flattenMessages(value, prefixedKey));
      }

      return messages;
    },
    {}
  );
};

flattenMessages(en) 
// output: key value pair
{
  "app.title": "NextJS internalisation",
  "app.locale_switcher.en": "English",
  "app.locale_switcher.de": "German",
  "app.main.description": "This article is trying to explain how we can use react-intl with NextJS and use also Typescript to make our life easy!"
 }
```

#### Custom hooks: useLocale

```typescript
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import en from "@/../lang/en.json";
import de from "@/../lang/de.json";
import { flattenMessages, INestedMessages } from "../../lang/flattenMessages";

// Union type
export type Locale = "en" | "de";

// a Record is an object wich we can pass union types to it as key.
const messages: Record<Locale, INestedMessages> = {
  en,
  de,
};

export const useLocale = () => {
  const router = useRouter();
  
  const flattenedMessages = useMemo(
    () => flattenMessages(messages[router.locale as Locale]),
    [router]
  );

  const switchLocale = useCallback(
    (locale: Locale) => {
      // if we already have /en and we choose english for example we just return!
      if (locale === router.locale) {
        return;
      }

      // This is how we change locale in NextJS.
      const path = router.asPath;
      return router.push(path, path, { locale });
    },
    [router]
  );
  return { locale: router.locale, switchLocale, messages: flattenedMessages };
};
```

This custom hook is very simple! It’s just using the `useRouter` hook from `nextjs` to get the locale and to switch the locale. It’s also returning a flattened version of our translation messages.

It’s very simple to use, this way we abstract the `locale` management complexity.

```typescript
cosnt {switchLocale, locale, messages} = useLocale()
```

#### Custom Hooks: useTranslate

```typescript
import type { PrimitiveType } from "react-intl";
import { useIntl } from "react-intl";
import type { FormatXMLElementFn } from "intl-messageformat";
import { useCallback } from "react";
import { TranslationKey } from "../../lang/flattenMessages";

export const useTranslate = () => {
  const { formatMessage } = useIntl();
  // Define a function called t that takes in a key of type TranslationKey
    (
      key: TranslationKey
    ) => 
     // Call formatMessage with an object that has an id property set  to the given key
    formatMessage({id:key}),  
    [formatMessage]
  );

  return { t };
};
```

Now this is our `useTranslate` custom hook! we’re using `useIntl` from `react-intl` and the `formatMessage` method.

This method has a required param `MessageDescriptor` which is just an object with `id: string` . It also accepts other params out of the scope of this article.

`TranslationKey` is a TS type we built to retrieve our translation keys. A translation key is simply any path that ends with a string. In our case our translations keys are `app.title | app.locale_switcher.en |` [`app.locale.de`](http://app.locale.de) `| app.main.description.`

We need to extract this type so we don’t make typos when we’re trying to translate our strings.

This is the type, to explain how this type is working exactly we need a separate article but I hope the comments make it a bit clearer!

```typescript
// Define a TypeScript type called KeyPaths that takes in an object type T as its generic type parameter.
// KeyPaths is defined as a mapped type, which produces a new type by iterating over the keys of T.
type KeyPaths<T extends INestedMessages> = {
  // For each key K in T, create a mapped type that checks whether the value of that key T[K] extends INestedMessages,
  // i.e., whether the value is an object that has string keys and unknown values.
  [K in keyof T]: T[K] extends INestedMessages
    ? // If the value of the key is an object, create a string literal type that represents the path to that object.
      // The path is constructed by combining the current key K with a dot separator and the key paths of the nested object T[K].
      // The & string is used to ensure that TypeScript recognizes this string literal as a string.

      `${K & string}.${KeyPaths<T[K]> & string}`
    : // If the value of the key is not an object, simply return the key name K.
      K;
  // Finally, index the KeyPaths type by keyof T, which returns a union of all the key paths in the object type T.
  // This means that KeyPaths<T> is a union of all the possible key paths in the object type T.
}[keyof T];

export type TranslationKey = KeyPaths<typeof en>;
```

This is the result! our IDE will help us avoid any `typos` and we won’t need to remember all these paths! We’ll also get errors if we change a path in our translation files and the build won’t pass until we fix it wherever we’re using it.

![](https://cdn-images-1.medium.com/max/1600/1*3XMCyE4AAImJ9T34XtaFlA.png)

#### Translated Page

Finally, this is our page.

```typescript
import { Inter } from "next/font/google";
import { Locale, useLocale } from "@/hooks/useLocale";
import { useTranslate } from "@/hooks/useTranslate";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { switchLocale, locale } = useLocale();
  const { t } = useTranslate();
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl">{t("app.title")}</h1>
        <select
          onChange={(e) => {
            switchLocale(e.target.value as Locale);
          }}
          className="outline-none rounded-xl text-black px-2 w-32"
          placeholder="Language"
        >
          <option value="en">{t("app.locale_switcher.en")}</option>
          <option value="de">{t("app.locale_switcher.de")}</option>
        </select>
      </div>
    </main>
  );
}
```

![](https://cdn-images-1.medium.com/max/1600/1*saJUjqPdf58NUAIaTz9FHg.gif)

#### Conclusion

In this article, we talked about using react-intl with NextJs to build an internalized web application.

We used TypeScript to build types for our `locales` and our `translationKeys.`

We also used `customHooks` to abstract all the complexity of `locale` and `translation` management.

GITHUBLINK: [https://github.com/hedi-ghodhbane/nextjs-intl.git](https://github.com/hedi-ghodhbane/nextjs-intl.git)