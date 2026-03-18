# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-18

### BREAKING CHANGES

**All public API methods now return Date objects instead of ISO 8601 strings**

- `Holiday.date` is now a `Date` object representing midnight (00:00:00) in Europe/Lisbon timezone
- `getNationalHolidays()`, `getMunicipalHolidays()`, and `getHolidays()` return `Holiday[]` with Date objects
- `isHoliday()` still accepts both Date objects and strings, but returns Holiday objects with Date fields
- `getEasterSunday()` continues to return a Date object (no change)

### Migration Guide

To get ISO 8601 strings (v1.0.0 format):

```javascript
const holidays = getHolidays(2025);
const isoString = holidays[0].date.toISOString().slice(0, 10); // "2025-01-01"
```

To format dates for display:

```javascript
const formatted = holidays[0].date.toLocaleDateString('pt-PT'); // "01/01/2025"
```

### Added

- `TimezoneOptions` interface for future timezone conversion support (currently not implemented)
- `createPortugalDate()` utility to create dates at midnight Portugal time

### Changed

- Updated sorting logic to use `Date.getTime()` comparison instead of string comparison
- Improved timezone safety by consistently using local date components

### Internal

- Zero runtime dependencies maintained
- All 79+ tests updated and passing
- Full TypeScript type definitions updated

---

## [1.0.0] - 2026-03-10

### Added

- `getNationalHolidays(year, options)` — returns all 13 mandatory Portuguese national holidays, with optional Carnival Tuesday
- `getMunicipalHolidays(year, options)` — returns municipal holidays for all 308 municipalities, filterable by `municipality` or `district`
- `getHolidays(year, options)` — combined national + municipal holidays, sorted by date
- `getMunicipalities()` — sorted list of all 308 municipality names
- `getDistricts()` — sorted list of all district names (including Açores and Madeira)
- `isHoliday(date, options)` — check whether a specific date is a holiday
- `getEasterSunday(year)` — compute Easter Sunday for any year (1583–2299)
- Full support for moveable municipal holidays: Easter Monday, Ascension Thursday, Pentecost Monday, Pascoela Monday, and nearest-Monday rules
- Data source: [icalendario.pt](https://icalendario.pt/feriados/municipais/), verified in 2026, 2027, and 2028
