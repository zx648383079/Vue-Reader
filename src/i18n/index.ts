import axios from "axios";
import { nextTick } from "vue";
import { createI18n, type I18n } from "vue-i18n";
const datetimeFormats: any = {
    'en': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        }
    },
    'zh': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
        }
    }
};
const numberFormats: any = {
    'en': {
        currency: {
            style: 'currency', currency: 'USD', notation: 'standard'
        },
        decimal: {
            style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
        },
        percent: {
            style: 'percent', useGrouping: false
        }
    },
    'zh': {
        currency: {
            style: 'currency', currency: 'CNY', useGrouping: true, currencyDisplay: 'symbol'
        },
        decimal: {
            style: 'decimal', minimumSignificantDigits: 3, maximumSignificantDigits: 5
        },
        percent: {
            style: 'percent', useGrouping: false
        }
    }
};

export const SUPPORT_LOCALES: string[] = ['en', 'zh'];


export function setupI18n(locale: string = SUPPORT_LOCALES[1]) {
    const i18n = createI18n({
        legacy: false,
        locale: locale,
        fallbackLocale: SUPPORT_LOCALES[0],
        numberFormats,
        datetimeFormats,
    });
    setI18nLanguage(i18n, locale);
    return i18n;
}
  
export function setI18nLanguage(i18n: I18n, locale: string) {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale;
    } else {
        (i18n.global.locale as any).value = locale
    }
    axios.defaults.headers.common['Accept-Language'] = locale;
    document.querySelector('html')?.setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n: I18n, locale: string) {
    // load locale messages with dynamic import
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */`./locales/${locale}.json`
    );
    i18n.global.setLocaleMessage(locale, messages.default);
    return nextTick();
}

export async function handleChangeLocale(paramsLocale: string | undefined) {
    // use locale if paramsLocale is not in SUPPORT_LOCALES
    if (
        typeof paramsLocale !== "string" ||
        !SUPPORT_LOCALES.includes(paramsLocale)
    ) {
        console.warn(
            `Caughted unsupported locale=${paramsLocale}. Use default locale=en`
        );
        paramsLocale = SUPPORT_LOCALES[0];
    }
  
    // load locale messages
    if (!i18n.global.availableLocales.includes(paramsLocale)) {
        await loadLocaleMessages(i18n, paramsLocale);
    }
  
    // set i18n language
    setI18nLanguage(i18n, paramsLocale);
}

export const i18n = setupI18n();