/**
 * portugal-holidays
 * Returns national and municipal holidays in Portugal.
 *
 * Municipal holiday rules are sourced from icalendario.pt which lists all 308
 * Portuguese municipalities. Many municipal holidays are moveable — they depend
 * on Easter, Ascension Thursday, Pentecost, or similar Easter-relative dates.
 *
 * Holiday rule types:
 *   fixed        – same month/day every year
 *   easter       – offset in days from Easter Sunday (e.g. +1 = Easter Monday)
 *   ascension    – Ascension Thursday = Easter + 39
 *   pentecost    – Whit Monday = Easter + 50
 *   pascoela     – Monday of Pascoela = Easter + 8
 *   nearest_mon  – nearest Monday on or after a fixed anchor date
 */

import MUNICIPALITIES_RAW from "./municipalities.json";

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type FixedRule      = { type: "fixed";       month: number; day: number };
type EasterRule     = { type: "easter";      offset: number };
type SimpleRule     = { type: "ascension" | "pentecost" | "pascoela" };
type NearestMonRule = { type: "nearest_mon"; month: number; day: number };
type MunicipalityRule = FixedRule | EasterRule | SimpleRule | NearestMonRule;

interface MunicipalityData {
  municipality: string;
  district:     string;
  name:         string;
  namePt:       string;
  rule:         MunicipalityRule;
}

interface RawHolidayInput {
  date:          Date;
  name:          string;
  namePt:        string;
  type:          HolidayType;
  municipality?: string;
  district?:     string;
  rule?:         MunicipalityRule;
  optional?:     boolean;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Whether a holiday is a national or municipal one. */
export type HolidayType = "national" | "municipal";

/** The rule type that determines how a holiday date is computed. */
export type RuleType = MunicipalityRule["type"];

/** A resolved holiday entry returned by all public API functions. */
export interface Holiday {
  /** ISO 8601 date string (YYYY-MM-DD) in local time. */
  date:           string;
  name:           string;
  namePt:         string;
  type:           HolidayType;
  municipality?:  string;
  district?:      string;
  /** The rule type used to compute this date (municipal holidays only). */
  rule?:          RuleType;
}

export interface NationalOptions {
  /** Include optional holidays such as Carnival Tuesday. Default: false. */
  includeOptional?: boolean;
}

export interface MunicipalOptions {
  /** Filter by municipality name (case-insensitive, partial match). */
  municipality?: string;
  /** Filter by district name (case-insensitive, partial match). */
  district?: string;
}

export interface HolidayOptions extends NationalOptions, MunicipalOptions {}

export interface IsHolidayResult {
  isHoliday: boolean;
  holidays:  Holiday[];
}

const MUNICIPALITIES = MUNICIPALITIES_RAW as MunicipalityData[];

// ---------------------------------------------------------------------------
// Easter calculation (Anonymous Gregorian algorithm)
// ---------------------------------------------------------------------------

export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nearestMonday(year: number, month: number, day: number): Date {
  const d   = new Date(year, month - 1, day);
  const dow = d.getDay();
  const diff = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  return addDays(d, diff);
}

function resolveDate(rule: MunicipalityRule, year: number): Date {
  const easter = getEasterSunday(year);
  switch (rule.type) {
    case "fixed":       return new Date(year, rule.month - 1, rule.day);
    case "easter":      return addDays(easter, rule.offset);
    case "ascension":   return addDays(easter, 39);
    case "pentecost":   return addDays(easter, 50);
    case "pascoela":    return addDays(easter, 8);
    case "nearest_mon": return nearestMonday(year, rule.month, rule.day);
  }
}

// ---------------------------------------------------------------------------
// Local-date helper — avoids UTC offset shifting the date string
// ---------------------------------------------------------------------------

function toLocalDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

function formatHoliday({ date, name, namePt, type, municipality, district, rule }: RawHolidayInput): Holiday {
  const out: Holiday = {
    date: toLocalDateString(date),
    name,
    namePt,
    type,
  };
  if (municipality) out.municipality = municipality;
  if (district)     out.district     = district;
  if (rule)         out.rule         = rule.type;
  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns Portuguese national public holidays for a given year.
 * @param year  Full calendar year (e.g. 2026).
 * @param options  Pass `{ includeOptional: true }` to include Carnival Tuesday.
 */
export function getNationalHolidays(year: number, { includeOptional = false }: NationalOptions = {}): Holiday[] {
  const easter = getEasterSunday(year);
  const holidays: RawHolidayInput[] = [
    { date: new Date(year, 0,  1),   name: "New Year's Day",             namePt: "Ano Novo",                                                         type: "national" },
    { date: addDays(easter, -47),    name: "Carnival Tuesday",            namePt: "Terça-feira de Carnaval",                                          type: "national", optional: true },
    { date: addDays(easter, -2),     name: "Good Friday",                 namePt: "Sexta-feira Santa",                                                type: "national" },
    { date: easter,                  name: "Easter Sunday",               namePt: "Domingo de Páscoa",                                                type: "national" },
    { date: new Date(year, 3,  25),  name: "Freedom Day",                 namePt: "Dia da Liberdade",                                                 type: "national" },
    { date: new Date(year, 4,  1),   name: "Labour Day",                  namePt: "Dia do Trabalhador",                                               type: "national" },
    { date: addDays(easter, 60),     name: "Corpus Christi",              namePt: "Corpo de Deus",                                                    type: "national" },
    { date: new Date(year, 5,  10),  name: "Portugal Day",                namePt: "Dia de Portugal, de Camões e das Comunidades Portuguesas",        type: "national" },
    { date: new Date(year, 7,  15),  name: "Assumption of Mary",          namePt: "Assunção de Nossa Senhora",                                        type: "national" },
    { date: new Date(year, 9,  5),   name: "Republic Day",                namePt: "Implantação da República",                                         type: "national" },
    { date: new Date(year, 10, 1),   name: "All Saints' Day",             namePt: "Dia de Todos os Santos",                                           type: "national" },
    { date: new Date(year, 11, 1),   name: "Restoration of Independence", namePt: "Restauração da Independência",                                     type: "national" },
    { date: new Date(year, 11, 8),   name: "Immaculate Conception",       namePt: "Imaculada Conceição",                                              type: "national" },
    { date: new Date(year, 11, 25),  name: "Christmas Day",               namePt: "Natal",                                                            type: "national" },
  ];
  return holidays
    .filter(h => !h.optional || includeOptional)
    .map(h => formatHoliday(h));
}

/**
 * Returns municipal holidays for a given year, optionally filtered.
 * @param year  Full calendar year (e.g. 2026).
 * @param options  Filter by `municipality` or `district` name.
 */
export function getMunicipalHolidays(year: number, { municipality, district }: MunicipalOptions = {}): Holiday[] {
  let entries = MUNICIPALITIES;
  if (municipality) {
    const q = municipality.toLowerCase();
    entries = entries.filter(e => e.municipality.toLowerCase().includes(q));
  }
  if (district) {
    const q = district.toLowerCase();
    entries = entries.filter(e => e.district.toLowerCase().includes(q));
  }
  return entries
    .map(entry => formatHoliday({ ...entry, date: resolveDate(entry.rule, year), type: "municipal" }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns all holidays (national + municipal) for a given year, sorted by date.
 * @param year  Full calendar year (e.g. 2026).
 * @param options  Combined national and municipal filter options.
 */
export function getHolidays(year: number, options: HolidayOptions = {}): Holiday[] {
  return [
    ...getNationalHolidays(year, options),
    ...getMunicipalHolidays(year, options),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns a sorted list of all municipality names.
 */
export function getMunicipalities(): string[] {
  return [...new Set(MUNICIPALITIES.map(e => e.municipality))].sort();
}

/**
 * Returns a sorted list of all district names.
 */
export function getDistricts(): string[] {
  return [...new Set(MUNICIPALITIES.map(e => e.district))].sort();
}

/**
 * Checks whether a given date is a public holiday.
 * @param date  A `Date` object or an ISO 8601 date string (YYYY-MM-DD).
 * @param options  Filter options (municipality, district, includeOptional).
 */
export function isHoliday(date: Date | string, options: HolidayOptions = {}): IsHolidayResult {
  const d = typeof date === "string" ? date.slice(0, 10) : toLocalDateString(date);
  const year = parseInt(d.slice(0, 4), 10);
  const holidays = getHolidays(year, options).filter(h => h.date === d);
  return { isHoliday: holidays.length > 0, holidays };
}
