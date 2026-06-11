/**
 * ACLED coverage check — UA + global. (TODO task 4)
 *
 * ACLED's spatial/temporal coverage has expanded in waves. This module encodes
 * the documented coverage windows so trend pages can (a) refuse to draw trend
 * lines outside a dataset's coverage, and (b) show an honest "data begins YYYY"
 * caveat. Figures reflect ACLED's published coverage notes
 * (https://acleddata.com/knowledge-base/coverage-and-history/).
 */

export interface CoverageWindow {
  /** ISO2 country, or "GLOBAL". */
  country: string;
  /** Year ACLED coverage starts for this country. */
  since: number;
  /** Human note (en/uk). */
  noteEn: string;
  noteUk: string;
}

/** ACLED now offers full global coverage; key regions started earlier. */
export const ACLED_COVERAGE: CoverageWindow[] = [
  {
    country: "GLOBAL",
    since: 2018,
    noteEn: "ACLED reached worldwide real-time coverage by 2018–2021 (rolling regional rollout).",
    noteUk: "ACLED досягла глобального покриття в реальному часі у 2018–2021 рр. (поетапне розгортання за регіонами).",
  },
  {
    country: "UA",
    since: 2018,
    noteEn: "Ukraine (and the wider Europe/Caucasus region) covered by ACLED from 2018; intensive coverage since the 2022 full-scale invasion.",
    noteUk: "Україна (та регіон Європи/Кавказу) охоплені ACLED з 2018 р.; інтенсивне покриття від повномасштабного вторгнення 2022 р.",
  },
  {
    country: "SY",
    since: 2017,
    noteEn: "Syria covered by ACLED from 2017 (Middle East rollout).",
    noteUk: "Сирія охоплена ACLED з 2017 р. (розгортання Близького Сходу).",
  },
];

export function coverageFor(country: string): CoverageWindow {
  return (
    ACLED_COVERAGE.find((c) => c.country === country) ??
    ACLED_COVERAGE.find((c) => c.country === "GLOBAL")!
  );
}

export interface CoverageCheckResult {
  covered: boolean;
  since: number;
  /** Clamped, queryable date range for this country. */
  fromYear: number;
  reasonEn: string;
  reasonUk: string;
}

/** Is `year` within ACLED's coverage for `country`? */
export function checkCoverage(country: string, year: number): CoverageCheckResult {
  const win = coverageFor(country);
  const covered = year >= win.since;
  return {
    covered,
    since: win.since,
    fromYear: Math.max(year, win.since),
    reasonEn: covered
      ? `ACLED covers ${country} for ${year}.`
      : `ACLED coverage for ${country} begins in ${win.since}; ${year} is out of range.`,
    reasonUk: covered
      ? `ACLED охоплює ${country} за ${year} р.`
      : `Покриття ACLED для ${country} починається з ${win.since} р.; ${year} р. поза діапазоном.`,
  };
}
