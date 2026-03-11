/**
 * Tests for portugal-holidays
 * Includes verification against known dates from icalendario.pt for 2026, 2027, 2028.
 */

const {
  getEasterSunday,
  getNationalHolidays,
  getMunicipalHolidays,
  getHolidays,
  getMunicipalities,
  getDistricts,
  isHoliday,
} = require("../dist/index.cjs");

let passed = 0;
let failed = 0;

function assert(label, condition, info = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${info ? " — " + info : ""}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
console.log("\n=== Easter calculation ===");
assert("2024-03-31", getEasterSunday(2024).toISOString().slice(0, 10) === "2024-03-31");
assert("2025-04-20", getEasterSunday(2025).toISOString().slice(0, 10) === "2025-04-20");
assert("2026-04-05", getEasterSunday(2026).toISOString().slice(0, 10) === "2026-04-05");
assert("2027-03-28", getEasterSunday(2027).toISOString().slice(0, 10) === "2027-03-28");
assert("2028-04-16", getEasterSunday(2028).toISOString().slice(0, 10) === "2028-04-16");

// ---------------------------------------------------------------------------
console.log("\n=== National holidays ===");
const nat2026 = getNationalHolidays(2026);
assert("Returns array",                    Array.isArray(nat2026));
assert("13 mandatory holidays",            nat2026.length === 13);
assert("New Year's 2026-01-01",            nat2026.some(h => h.date === "2026-01-01"));
assert("Freedom Day 2026-04-25",           nat2026.some(h => h.date === "2026-04-25"));
assert("Corpus Christi 2026-06-04",        nat2026.some(h => h.date === "2026-06-04")); // Easter+60
assert("Christmas 2026-12-25",             nat2026.some(h => h.date === "2026-12-25"));
assert("Good Friday 2026-04-03",           nat2026.some(h => h.date === "2026-04-03")); // Easter-2
assert("Carnival excluded by default",     !nat2026.some(h => h.namePt.includes("Carnaval")));

const natWithCarnival = getNationalHolidays(2026, { includeOptional: true });
assert("Carnival 2026 included",           natWithCarnival.some(h => h.date === "2026-02-17")); // 47 days before Easter

// ---------------------------------------------------------------------------
console.log("\n=== Municipality count ===");
const muns = getMunicipalities();
assert("At least 300 municipalities",      muns.length >= 300, `got ${muns.length}`);
assert("Sorted",                           muns.every((m, i) => i === 0 || m >= muns[i - 1]));

// ---------------------------------------------------------------------------
console.log("\n=== District filter ===");
const porto2026 = getMunicipalHolidays(2026, { district: "Porto" });
assert("Porto district returns results",   porto2026.length > 0);
assert("All from Porto district",          porto2026.every(h => h.district === "Porto"));

const districts = getDistricts();
assert("Has Lisboa district",              districts.includes("Lisboa"));
assert("Has Açores district",             districts.includes("Açores"));
assert("Has Madeira district",             districts.includes("Madeira"));

// ---------------------------------------------------------------------------
console.log("\n=== Fixed-date municipal holidays ===");
// Verified against icalendario.pt 2026 column
const mun2026 = getMunicipalHolidays(2026);

function check(mun, expected) {
  const h = mun2026.find(x => x.municipality === mun);
  const ok = h && h.date === expected;
  assert(`${mun} = ${expected}`, ok, h ? `got ${h.date}` : "not found");
}

check("Lisboa",       "2026-06-13"); // Santo António — fixed
check("Porto",        "2026-06-24"); // São João — fixed
check("Coimbra",      "2026-07-04"); // Santa Isabel — fixed
check("Aveiro",       "2026-05-12"); // Santa Joana — fixed
check("Braga",        "2026-06-24"); // São João — fixed
check("Faro",         "2026-09-07"); // Elevation — fixed (Sunday)
check("Setúbal",      "2026-09-15"); // Bocage — fixed
check("Viseu",        "2026-09-21"); // São Mateus — fixed
check("Funchal",      "2026-08-21"); // Elevation — fixed
check("Portimão",     "2026-12-11"); // Elevation — fixed
check("Elvas",        "2026-01-14"); // Batalha — fixed
check("Óbidos",       "2026-01-11"); // Taking of Óbidos — fixed

// ---------------------------------------------------------------------------
console.log("\n=== Moveable municipal holidays — 2026 ===");

// Easter Monday (Easter+1): 2026-04-06
function checkEasterMon(mun) {
  const h = mun2026.find(x => x.municipality === mun);
  assert(`${mun} Easter Monday = 2026-04-06`, h && h.date === "2026-04-06", h ? `got ${h.date}` : "not found");
}
checkEasterMon("Avis");
checkEasterMon("Borba");
checkEasterMon("Caminha");
checkEasterMon("Cuba");
checkEasterMon("Ílhavo");
checkEasterMon("Mação");
checkEasterMon("Mora");
checkEasterMon("Penamacor");
checkEasterMon("Ponte de Sor");
checkEasterMon("Portel");
checkEasterMon("Redondo");

// Ascension Thursday (Easter+39): 2026-05-14
function checkAscension(mun) {
  const h = mun2026.find(x => x.municipality === mun);
  assert(`${mun} Ascension = 2026-05-14`, h && h.date === "2026-05-14", h ? `got ${h.date}` : "not found");
}
checkAscension("Alenquer");
checkAscension("Almeirim");
checkAscension("Beja");
checkAscension("Loulé");
checkAscension("Mafra");
checkAscension("Torres Novas");
checkAscension("Vouzela");

// Pentecost Monday (Easter+50): 2026-05-25
const agueda2026 = mun2026.find(x => x.municipality === "Águeda");
assert("Águeda Pentecost = 2026-05-25", agueda2026 && agueda2026.date === "2026-05-25",
  agueda2026 ? `got ${agueda2026.date}` : "not found");
const vagos2026 = mun2026.find(x => x.municipality === "Vagos");
assert("Vagos Pentecost = 2026-05-25",  vagos2026 && vagos2026.date === "2026-05-25",
  vagos2026 ? `got ${vagos2026.date}` : "not found");

// Whit Tuesday for Matosinhos (Easter+50): same date = 2026-05-26 (Easter+50=Mon, Matosinhos is +50 too — Tuesday = Easter+50)
// Wait: Matosinhos is "Terça-feira de Pentecostes" = Whit Tuesday = Easter+50 (Mon) +1 = Easter+51? No...
// Source says 2026-05-26 for Matosinhos. Easter 2026 = Apr 5. +50 = May 25 (Mon). +51 = May 26 (Tue). ✓
const matosinhos2026 = mun2026.find(x => x.municipality === "Matosinhos");
assert("Matosinhos Whit Tue = 2026-05-26", matosinhos2026 && matosinhos2026.date === "2026-05-26",
  matosinhos2026 ? `got ${matosinhos2026.date}` : "not found");

// Pascoela Monday (Easter+8): 2026-04-13
const alandroal2026 = mun2026.find(x => x.municipality === "Alandroal");
assert("Alandroal Pascoela = 2026-04-13", alandroal2026 && alandroal2026.date === "2026-04-13",
  alandroal2026 ? `got ${alandroal2026.date}` : "not found");
const sabugal2026 = mun2026.find(x => x.municipality === "Sabugal");
assert("Sabugal Pascoela = 2026-04-13",   sabugal2026 && sabugal2026.date === "2026-04-13",
  sabugal2026 ? `got ${sabugal2026.date}` : "not found");

// ---------------------------------------------------------------------------
console.log("\n=== Cross-check 2027 dates ===");
const mun2027 = getMunicipalHolidays(2027);
// Easter 2027 = Mar 28. +1=Mar 29 (Mon), +8=Apr 5 (Mon), +39=May 6 (Thu), +50=May 17 (Mon)
const avis2027 = mun2027.find(x => x.municipality === "Avis");
assert("Avis Easter Mon 2027 = 2027-03-29", avis2027 && avis2027.date === "2027-03-29",
  avis2027 ? `got ${avis2027.date}` : "not found");
const beja2027 = mun2027.find(x => x.municipality === "Beja");
assert("Beja Ascension 2027 = 2027-05-06",  beja2027 && beja2027.date === "2027-05-06",
  beja2027 ? `got ${beja2027.date}` : "not found");
const agueda2027 = mun2027.find(x => x.municipality === "Águeda");
assert("Águeda Pentecost 2027 = 2027-05-17", agueda2027 && agueda2027.date === "2027-05-17",
  agueda2027 ? `got ${agueda2027.date}` : "not found");
const alandroal2027 = mun2027.find(x => x.municipality === "Alandroal");
assert("Alandroal Pascoela 2027 = 2027-04-05", alandroal2027 && alandroal2027.date === "2027-04-05",
  alandroal2027 ? `got ${alandroal2027.date}` : "not found");

// ---------------------------------------------------------------------------
console.log("\n=== Cross-check 2028 dates ===");
const mun2028 = getMunicipalHolidays(2028);
// Easter 2028 = Apr 16. +1=Apr 17, +8=Apr 24, +39=May 25 (Thu), +50=Jun 5 (Mon)
const avis2028 = mun2028.find(x => x.municipality === "Avis");
assert("Avis Easter Mon 2028 = 2028-04-17", avis2028 && avis2028.date === "2028-04-17",
  avis2028 ? `got ${avis2028.date}` : "not found");
const beja2028 = mun2028.find(x => x.municipality === "Beja");
assert("Beja Ascension 2028 = 2028-05-25",  beja2028 && beja2028.date === "2028-05-25",
  beja2028 ? `got ${beja2028.date}` : "not found");
const agueda2028 = mun2028.find(x => x.municipality === "Águeda");
assert("Águeda Pentecost 2028 = 2028-06-05", agueda2028 && agueda2028.date === "2028-06-05",
  agueda2028 ? `got ${agueda2028.date}` : "not found");

// ---------------------------------------------------------------------------
console.log("\n=== isHoliday ===");
const xmas = isHoliday("2026-12-25");
assert("Christmas is holiday",             xmas.isHoliday);

const notHoliday = isHoliday("2026-03-03");
assert("Random day is not a holiday",      !notHoliday.isHoliday);

const santoAntonio = isHoliday("2026-06-13", { municipality: "Lisboa" });
assert("June 13 is holiday in Lisboa",     santoAntonio.isHoliday);

const santoAntonioPorto = isHoliday("2026-06-13", { municipality: "Porto" });
assert("June 13 is not a holiday in Porto",!santoAntonioPorto.isHoliday);

const dateObj = isHoliday(new Date("2026-04-25"));
assert("Accepts Date object",              dateObj.isHoliday);

// ---------------------------------------------------------------------------
console.log("\n=== getHolidays combined ===");
const all2026 = getHolidays(2026);
assert("Sorted by date",   all2026.every((h, i) => i === 0 || h.date >= all2026[i - 1].date));
assert("Has national",     all2026.some(h => h.type === "national"));
assert("Has municipal",    all2026.some(h => h.type === "municipal"));

const allLisboa = getHolidays(2026, { municipality: "Lisboa" });
assert("Lisboa has national + municipal",  allLisboa.some(h => h.type === "national") && allLisboa.some(h => h.type === "municipal"));



// ---------------------------------------------------------------------------
console.log("\n=== Timezone safety ===");
// Simulate what happens when a Date object is at midnight local time.
// toISOString() would return the previous day in UTC-1 or further west.
// Our fix uses local date components so it must always return the correct day.

// Christmas at exactly midnight local time
const xmasDate = new Date(2025, 11, 25, 0, 0, 0); // local midnight
const xmasTz = isHoliday(xmasDate);
assert("Christmas Date at local midnight is a holiday", xmasTz.isHoliday,
  `date resolved to ${xmasDate.toISOString()} UTC, local: 2025-12-25`);

// Porto's São João at local midnight
const saoJoaoDate = new Date(2025, 5, 24, 0, 0, 0);
const saoJoaoTz = isHoliday(saoJoaoDate, { municipality: "Porto" });
assert("São João Date at local midnight is a holiday in Porto", saoJoaoTz.isHoliday);

// formatHoliday dates should match local components, not UTC
const h = getNationalHolidays(2025).find(x => x.name === "Christmas Day");
const expected = (() => {
  const d = new Date(2025, 11, 25);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
})();
assert("Holiday date string uses local date components", h.date === expected,
  `got ${h.date}, expected ${expected}`);

// ---------------------------------------------------------------------------
console.log(`\n==============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
