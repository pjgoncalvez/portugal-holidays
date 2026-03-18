# portugal-holidays

[![CI](https://github.com/pjgoncalvez/portugal-holidays/actions/workflows/ci.yml/badge.svg)](https://github.com/pjgoncalvez/portugal-holidays/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/portugal-holidays.svg)](https://www.npmjs.com/package/portugal-holidays)
[![npm downloads](https://img.shields.io/npm/dm/portugal-holidays.svg)](https://www.npmjs.com/package/portugal-holidays)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

> NPM package for Portuguese public holidays — national and municipal (_feriados nacionais e municipais_). Written in TypeScript with full type definitions included.

## Background

Portugal has 13 mandatory national public holidays plus one optional (Carnival), established in the Labour Code. In addition, each of the country's 308 In the README file, there's a badge for CI which is not being rendered. Check what's going on.municipalities celebrates a **feriado municipal** — a local public holiday tied to its patron saint, a historical date, or a civic milestone.

**Data source:** [icalendario.pt](https://icalendario.pt/feriados/municipais/) — verified against 2026, 2027, and 2028 dates.

---

## Installation

```bash
npm install portugal-holidays
```

---

## Quick Start

**CommonJS**

```js
const { getHolidays, isHoliday } = require('portugal-holidays');

// All holidays in 2025 - returns Date objects
const all = getHolidays(2025);
// [{ date: Date(2025-01-01T00:00:00), name: "New Year's Day", ... }, ...]

// To get ISO string format:
const isoString = all[0].date.toISOString().slice(0, 10); // "2025-01-01"

// To format for display:
const formatted = all[0].date.toLocaleDateString('pt-PT'); // "01/01/2025"

// Holidays for Porto only (national + Porto's municipal)
const porto = getHolidays(2025, { municipality: 'Porto' });

// Is a date a holiday in Lisboa?
const { isHoliday: yes, holidays } = isHoliday('2025-06-13', {
  municipality: 'Lisboa',
});
// yes === true  ->  St. Anthony's Day
// holidays[0].date is a Date object
```

**ES Modules**

```js
import { getHolidays, isHoliday } from 'portugal-holidays';
```

**TypeScript**

```ts
import {
  getHolidays,
  getNationalHolidays,
  getMunicipalHolidays,
  getMunicipalities,
  getDistricts,
  isHoliday,
  type Holiday,
  type HolidayOptions,
  type IsHolidayResult,
} from 'portugal-holidays';

const holidays: Holiday[] = getHolidays(2025, { municipality: 'Porto' });
```

---

## API

### `getHolidays(year, [options])` -> `Holiday[]`

Returns all national + municipal holidays for the given year, sorted by date.

| Option            | Type      | Default | Description                                                             |
| ----------------- | --------- | ------- | ----------------------------------------------------------------------- |
| `municipality`    | `string`  | —       | Filter municipal holidays by name (case-insensitive, partial match)     |
| `district`        | `string`  | —       | Filter municipal holidays by district (case-insensitive, partial match) |
| `includeOptional` | `boolean` | `false` | Include optional national holidays (Carnival Tuesday)                   |

```js
getHolidays(2025);
getHolidays(2025, { municipality: 'Braga' });
getHolidays(2025, { district: 'Porto' });
getHolidays(2025, { includeOptional: true });
```

---

### `getNationalHolidays(year, [options])` -> `Holiday[]`

Returns the 13 mandatory national public holidays (+ optional Carnival if requested).

```js
getNationalHolidays(2025);
getNationalHolidays(2025, { includeOptional: true });
```

| Date           | Holiday (EN)                | Feriado (PT)                 |
| -------------- | --------------------------- | ---------------------------- |
| 1 Jan          | New Year's Day              | Ano Novo                     |
| Good Friday    | Good Friday                 | Sexta-feira Santa            |
| Easter Sunday  | Easter Sunday               | Domingo de Páscoa            |
| 25 Apr         | Freedom Day                 | Dia da Liberdade             |
| 1 May          | Labour Day                  | Dia do Trabalhador           |
| Corpus Christi | Corpus Christi              | Corpo de Deus                |
| 10 Jun         | Portugal Day                | Dia de Portugal              |
| 15 Aug         | Assumption of Mary          | Assunção de Nossa Senhora    |
| 5 Oct          | Republic Day                | Implantação da República     |
| 1 Nov          | All Saints' Day             | Dia de Todos os Santos       |
| 1 Dec          | Restoration of Independence | Restauração da Independência |
| 8 Dec          | Immaculate Conception       | Imaculada Conceição          |
| 25 Dec         | Christmas Day               | Natal                        |
| _(Shrove Tue)_ | _Carnival (optional)_       | _Terça-feira de Carnaval_    |

---

### `getMunicipalHolidays(year, [options])` -> `Holiday[]`

Returns municipal holidays, optionally filtered by municipality or district.

```js
getMunicipalHolidays(2025);
getMunicipalHolidays(2025, { municipality: 'Lisboa' });
getMunicipalHolidays(2025, { district: 'Braga' });
```

---

### `getMunicipalities()` -> `string[]`

Returns a sorted list of all 308 municipality names in the dataset.

```js
getMunicipalities();
// ['Abrantes', 'Águeda', 'Aguiar da Beira', ..., 'Vouzela']
```

---

### `getDistricts()` -> `string[]`

Returns a sorted list of all district names (includes Açores and Madeira).

```js
getDistricts();
// ['Açores', 'Aveiro', 'Beja', ..., 'Viseu']
```

---

### `isHoliday(date, [options])` -> `IsHolidayResult`

Checks whether a given date is a public holiday. Accepts a `Date` object or an ISO 8601 string.

```js
isHoliday('2025-04-25');
// { isHoliday: true, holidays: [{ date: Date(2025-04-25T00:00:00), name: 'Freedom Day', ... }] }

isHoliday('2025-06-24', { municipality: 'Porto' });
// { isHoliday: true, holidays: [{ date: Date(2025-06-24T00:00:00), name: "St. John the Baptist", ... }] }

isHoliday('2025-06-24', { municipality: 'Lisboa' });
// { isHoliday: false, holidays: [] }
```

---

### `getEasterSunday(year)` -> `Date`

Returns the date of Easter Sunday for any given year (Gregorian calendar, Anonymous Gregorian algorithm). Supports years 1583-2299.

```js
getEasterSunday(2025); // Date: Sun Apr 20 2025
```

---

## Holiday Object

```ts
interface Holiday {
  date: Date; // Date object at midnight Europe/Lisbon time
  name: string; // English name
  namePt: string; // Portuguese name
  type: HolidayType; // "national" | "municipal"
  municipality?: string; // present for municipal holidays
  district?: string; // present for municipal holidays
  rule?: RuleType; // rule used to compute the date (municipal only)
}

type HolidayType = 'national' | 'municipal';
type RuleType =
  | 'fixed'
  | 'easter'
  | 'ascension'
  | 'pentecost'
  | 'pascoela'
  | 'nearest_mon';
```

---

## How Municipal Holidays Are Computed

Municipal holidays are not all fixed — several depend on Easter:

| Rule          | Description                       | Example municipalities                           |
| ------------- | --------------------------------- | ------------------------------------------------ |
| `fixed`       | Same month/day every year         | Lisboa (Jun 13), Porto (Jun 24), Coimbra (Jul 4) |
| `easter`      | Offset from Easter Sunday         | Easter Monday (+1): Avis, Borba, Ílhavo, Mora... |
| `ascension`   | Easter + 39 days (Thu)            | Beja, Loulé, Mafra, Torres Novas, Vouzela...     |
| `pentecost`   | Easter + 50 days (Mon)            | Águeda, Vagos                                    |
| `pascoela`    | Easter + 8 days (Mon)             | Alandroal, Monforte, Sabugal                     |
| `nearest_mon` | Monday on or after a fixed anchor | Gondomar, Lousada, Maia, Moita, Peniche...       |

---

## Coverage

All **308 Portuguese municipalities** are covered, spanning:

- **Portugal Continental** — all 18 districts
- **Região Autónoma dos Açores** — all 9 islands' municipalities
- **Região Autónoma da Madeira** — all municipalities

Data sourced from [icalendario.pt](https://icalendario.pt/feriados/municipais/) and cross-verified against the 2026, 2027, and 2028 published dates.

---

## Migration from v1.x to v2.0

### Breaking Change: Date Objects Instead of Strings

v2.0 returns Date objects instead of ISO 8601 strings for all holiday dates.

**Before (v1.x):**

```js
const holidays = getHolidays(2025);
console.log(holidays[0].date); // "2025-01-01" (string)
if (holidays[0].date === "2025-01-01") { /* ... */ }
```

**After (v2.0):**

```js
const holidays = getHolidays(2025);
console.log(holidays[0].date); // Date object

// Get ISO string:
const isoStr = holidays[0].date.toISOString().slice(0, 10); // "2025-01-01"

// Compare dates:
if (holidays[0].date.getTime() === new Date(2025, 0, 1).getTime()) { /* ... */ }

// Or use comparison string:
const dateStr = holidays[0].date.toISOString().slice(0, 10);
if (dateStr === "2025-01-01") { /* ... */ }
```

### Migration Checklist

- [ ] Update code that accesses `.date` property to handle Date objects
- [ ] Replace string comparisons with Date comparisons or convert to strings
- [ ] Use `.toISOString().slice(0, 10)` to get YYYY-MM-DD format
- [ ] Use `.toLocaleDateString()` for localized formatting
- [ ] Update TypeScript types if using typed code

---

## Contributing

Contributions are welcome! If you spot a date that's wrong or a municipality that's missing:

1. Fork the repository
2. Create a branch: `git checkout -b fix/municipality-name`
3. Update `src/municipalities.json` with the corrected or new entry
4. Add or update a test in `test/index.test.js` that verifies the date against the real calendar
5. Run `npm test` to confirm all tests pass
6. Open a pull request

For corrections, please cite a source (e.g. the municipality's official website or câmara municipal).

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

[MIT](LICENSE)
