import { FC } from "react";
import { useLang } from "./Metronici18n";
import { IntlProvider } from "react-intl";
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-relativetimeformat/locale-data/es";
import "@formatjs/intl-relativetimeformat/locale-data/pt";

import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";
import ptMessages from "./messages/pt.json";
import { WithChildren } from "../helpers/react18MigrationHelpers";
import React from "react";

const allMessages = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
};

const I18nProvider: FC<WithChildren> = ({ children }) => {
  const locale = useLang();
  const messages = allMessages[locale];

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export { I18nProvider };
