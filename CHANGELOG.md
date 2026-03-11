# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Data source: [icalendario.pt](https://icalendario.pt/feriados/municipais/), verified against 2026, 2027, and 2028
