import moment from 'moment'
import type { LocaleSpecification, RelativeTimeKey, RelativeTimeSpec } from 'moment'

const plural = (word: any, num: number): string => {
  const forms = word.split('_')
  return num % 10 === 1 && num % 100 !== 11
    ? forms[0]
    : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
      ? forms[1]
      : forms[2]
}

const relativeTimeWithPlural = (n: string, withoutSuffix: boolean, key: RelativeTimeKey): string => {
  const format: RelativeTimeSpec = {
    ss: withoutSuffix ? 'секунда_секунды_секунд' : 'секунду_секунды_секунд',
    mm: withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
    hh: 'час_часа_часов',
    dd: 'день_дня_дней',
    ww: 'неделя_недели_недель',
    MM: 'месяц_месяца_месяцев',
    yy: 'год_года_лет',
  }

  if (key === 'm') return withoutSuffix ? 'минута' : 'минуту'
  return `${n} ${plural(format[key], +n)}`
}

const monthsParse = [
  /^янв/i,
  /^фев/i,
  /^мар/i,
  /^апр/i,
  /^ма[йя]/i,
  /^июн/i,
  /^июл/i,
  /^авг/i,
  /^сен/i,
  /^окт/i,
  /^ноя/i,
  /^дек/i,
]

const config: LocaleSpecification = {
  months: {
    format: 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_'),
    standalone: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
  },
  monthsShort: {
    format: 'янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.'.split('_'),
    standalone: 'янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.'.split('_'),
  },
  weekdays: {
    standalone: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
    format: 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_'),
    isFormat: /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?] ?dddd/,
  },
  weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
  weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
  monthsParse,
  longMonthsParse: monthsParse,
  shortMonthsParse: monthsParse,
  monthsRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,
  monthsShortRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,
  monthsStrictRegex: /^(январ[яь]|феврал[яь]|марта?|апрел[яь]|ма[яй]|июн[яь]|июл[яь]|августа?|сентябр[яь]|октябр[яь]|ноябр[яь]|декабр[яь])/i,
  monthsShortStrictRegex: /^(янв\.|февр?\.|мар[т.]|апр\.|ма[яй]|июн[ья.]|июл[ья.]|авг\.|сент?\.|окт\.|нояб?\.|дек\.)/i,
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY г.',
    LLL: 'D MMMM YYYY г., H:mm',
    LLLL: 'dddd, D MMMM YYYY г., H:mm',
  },
  calendar: {
    sameDay: '[Сегодня, в] LT',
    nextDay: '[Завтра, в] LT',
    lastDay: '[Вчера, в] LT',
    // @ts-expect-error: method
    nextWeek(now: any) {
      // @ts-expect-error: method
      if (now.week() !== this.week()) {
        // @ts-expect-error: method
        switch (this.day()) {
          case 0:
            return '[В следующее] dddd, [в] LT'
          case 1:
          case 2:
          case 4:
            return '[В следующий] dddd, [в] LT'
          case 3:
          case 5:
          case 6:
            return '[В следующую] dddd, [в] LT'
        }
      } else {
        // @ts-expect-error: method
        if (this.day() === 2) return '[Во] dddd, [в] LT'
        return '[В] dddd, [в] LT'
      }
    },
    // @ts-expect-error: method
    lastWeek(now) {
      // @ts-expect-error: method
      if (now.week() !== this.week()) {
        // @ts-expect-error: method
        switch (this.day()) {
          case 0:
            return '[В прошлое] dddd, [в] LT'
          case 1:
          case 2:
          case 4:
            return '[В прошлый] dddd, [в] LT'
          case 3:
          case 5:
          case 6:
            return '[В прошлую] dddd, [в] LT'
        }
      } else {
        // @ts-expect-error: method
        if (this.day() === 2) return '[Во] dddd, [в] LT'
        return '[В] dddd, [в] LT'
      }
    },
    sameElse: 'L',
  },
  relativeTime: {
    future: 'через %s',
    past: '%s назад',
    s: 'несколько секунд',
    // @ts-expect-error: type
    ss: relativeTimeWithPlural,
    // @ts-expect-error: type
    m: relativeTimeWithPlural,
    // @ts-expect-error: type
    mm: relativeTimeWithPlural,
    h: 'час',
    // @ts-expect-error: type
    hh: relativeTimeWithPlural,
    d: 'день',
    // @ts-expect-error: type
    dd: relativeTimeWithPlural,
    w: 'неделя',
    // @ts-expect-error: type
    ww: relativeTimeWithPlural,
    M: 'месяц',
    // @ts-expect-error: type
    MM: relativeTimeWithPlural,
    y: 'год',
    // @ts-expect-error: type
    yy: relativeTimeWithPlural,
  },
  meridiemParse: /ночи|утра|дня|вечера/i,
  isPM(input: string) {
    return /^(дня|вечера)$/.test(input)
  },
  meridiem(hour: number) {
    if (hour < 4) return 'ночи'
    else if (hour < 12) return 'утра'
    else if (hour < 17) return 'дня'
    else return 'вечера'
  },
  dayOfMonthOrdinalParse: /\d{1,2}-(й|го|я)/,
  // @ts-expect-error: type
  ordinal(number: string, period: string): string {
    switch (period) {
      case 'M':
      case 'd':
      case 'DDD':
        return `${number}-й`
      case 'D':
        return `${number}-го`
      case 'w':
      case 'W':
        return `${number}-я`
      default:
        return number
    }
  },
  week: {
    dow: 1,
    doy: 4,
  },
}

moment.locale('ru', config)

export default moment
