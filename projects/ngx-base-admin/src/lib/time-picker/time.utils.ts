import { isValidDate } from '../calendar/calendar.utils';

export interface DateTimeFormatOptions {
  localeMatcher?: 'best fit' | 'lookup' | undefined;
  weekday?: 'long' | 'short' | 'narrow' | undefined;
  era?: 'long' | 'short' | 'narrow' | undefined;
  year?: 'numeric' | '2-digit' | undefined;
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined;
  day?: 'numeric' | '2-digit' | undefined;
  hour?: 'numeric' | '2-digit' | undefined;
  minute?: 'numeric' | '2-digit' | undefined;
  second?: 'numeric' | '2-digit' | undefined;
  timeZoneName?: 'long' | 'short' | undefined;
  formatMatcher?: 'best fit' | 'basic' | undefined;
  hour12?: boolean | undefined;
  timeZone?: string | undefined;
}

export type DayPeriod = ('am' | 'pm');

export interface ITimeValue {
  value: number;
  label: string;
  dayPeriod?: DayPeriod;
  disabled?: boolean;
}

export interface IDayPeriods {
  am: string;
  pm: string;
}

export const getSupportedLocale = (locale: string = 'default') => {
  let supportedLocale: string;
  try {
    supportedLocale = Intl.DateTimeFormat.supportedLocalesOf(locale).length ? locale : 'default';
  } catch (e) {
    supportedLocale = 'default';
  }
  return supportedLocale;
};

export const isHour12 = (locale: string = 'default'): boolean => {
  const supportedLocale = getSupportedLocale(locale);
  const hour12 = Intl.DateTimeFormat(supportedLocale, { timeStyle: 'short' }).resolvedOptions().hour12;
  return hour12 ?? false;
};

export const convert12hTo24h = (abbr: 'am' | 'pm', hour: number) => {
  if (abbr === 'am' && hour === 12) {
    return 0;
  }
  if (abbr === 'am') {
    return hour;
  }
  if (abbr === 'pm' && hour === 12) {
    return 12;
  }
  return hour + 12;
};

export const convert24hTo12h = (hour: number) => hour % 12 || 12;

export const convertTimeToDate = (time: Date | string | null | undefined) =>
  time ? (time instanceof Date ? new Date(time) : new Date(`1970-01-01 ${time}`)) : null;

// export const getAmPm = (date: Date, locale: string) => {
//   if (date.toLocaleTimeString(locale).includes('AM')) {
//     return 'am'
//   }
//   if (date.toLocaleTimeString(locale).includes('PM')) {
//     return 'pm'
//   }
//   return date.getHours() >= 12 ? 'pm' : 'am'
// }

export const getAmPm = (date: Date, locale: string, options: DateTimeFormatOptions = {}): DayPeriod => {

  const dayPeriods = getDayPeriods('en-US', options);
  const time = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', hour12: true }).format(date);

  const dayPeriod = dayPeriods.find(element => time.includes(element.label));

  return <DayPeriod>(dayPeriod?.value ?? (date.getHours() >= 12 ? 'pm' : 'am'));
};

export const isAm = (date: Date) => {
  return date.getHours() < 12;
};
export const isPm = (date: Date) => {
  return date.getHours() > 11;
};

export const isValidTimeZone = (timeZone: unknown): boolean => {
  try {
    if (timeZone === undefined) {
      return false;
    }

    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
      throw new Error('Time zones not supported.');
    }

    if (typeof timeZone !== 'string') {
      throw new Error(`Invalid timeZone type specified: ${timeZone}`);
    }

    try {
      // throws an error if timezone is not valid
      Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    } catch (error) {
      throw new Error(`Invalid timeZone string specified: ${timeZone}`);
    }

    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
};

export const getListOfHours = (locale: string, options: DateTimeFormatOptions = {}) => {
  const hour12 = isHour12(locale);
  const time = new Date(0);
  return Array.from({ length: 24 }, (_, i) => {
    time.setHours(i);
    const dayPeriod = getAmPm(time, locale);
    return {
      value: i,
      dayPeriod: <DayPeriod>dayPeriod,
      label: time.toLocaleTimeString(locale, {
        hour: '2-digit',
        hour12: hour12,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[0]
    };
  });
};

export const getListOfMinutes = (locale: string, options: DateTimeFormatOptions = {}, valueAsString = false) => {
  const d = new Date(0);
  return Array.from({ length: 60 }, (_, i) => {
    d.setMinutes(i);
    return {
      value: i,
      // value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        // ...options,
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[1]
    };
  });
};

export const getListOfSeconds = (locale: string, options: DateTimeFormatOptions = {}, valueAsString = false) =>
  Array.from({ length: 60 }, (_, i) => {
    const d = new Date(0);
    d.setSeconds(i);
    return {
      value: i,
      // value: valueAsString ? i.toString() : i,
      label: d.toLocaleTimeString(locale, {
        // ...options,
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }).split(':')[2]
    };
  });

export const getSelectedHour = (date: Date | null, locale: string) =>
  date instanceof Date ? (isHour12(locale) ? convert24hTo12h(date.getHours()) : date.getHours()) : '';

export const getSelectedMinutes = (date: Date | null) => (date ? date.getMinutes() : '');

export const getSelectedSeconds = (date: Date | null) => (date ? date.getSeconds() : '');

// export const isAmPm = (locale: string) =>
//   ['am', 'AM', 'pm', 'PM'].some((el) => new Date().toLocaleString(locale).includes(el))

export const isAmPm = (locale: string = 'default') => {
  const supportedLocale = getSupportedLocale(locale);
  const date = new Date();
  const time = new Intl.DateTimeFormat(supportedLocale, { timeStyle: 'short' }).format(date);
  const isAmPm = time.match(/(?:\p{L}\p{M}\p{P}*)+|(?:\p{L}\p{P}*)+/gu) ?? [];
  return isAmPm.length > 0;
};

export const isValidTime = (time: string | Date | number | any) => {
  if (typeof time === 'string') {
    return isValidDate(time) || isValidDate(new Date(`1970-01-01 ${time}`));
  }
  return isValidDate(time);
  // const d = new Date(`1970-01-01 ${time}`)
  // return d instanceof Date && d.getTime()
};

// export const _getDayPeriods = (locale: string = 'default', options: DateTimeFormatOptions = {}) => {
//   const supportedLocale = getSupportedLocale(locale);
//
//   const dayPeriods = { am: 'am', pm: 'pm' };
//
//   const hour12 = isHour12(supportedLocale);
//   if (!hour12) {
//     return dayPeriods;
//   }
//
//   const am = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
//   const pm = new Date(Date.UTC(1970, 0, 1, 13, 0, 0));
//
//   const formatter = new Intl.DateTimeFormat(supportedLocale, { hour12: hour12, hour: 'numeric', timeZone: 'UTC' });
//   dayPeriods.am = formatter.formatToParts(am).find(part => part.type === 'dayPeriod')?.value ?? 'am';
//   dayPeriods.pm = formatter.formatToParts(pm).find(part => part.type === 'dayPeriod')?.value ?? 'pm'
//   return dayPeriods;
// };

export const getDayPeriods = (locale: string = 'default', options: DateTimeFormatOptions = {}) => {
  const supportedLocale = getSupportedLocale(locale);

  const dayPeriods = [
    { value: 'am', label: 'am' },
    { value: 'pm', label: 'pm' }
  ];

  const hour12 = isHour12(supportedLocale);
  if (!hour12) {
    return dayPeriods;
  }

  const am = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
  const pm = new Date(Date.UTC(1970, 0, 1, 13, 0, 0));
  const formatter = new Intl.DateTimeFormat(supportedLocale, { hour12: hour12, hour: 'numeric', timeZone: 'UTC' });
  const formattedAm = formatter.formatToParts(am).find(part => part.type === 'dayPeriod')?.value ?? 'am';
  const formattedPm = formatter.formatToParts(pm).find(part => part.type === 'dayPeriod')?.value ?? 'pm';

  dayPeriods.forEach((element, index, dayPeriods) => {
    dayPeriods[index].label = element.value === 'am' ? (formattedAm ?? 'am') : (formattedPm ?? 'pm');
  });

  return dayPeriods;
};

// testing
// const langs = [
//   ['Abkhazian', 'ab'],
//   ['Afar', 'aa'],
//   ['Afrikaans', 'af'],
//   ['Akan', 'ak'],
//   ['Albanian', 'sq'],
//   ['Amharic', 'am'],
//   ['Arabic', 'ar'],
//   ['Aragonese', 'an'],
//   ['Argentina', 'es-ar'],
//   ['Armenian', 'hy'],
//   ['Assamese', 'as'],
//   ['Avaric', 'av'],
//   ['Avestan', 'ae'],
//   ['Aymara', 'ay'],
//   ['Azerbaijani', 'az'],
//   ['Bambara', 'bm'],
//   ['Bashkir', 'ba'],
//   ['Basque', 'eu'],
//   ['Belarusian', 'be'],
//   ['Bengali (Bangla)', 'bn'],
//   ['Bihari', 'bh'],
//   ['Bislama', 'bi'],
//   ['Bosnian', 'bs'],
//   ['Breton', 'br'],
//   ['Bulgarian', 'bg'],
//   ['Burmese', 'my'],
//   ['Catalan', 'ca'],
//   ['Chamorro', 'ch'],
//   ['Chechen', 'ce'],
//   ['Chichewa, Chewa, Nyanja', 'ny'],
//   ['Chinese', 'zh'],
//   ['Chinese (Simplified)', 'zh-Hans'],
//   ['Chinese (Traditional)', 'zh-Hant'],
//   ['Chuvash', 'cv'],
//   ['Cornish', 'kw'],
//   ['Corsican', 'co'],
//   ['Cree', 'cr'],
//   ['Croatian', 'hr'],
//   ['Czech', 'cs'],
//   ['Danish', 'da'],
//   ['Divehi, Dhivehi, Maldivian', 'dv'],
//   ['Dutch', 'nl'],
//   ['Dzongkha', 'dz'],
//   ['English', 'en'],
//   ['Esperanto', 'eo'],
//   ['Estonian', 'et'],
//   ['Ewe', 'ee'],
//   ['Faroese', 'fo'],
//   ['Fijian', 'fj'],
//   ['Finnish', 'fi'],
//   ['French', 'fr'],
//   ['Fula, Fulah, Pulaar, Pular', 'ff'],
//   ['Galician', 'gl'],
//   ['Gaelic (Scottish)', 'gd'],
//   ['Gaelic (Manx)', 'gv'],
//   ['Georgian', 'ka'],
//   ['German', 'de'],
//   ['Greek', 'el'],
//   ['Greenlandic', 'kl'],
//   ['Guarani', 'gn'],
//   ['Gujarati', 'gu'],
//   ['Haitian Creole', 'ht'],
//   ['Hausa', 'ha'],
//   ['Hebrew', 'he'],
//   ['Herero', 'hz'],
//   ['Hindi', 'hi'],
//   ['Hiri Motu', 'ho'],
//   ['Hungarian', 'hu'],
//   ['Icelandic', 'is'],
//   ['Ido', 'io'],
//   ['Igbo', 'ig'],
//   ['Indonesian', 'id', 'in'],
//   ['Interlingua', 'ia'],
//   ['Interlingue', 'ie'],
//   ['Inuktitut', 'iu'],
//   ['Inupiak', 'ik'],
//   ['Irish', 'ga'],
//   ['Italian', 'it'],
//   ['Japanese', 'ja'],
//   ['Javanese', 'jv'],
//   ['Kalaallisut, Greenlandic', 'kl'],
//   ['Kannada', 'kn'],
//   ['Kanuri', 'kr'],
//   ['Kashmiri', 'ks'],
//   ['Kazakh', 'kk'],
//   ['Khmer', 'km'],
//   ['Kikuyu', 'ki'],
//   ['Kinyarwanda (Rwanda)', 'rw'],
//   ['Kirundi', 'rn'],
//   ['Kyrgyz', 'ky'],
//   ['Komi', 'kv'],
//   ['Kongo', 'kg'],
//   ['Korean', 'ko'],
//   ['Kurdish', 'ku'],
//   ['Kwanyama', 'kj'],
//   ['Lao', 'lo'],
//   ['Latin', 'la'],
//   ['Latvian (Lettish)', 'lv'],
//   ['Limburgish (Limburger)', 'li'],
//   ['Lingala', 'ln'],
//   ['Lithuanian', 'lt'],
//   ['Luga-Katanga', 'lu'],
//   ['Luganda, Ganda', 'lg'],
//   ['Luxembourgish', 'lb'],
//   ['Manx', 'gv'],
//   ['Macedonian', 'mk'],
//   ['Malagasy', 'mg'],
//   ['Malay', 'ms'],
//   ['Malayalam', 'ml'],
//   ['Maltese', 'mt'],
//   ['Maori', 'mi'],
//   ['Marathi', 'mr'],
//   ['Marshallese', 'mh'],
//   ['Moldavian', 'mo'],
//   ['Mongolian', 'mn'],
//   ['Nauru', 'na'],
//   ['Navajo', 'nv'],
//   ['Ndonga', 'ng'],
//   ['Northern Ndebele', 'nd'],
//   ['Nepali', 'ne'],
//   ['Norwegian', 'no'],
//   ['Norwegian bokmål', 'nb'],
//   ['Norwegian nynorsk', 'nn'],
//   ['Nuosu', 'ii'],
//   ['Occitan', 'oc'],
//   ['Ojibwe', 'oj'],
//   ['Old Church Slavonic, Old Bulgarian', 'cu'],
//   ['Oriya', 'or'],
//   ['Oromo (Afaan Oromo)', 'om'],
//   ['Ossetian', 'os'],
//   ['Pāli', 'pi'],
//   ['Pashto, Pushto', 'ps'],
//   ['Persian (Farsi)', 'fa'],
//   ['Polish', 'pl'],
//   ['Portuguese', 'pt'],
//   ['Punjabi (Eastern)', 'pa'],
//   ['Quechua', 'qu'],
//   ['Romansh', 'rm'],
//   ['Romanian', 'ro'],
//   ['Russian', 'ru'],
//   ['Sami', 'se'],
//   ['Samoan', 'sm'],
//   ['Sango', 'sg'],
//   ['Sanskrit', 'sa'],
//   ['Serbian', 'sr'],
//   ['Serbo-Croatian', 'sh'],
//   ['Sesotho', 'st'],
//   ['Setswana', 'tn'],
//   ['Shona', 'sn'],
//   ['Sichuan Yi', 'ii'],
//   ['Sindhi', 'sd'],
//   ['Sinhalese', 'si'],
//   ['Siswati', 'ss'],
//   ['Slovak', 'sk'],
//   ['Slovenian', 'sl'],
//   ['Somali', 'so'],
//   ['Southern Ndebele', 'nr'],
//   ['Spanish', 'es'],
//   ['Sundanese', 'su'],
//   ['Swahili (Kiswahili)', 'sw'],
//   ['Swati', 'ss'],
//   ['Swedish', 'sv'],
//   ['Tagalog', 'tl'],
//   ['Tahitian', 'ty'],
//   ['Tajik', 'tg'],
//   ['Tamil', 'ta'],
//   ['Tatar', 'tt'],
//   ['Telugu', 'te'],
//   ['Thai', 'th'],
//   ['Tibetan', 'bo'],
//   ['Tigrinya', 'ti'],
//   ['Tonga', 'to'],
//   ['Tsonga', 'ts'],
//   ['Turkish', 'tr'],
//   ['Turkmen', 'tk'],
//   ['Twi', 'tw'],
//   ['Uyghur', 'ug'],
//   ['Ukrainian', 'uk'],
//   ['Urdu', 'ur'],
//   ['Uzbek', 'uz'],
//   ['Venda', 've'],
//   ['Vietnamese', 'vi'],
//   ['Volapük', 'vo'],
//   ['Wallon', 'wa'],
//   ['Welsh', 'cy'],
//   ['Wolof', 'wo'],
//   ['Western Frisian', 'fy'],
//   ['Xhosa', 'xh'],
//   ['Yiddish', 'yi', 'ji'],
//   ['Yoruba', 'yo'],
//   ['Zhuang, Chuang', 'za'],
//   ['Zulu', 'zu'],
// ]
//
// langs.forEach(lang => {const period = getDayPeriods(lang[1]); if (period.am === 'AM') return; console.log(lang[1], period )})

// Chrome / Opera
// Amharic am {am: 'ጥዋት', pm: 'ከሰዓት'}
// Arabic ar {am: 'ص', pm: 'م'}
// Bulgarian bg {am: 'пр.об.', pm: 'сл.об.'}
// Chinese (Traditional) zh-Hant {am: '上午', pm: '下午'}
// Greek el {am: 'π.μ.', pm: 'μ.μ.'}
// Hindi hi {am: 'am', pm: 'pm'}
// Kannada kn {am: 'ಪೂರ್ವಾಹ್ನ', pm: 'ಅಪರಾಹ್ನ'}
// Korean ko {am: '오전', pm: '오후'}
// Malay ms {am: 'PG', pm: 'PTG'}
// Tamil ta {am: 'முற்பகல்', pm: 'பிற்பகல்'}

// Edge Chromium
// Albanian sq {am: 'e paradites', pm: 'e pasdites'}
// Amharic am {am: 'ጥዋት', pm: 'ከሰዓት'}
// Arabic ar {am: 'ص', pm: 'م'}
// Bulgarian bg {am: 'пр.об.', pm: 'сл.об.'}
// Chinese (Traditional) zh-Hant {am: '上午', pm: '下午'}
// Greek el {am: 'π.μ.', pm: 'μ.μ.'}
// Hindi hi {am: 'am', pm: 'pm'}
// Kannada kn {am: 'ಪೂರ್ವಾಹ್ನ', pm: 'ಅಪರಾಹ್ನ'}
// Korean ko {am: '오전', pm: '오후'}
// Malay ms {am: 'PG', pm: 'PTG'}
// Punjabi (Eastern) pa {am: 'ਪੂ.ਦੁ.', pm: 'ਬਾ.ਦੁ.'}
// Sindhi sd {am: 'صبح، منجهند', pm: 'منجهند، شام'}
// Tamil ta {am: 'முற்பகல்', pm: 'பிற்பகல்'}

// Firefox
// Akan ak { am: "AN", pm: "EW" }
// Albanian sq { am: "e paradites", pm: "e pasdites" }
// Amharic am { am: "ጥዋት", pm: "ከሰዓት" }
// Arabic ar { am: "ص", pm: "م" }
// Assamese as { am: "পূৰ্বাহ্ন", pm: "অপৰাহ্ন" }
// Bulgarian bg { am: "пр.об.", pm: "сл.об." }
// Chinese (Traditional) zh-Hant { am: "上午", pm: "下午" }
// Dzongkha dz { am: "སྔ་ཆ་", pm: "ཕྱི་ཆ་" }
// Ewe ee { am: "ŋdi", pm: "ɣetrɔ" }
// Greek el { am: "π.μ.", pm: "μ.μ." }
// Hindi hi { am: "am", pm: "pm" }
// Kannada kn { am: "ಪೂರ್ವಾಹ್ನ", pm: "ಅಪರಾಹ್ನ" }
// Korean ko { am: "오전", pm: "오후" }
// Malay ms { am: "PG", pm: "PTG" }
// Oromo (Afaan Oromo) om { am: "WD", pm: "WB" }
// Punjabi (Eastern) pa { am: "ਪੂ.ਦੁ.", pm: "ਬਾ.ਦੁ." }
// Sanskrit sa { am: "पूर्वाह्न", pm: "अपराह्न" }
// Sindhi sd { am: "صبح، منجهند", pm: "منجهند، شام" }
// Somali so { am: "GH", pm: "GD" }
// Tamil ta { am: "முற்பகல்", pm: "பிற்பகல்" }
// Tigrinya ti { am: "ቅ.ቀ.", pm: "ድ.ቀ." }
// Tonga to { am: "hengihengi", pm: "efiafi" }
// Twi tw { am: "AN", pm: "EW" }

// const formats = {
//   "ar-SA" : "dd/MM/yy",
//   "bg-BG" : "dd.M.yyyy",
//   "ca-ES" : "dd/MM/yyyy",
//   "zh-TW" : "yyyy/M/d",
//   "cs-CZ" : "d.M.yyyy",
//   "da-DK" : "dd-MM-yyyy",
//   "de-DE" : "dd.MM.yyyy",
//   "el-GR" : "d/M/yyyy",
//   "en-US" : "M/d/yyyy",
//   "fi-FI" : "d.M.yyyy",
//   "fr-FR" : "dd/MM/yyyy",
//   "he-IL" : "dd/MM/yyyy",
//   "hu-HU" : "yyyy. MM. dd.",
//   "is-IS" : "d.M.yyyy",
//   "it-IT" : "dd/MM/yyyy",
//   "ja-JP" : "yyyy/MM/dd",
//   "ko-KR" : "yyyy-MM-dd",
//   "nl-NL" : "d-M-yyyy",
//   "nb-NO" : "dd.MM.yyyy",
//   "pl-PL" : "yyyy-MM-dd",
//   "pt-BR" : "d/M/yyyy",
//   "ro-RO" : "dd.MM.yyyy",
//   "ru-RU" : "dd.MM.yyyy",
//   "hr-HR" : "d.M.yyyy",
//   "sk-SK" : "d. M. yyyy",
//   "sq-AL" : "yyyy-MM-dd",
//   "sv-SE" : "yyyy-MM-dd",
//   "th-TH" : "d/M/yyyy",
//   "tr-TR" : "dd.MM.yyyy",
//   "ur-PK" : "dd/MM/yyyy",
//   "id-ID" : "dd/MM/yyyy",
//   "uk-UA" : "dd.MM.yyyy",
//   "be-BY" : "dd.MM.yyyy",
//   "sl-SI" : "d.M.yyyy",
//   "et-EE" : "d.MM.yyyy",
//   "lv-LV" : "yyyy.MM.dd.",
//   "lt-LT" : "yyyy.MM.dd",
//   "fa-IR" : "MM/dd/yyyy",
//   "vi-VN" : "dd/MM/yyyy",
//   "hy-AM" : "dd.MM.yyyy",
//   "az-Latn-AZ" : "dd.MM.yyyy",
//   "eu-ES" : "yyyy/MM/dd",
//   "mk-MK" : "dd.MM.yyyy",
//   "af-ZA" : "yyyy/MM/dd",
//   "ka-GE" : "dd.MM.yyyy",
//   "fo-FO" : "dd-MM-yyyy",
//   "hi-IN" : "dd-MM-yyyy",
//   "ms-MY" : "dd/MM/yyyy",
//   "kk-KZ" : "dd.MM.yyyy",
//   "ky-KG" : "dd.MM.yy",
//   "sw-KE" : "M/d/yyyy",
//   "uz-Latn-UZ" : "dd/MM yyyy",
//   "tt-RU" : "dd.MM.yyyy",
//   "pa-IN" : "dd-MM-yy",
//   "gu-IN" : "dd-MM-yy",
//   "ta-IN" : "dd-MM-yyyy",
//   "te-IN" : "dd-MM-yy",
//   "kn-IN" : "dd-MM-yy",
//   "mr-IN" : "dd-MM-yyyy",
//   "sa-IN" : "dd-MM-yyyy",
//   "mn-MN" : "yy.MM.dd",
//   "gl-ES" : "dd/MM/yy",
//   "kok-IN" : "dd-MM-yyyy",
//   "syr-SY" : "dd/MM/yyyy",
//   "dv-MV" : "dd/MM/yy",
//   "ar-IQ" : "dd/MM/yyyy",
//   "zh-CN" : "yyyy/M/d",
//   "de-CH" : "dd.MM.yyyy",
//   "en-GB" : "dd/MM/yyyy",
//   "es-MX" : "dd/MM/yyyy",
//   "fr-BE" : "d/MM/yyyy",
//   "it-CH" : "dd.MM.yyyy",
//   "nl-BE" : "d/MM/yyyy",
//   "nn-NO" : "dd.MM.yyyy",
//   "pt-PT" : "dd-MM-yyyy",
//   "sr-Latn-CS" : "d.M.yyyy",
//   "sv-FI" : "d.M.yyyy",
//   "az-Cyrl-AZ" : "dd.MM.yyyy",
//   "ms-BN" : "dd/MM/yyyy",
//   "uz-Cyrl-UZ" : "dd.MM.yyyy",
//   "ar-EG" : "dd/MM/yyyy",
//   "zh-HK" : "d/M/yyyy",
//   "de-AT" : "dd.MM.yyyy",
//   "en-AU" : "d/MM/yyyy",
//   "es-ES" : "dd/MM/yyyy",
//   "fr-CA" : "yyyy-MM-dd",
//   "sr-Cyrl-CS" : "d.M.yyyy",
//   "ar-LY" : "dd/MM/yyyy",
//   "zh-SG" : "d/M/yyyy",
//   "de-LU" : "dd.MM.yyyy",
//   "en-CA" : "dd/MM/yyyy",
//   "es-GT" : "dd/MM/yyyy",
//   "fr-CH" : "dd.MM.yyyy",
//   "ar-DZ" : "dd-MM-yyyy",
//   "zh-MO" : "d/M/yyyy",
//   "de-LI" : "dd.MM.yyyy",
//   "en-NZ" : "d/MM/yyyy",
//   "es-CR" : "dd/MM/yyyy",
//   "fr-LU" : "dd/MM/yyyy",
//   "ar-MA" : "dd-MM-yyyy",
//   "en-IE" : "dd/MM/yyyy",
//   "es-PA" : "MM/dd/yyyy",
//   "fr-MC" : "dd/MM/yyyy",
//   "ar-TN" : "dd-MM-yyyy",
//   "en-ZA" : "yyyy/MM/dd",
//   "es-DO" : "dd/MM/yyyy",
//   "ar-OM" : "dd/MM/yyyy",
//   "en-JM" : "dd/MM/yyyy",
//   "es-VE" : "dd/MM/yyyy",
//   "ar-YE" : "dd/MM/yyyy",
//   "en-029" : "MM/dd/yyyy",
//   "es-CO" : "dd/MM/yyyy",
//   "ar-SY" : "dd/MM/yyyy",
//   "en-BZ" : "dd/MM/yyyy",
//   "es-PE" : "dd/MM/yyyy",
//   "ar-JO" : "dd/MM/yyyy",
//   "en-TT" : "dd/MM/yyyy",
//   "es-AR" : "dd/MM/yyyy",
//   "ar-LB" : "dd/MM/yyyy",
//   "en-ZW" : "M/d/yyyy",
//   "es-EC" : "dd/MM/yyyy",
//   "ar-KW" : "dd/MM/yyyy",
//   "en-PH" : "M/d/yyyy",
//   "es-CL" : "dd-MM-yyyy",
//   "ar-AE" : "dd/MM/yyyy",
//   "es-UY" : "dd/MM/yyyy",
//   "ar-BH" : "dd/MM/yyyy",
//   "es-PY" : "dd/MM/yyyy",
//   "ar-QA" : "dd/MM/yyyy",
//   "es-BO" : "dd/MM/yyyy",
//   "es-SV" : "dd/MM/yyyy",
//   "es-HN" : "dd/MM/yyyy",
//   "es-NI" : "dd/MM/yyyy",
//   "es-PR" : "dd/MM/yyyy",
//   "am-ET" : "d/M/yyyy",
//   "tzm-Latn-DZ" : "dd-MM-yyyy",
//   "iu-Latn-CA" : "d/MM/yyyy",
//   "sma-NO" : "dd.MM.yyyy",
//   "mn-Mong-CN" : "yyyy/M/d",
//   "gd-GB" : "dd/MM/yyyy",
//   "en-MY" : "d/M/yyyy",
//   "prs-AF" : "dd/MM/yy",
//   "bn-BD" : "dd-MM-yy",
//   "wo-SN" : "dd/MM/yyyy",
//   "rw-RW" : "M/d/yyyy",
//   "qut-GT" : "dd/MM/yyyy",
//   "sah-RU" : "MM.dd.yyyy",
//   "gsw-FR" : "dd/MM/yyyy",
//   "co-FR" : "dd/MM/yyyy",
//   "oc-FR" : "dd/MM/yyyy",
//   "mi-NZ" : "dd/MM/yyyy",
//   "ga-IE" : "dd/MM/yyyy",
//   "se-SE" : "yyyy-MM-dd",
//   "br-FR" : "dd/MM/yyyy",
//   "smn-FI" : "d.M.yyyy",
//   "moh-CA" : "M/d/yyyy",
//   "arn-CL" : "dd-MM-yyyy",
//   "ii-CN" : "yyyy/M/d",
//   "dsb-DE" : "d. M. yyyy",
//   "ig-NG" : "d/M/yyyy",
//   "kl-GL" : "dd-MM-yyyy",
//   "lb-LU" : "dd/MM/yyyy",
//   "ba-RU" : "dd.MM.yy",
//   "nso-ZA" : "yyyy/MM/dd",
//   "quz-BO" : "dd/MM/yyyy",
//   "yo-NG" : "d/M/yyyy",
//   "ha-Latn-NG" : "d/M/yyyy",
//   "fil-PH" : "M/d/yyyy",
//   "ps-AF" : "dd/MM/yy",
//   "fy-NL" : "d-M-yyyy",
//   "ne-NP" : "M/d/yyyy",
//   "se-NO" : "dd.MM.yyyy",
//   "iu-Cans-CA" : "d/M/yyyy",
//   "sr-Latn-RS" : "d.M.yyyy",
//   "si-LK" : "yyyy-MM-dd",
//   "sr-Cyrl-RS" : "d.M.yyyy",
//   "lo-LA" : "dd/MM/yyyy",
//   "km-KH" : "yyyy-MM-dd",
//   "cy-GB" : "dd/MM/yyyy",
//   "bo-CN" : "yyyy/M/d",
//   "sms-FI" : "d.M.yyyy",
//   "as-IN" : "dd-MM-yyyy",
//   "ml-IN" : "dd-MM-yy",
//   "en-IN" : "dd-MM-yyyy",
//   "or-IN" : "dd-MM-yy",
//   "bn-IN" : "dd-MM-yy",
//   "tk-TM" : "dd.MM.yy",
//   "bs-Latn-BA" : "d.M.yyyy",
//   "mt-MT" : "dd/MM/yyyy",
//   "sr-Cyrl-ME" : "d.M.yyyy",
//   "se-FI" : "d.M.yyyy",
//   "zu-ZA" : "yyyy/MM/dd",
//   "xh-ZA" : "yyyy/MM/dd",
//   "tn-ZA" : "yyyy/MM/dd",
//   "hsb-DE" : "d. M. yyyy",
//   "bs-Cyrl-BA" : "d.M.yyyy",
//   "tg-Cyrl-TJ" : "dd.MM.yy",
//   "sr-Latn-BA" : "d.M.yyyy",
//   "smj-NO" : "dd.MM.yyyy",
//   "rm-CH" : "dd/MM/yyyy",
//   "smj-SE" : "yyyy-MM-dd",
//   "quz-EC" : "dd/MM/yyyy",
//   "quz-PE" : "dd/MM/yyyy",
//   "hr-BA" : "d.M.yyyy.",
//   "sr-Latn-ME" : "d.M.yyyy",
//   "sma-SE" : "yyyy-MM-dd",
//   "en-SG" : "d/M/yyyy",
//   "ug-CN" : "yyyy-M-d",
//   "sr-Cyrl-BA" : "d.M.yyyy",
//   "es-US" : "M/d/yyyy"
// };
//
// Object.keys(formats).forEach(lang => {const period = getDayPeriods(lang); if (period.am === 'AM') return; console.log(lang, period )})
