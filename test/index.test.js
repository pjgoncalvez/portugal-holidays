/**
 * Tests for portugal-holidays
 * Includes verification against known dates from icalendario.pt for 2026, 2027, 2028.
 */

import { describe, it, expect } from 'vitest';
import {
  getEasterSunday,
  getNationalHolidays,
  getMunicipalHolidays,
  getHolidays,
  getMunicipalities,
  getDistricts,
  isHoliday,
} from '../dist/index.mjs';

// Helper to convert Date to YYYY-MM-DD string for comparison
function toDateString(date) {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Helper to check if Date matches expected year, month, day
function dateEquals(date, year, month, day) {
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

describe('Easter calculation', () => {
  it('should calculate Easter Sunday for 2024', () => {
    expect(toDateString(getEasterSunday(2024))).toBe("2024-03-31");
  });

  it('should calculate Easter Sunday for 2025', () => {
    expect(toDateString(getEasterSunday(2025))).toBe("2025-04-20");
  });

  it('should calculate Easter Sunday for 2026', () => {
    expect(toDateString(getEasterSunday(2026))).toBe("2026-04-05");
  });

  it('should calculate Easter Sunday for 2027', () => {
    expect(toDateString(getEasterSunday(2027))).toBe("2027-03-28");
  });

  it('should calculate Easter Sunday for 2028', () => {
    expect(toDateString(getEasterSunday(2028))).toBe("2028-04-16");
  });
});

describe('National holidays', () => {
  const nat2026 = getNationalHolidays(2026);

  it('should return an array', () => {
    expect(Array.isArray(nat2026)).toBe(true);
  });

  it('should return 13 mandatory holidays', () => {
    expect(nat2026).toHaveLength(13);
  });

  it('should include New Year\'s Day on 2026-01-01', () => {
    expect(nat2026.some(h => toDateString(h.date) === "2026-01-01")).toBe(true);
  });

  it('should include Freedom Day on 2026-04-25', () => {
    expect(nat2026.some(h => toDateString(h.date) === "2026-04-25")).toBe(true);
  });

  it('should include Corpus Christi on 2026-06-04 (Easter+60)', () => {
    expect(nat2026.some(h => toDateString(h.date) === "2026-06-04")).toBe(true);
  });

  it('should include Christmas on 2026-12-25', () => {
    expect(nat2026.some(h => toDateString(h.date) === "2026-12-25")).toBe(true);
  });

  it('should include Good Friday on 2026-04-03 (Easter-2)', () => {
    expect(nat2026.some(h => toDateString(h.date) === "2026-04-03")).toBe(true);
  });

  it('should exclude Carnival by default', () => {
    expect(nat2026.some(h => h.namePt.includes("Carnaval"))).toBe(false);
  });

  it('should include Carnival when includeOptional is true', () => {
    const natWithCarnival = getNationalHolidays(2026, { includeOptional: true });
    expect(natWithCarnival.some(h => toDateString(h.date) === "2026-02-17")).toBe(true);
  });
});

describe('Municipality count', () => {
  const muns = getMunicipalities();

  it('should return at least 300 municipalities', () => {
    expect(muns.length).toBeGreaterThanOrEqual(300);
  });

  it('should return municipalities sorted alphabetically', () => {
    const sorted = muns.every((m, i) => i === 0 || m >= muns[i - 1]);
    expect(sorted).toBe(true);
  });
});

describe('District filter', () => {
  it('should return results for Porto district', () => {
    const porto2026 = getMunicipalHolidays(2026, { district: "Porto" });
    expect(porto2026.length).toBeGreaterThan(0);
  });

  it('should return only Porto district holidays', () => {
    const porto2026 = getMunicipalHolidays(2026, { district: "Porto" });
    expect(porto2026.every(h => h.district === "Porto")).toBe(true);
  });

  it('should include Lisboa district', () => {
    const districts = getDistricts();
    expect(districts).toContain("Lisboa");
  });

  it('should include Açores district', () => {
    const districts = getDistricts();
    expect(districts).toContain("Açores");
  });

  it('should include Madeira district', () => {
    const districts = getDistricts();
    expect(districts).toContain("Madeira");
  });
});

describe('Fixed-date municipal holidays', () => {
  const mun2026 = getMunicipalHolidays(2026);

  const testCases = [
    { municipality: "Lisboa", expectedDate: "2026-06-13" },
    { municipality: "Porto", expectedDate: "2026-06-24" },
    { municipality: "Coimbra", expectedDate: "2026-07-04" },
    { municipality: "Aveiro", expectedDate: "2026-05-12" },
    { municipality: "Braga", expectedDate: "2026-06-24" },
    { municipality: "Faro", expectedDate: "2026-09-07" },
    { municipality: "Setúbal", expectedDate: "2026-09-15" },
    { municipality: "Viseu", expectedDate: "2026-09-21" },
    { municipality: "Funchal", expectedDate: "2026-08-21" },
    { municipality: "Portimão", expectedDate: "2026-12-11" },
    { municipality: "Elvas", expectedDate: "2026-01-14" },
    { municipality: "Óbidos", expectedDate: "2026-01-11" },
  ];

  testCases.forEach(({ municipality, expectedDate }) => {
    it(`should have ${municipality} on ${expectedDate}`, () => {
      const h = mun2026.find(x => x.municipality === municipality);
      expect(h).toBeDefined();
      expect(toDateString(h.date)).toBe(expectedDate);
    });
  });
});

describe('Moveable municipal holidays - 2026', () => {
  const mun2026 = getMunicipalHolidays(2026);

  describe('Easter Monday (Easter+1): 2026-04-06', () => {
    const municipalities = ["Avis", "Borba", "Caminha", "Cuba", "Ílhavo", "Mação", "Mora", "Penamacor", "Ponte de Sor", "Portel", "Redondo"];

    municipalities.forEach(municipality => {
      it(`should have ${municipality} Easter Monday on 2026-04-06`, () => {
        const h = mun2026.find(x => x.municipality === municipality);
        expect(h).toBeDefined();
        expect(toDateString(h.date)).toBe("2026-04-06");
      });
    });
  });

  describe('Ascension Thursday (Easter+39): 2026-05-14', () => {
    const municipalities = ["Alenquer", "Almeirim", "Beja", "Loulé", "Mafra", "Torres Novas", "Vouzela"];

    municipalities.forEach(municipality => {
      it(`should have ${municipality} Ascension on 2026-05-14`, () => {
        const h = mun2026.find(x => x.municipality === municipality);
        expect(h).toBeDefined();
        expect(toDateString(h.date)).toBe("2026-05-14");
      });
    });
  });

  describe('Pentecost Monday (Easter+50): 2026-05-25', () => {
    it('should have Águeda Pentecost on 2026-05-25', () => {
      const agueda2026 = mun2026.find(x => x.municipality === "Águeda");
      expect(agueda2026).toBeDefined();
      expect(toDateString(agueda2026.date)).toBe("2026-05-25");
    });

    it('should have Vagos Pentecost on 2026-05-25', () => {
      const vagos2026 = mun2026.find(x => x.municipality === "Vagos");
      expect(vagos2026).toBeDefined();
      expect(toDateString(vagos2026.date)).toBe("2026-05-25");
    });
  });

  it('should have Matosinhos Whit Tuesday on 2026-05-26', () => {
    const matosinhos2026 = mun2026.find(x => x.municipality === "Matosinhos");
    expect(matosinhos2026).toBeDefined();
    expect(toDateString(matosinhos2026.date)).toBe("2026-05-26");
  });

  describe('Pascoela Monday (Easter+8): 2026-04-13', () => {
    it('should have Alandroal Pascoela on 2026-04-13', () => {
      const alandroal2026 = mun2026.find(x => x.municipality === "Alandroal");
      expect(alandroal2026).toBeDefined();
      expect(toDateString(alandroal2026.date)).toBe("2026-04-13");
    });

    it('should have Sabugal Pascoela on 2026-04-13', () => {
      const sabugal2026 = mun2026.find(x => x.municipality === "Sabugal");
      expect(sabugal2026).toBeDefined();
      expect(toDateString(sabugal2026.date)).toBe("2026-04-13");
    });
  });
});

describe('Cross-check 2027 dates', () => {
  const mun2027 = getMunicipalHolidays(2027);

  it('should have Avis Easter Monday on 2027-03-29', () => {
    const avis2027 = mun2027.find(x => x.municipality === "Avis");
    expect(avis2027).toBeDefined();
    expect(toDateString(avis2027.date)).toBe("2027-03-29");
  });

  it('should have Beja Ascension on 2027-05-06', () => {
    const beja2027 = mun2027.find(x => x.municipality === "Beja");
    expect(beja2027).toBeDefined();
    expect(toDateString(beja2027.date)).toBe("2027-05-06");
  });

  it('should have Águeda Pentecost on 2027-05-17', () => {
    const agueda2027 = mun2027.find(x => x.municipality === "Águeda");
    expect(agueda2027).toBeDefined();
    expect(toDateString(agueda2027.date)).toBe("2027-05-17");
  });

  it('should have Alandroal Pascoela on 2027-04-05', () => {
    const alandroal2027 = mun2027.find(x => x.municipality === "Alandroal");
    expect(alandroal2027).toBeDefined();
    expect(toDateString(alandroal2027.date)).toBe("2027-04-05");
  });
});

describe('Cross-check 2028 dates', () => {
  const mun2028 = getMunicipalHolidays(2028);

  it('should have Avis Easter Monday on 2028-04-17', () => {
    const avis2028 = mun2028.find(x => x.municipality === "Avis");
    expect(avis2028).toBeDefined();
    expect(toDateString(avis2028.date)).toBe("2028-04-17");
  });

  it('should have Beja Ascension on 2028-05-25', () => {
    const beja2028 = mun2028.find(x => x.municipality === "Beja");
    expect(beja2028).toBeDefined();
    expect(toDateString(beja2028.date)).toBe("2028-05-25");
  });

  it('should have Águeda Pentecost on 2028-06-05', () => {
    const agueda2028 = mun2028.find(x => x.municipality === "Águeda");
    expect(agueda2028).toBeDefined();
    expect(toDateString(agueda2028.date)).toBe("2028-06-05");
  });
});

describe('isHoliday', () => {
  it('should return true for Christmas', () => {
    const xmas = isHoliday("2026-12-25");
    expect(xmas.isHoliday).toBe(true);
  });

  it('should return false for random day', () => {
    const notHoliday = isHoliday("2026-03-03");
    expect(notHoliday.isHoliday).toBe(false);
  });

  it('should return true for June 13 in Lisboa', () => {
    const santoAntonio = isHoliday("2026-06-13", { municipality: "Lisboa" });
    expect(santoAntonio.isHoliday).toBe(true);
  });

  it('should return false for June 13 in Porto', () => {
    const santoAntonioPorto = isHoliday("2026-06-13", { municipality: "Porto" });
    expect(santoAntonioPorto.isHoliday).toBe(false);
  });

  it('should accept Date object', () => {
    const dateObj = isHoliday(new Date("2026-04-25"));
    expect(dateObj.isHoliday).toBe(true);
  });
});

describe('getHolidays combined', () => {
  const all2026 = getHolidays(2026);

  it('should return holidays sorted by date', () => {
    const sorted = all2026.every((h, i) => i === 0 || h.date.getTime() >= all2026[i - 1].date.getTime());
    expect(sorted).toBe(true);
  });

  it('should include national holidays', () => {
    expect(all2026.some(h => h.type === "national")).toBe(true);
  });

  it('should include municipal holidays', () => {
    expect(all2026.some(h => h.type === "municipal")).toBe(true);
  });

  it('should include both national and municipal for Lisboa', () => {
    const allLisboa = getHolidays(2026, { municipality: "Lisboa" });
    expect(allLisboa.some(h => h.type === "national")).toBe(true);
    expect(allLisboa.some(h => h.type === "municipal")).toBe(true);
  });
});

describe('Date object validation', () => {
  it('should return Date objects for all national holidays', () => {
    const nat = getNationalHolidays(2026);
    expect(nat.every(h => h.date instanceof Date)).toBe(true);
  });

  it('should return Date objects for all municipal holidays', () => {
    const mun = getMunicipalHolidays(2026);
    expect(mun.every(h => h.date instanceof Date)).toBe(true);
  });

  it('should return dates at midnight', () => {
    const allHolidays = getHolidays(2026);
    expect(allHolidays.every(h =>
      h.date.getHours() === 0 &&
      h.date.getMinutes() === 0 &&
      h.date.getSeconds() === 0
    )).toBe(true);
  });

  it('should return Date objects from isHoliday', () => {
    const xmasCheck = isHoliday("2025-12-25");
    expect(xmasCheck.holidays.length).toBeGreaterThan(0);
    expect(xmasCheck.holidays[0].date instanceof Date).toBe(true);
  });
});

describe('Timezone safety', () => {
  it('should recognize Christmas at local midnight as a holiday', () => {
    const xmasDate = new Date(2025, 11, 25, 0, 0, 0);
    const xmasTz = isHoliday(xmasDate);
    expect(xmasTz.isHoliday).toBe(true);
  });

  it('should recognize São João at local midnight as a holiday in Porto', () => {
    const saoJoaoDate = new Date(2025, 5, 24, 0, 0, 0);
    const saoJoaoTz = isHoliday(saoJoaoDate, { municipality: "Porto" });
    expect(saoJoaoTz.isHoliday).toBe(true);
  });

  it('should use local date components for Date objects', () => {
    const h = getNationalHolidays(2025).find(x => x.name === "Christmas Day");
    expect(h.date instanceof Date).toBe(true);
    expect(toDateString(h.date)).toBe("2025-12-25");
  });
});
