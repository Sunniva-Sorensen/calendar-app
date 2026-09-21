import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

type Holiday = {
  date: string;
  localName: string;
  name: string;
  types: string[]; // Public = rød dag, Observance = grønn dag
};

type Country = {
  countryCode: string;
  name: string;
};

// Rød dag = types inkluderer "Public"
function isRedDay(h?: Holiday) {
  return h?.types?.includes("Public");
}

// Grønn dag = har types, men ikke Public
function isGreenDay(h?: Holiday) {
  return Boolean(h?.types?.length && !h.types.includes("Public"));
}

async function fetchCountries() {
  const res = await axios.get<Country[]>(
    "https://date.nager.at/api/v3/AvailableCountries"
  );
  return res.data;
}

async function fetchHolidays(year: string, country: string) {
  const res = await axios.get<Holiday[]>(
    `https://date.nager.at/api/v3/publicholidays/${year}/${country}`
  );
  return res.data;
}

export default function App() {
  const [year, setYear] = useState("2026");
  const [country, setCountry] = useState("NO");
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ["holidays", year, country],
    queryFn: () => fetchHolidays(year, country),
  });

  function groupByMonth(holidays: Holiday[]) {
    const months: Record<string, Holiday[]> = {};

    holidays.forEach((h) => {
      const month = h.date.split("-")[1].padStart(2, "0");
      if (!months[month]) months[month] = [];
      months[month].push(h);
    });

    return months;
  }

  const holidaysByMonth = groupByMonth(holidays);
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  function buildCalendar(year: string, month: string) {
    const firstDay = new Date(`${year}-${month}-01`).getDay();
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

    const blanks = firstDay === 0 ? 6 : firstDay - 1;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { blanks, days };
  }

  const years = Array.from(
    { length: 10 },
    (_, i) => (new Date().getFullYear() + i).toString()
  );

  if (isLoading) {
    return <div className="p-10 text-xl text-slate-700">Loading holidays…</div>;
  }

  return (
    <main className="min-h-screen px-6 py-16 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-slate-700">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-xl p-10">

        <h1 className="mb-12 flex flex-wrap items-center justify-center gap-3 text-center text-4xl font-bold tracking-tight text-slate-700 sm:text-5xl">
          <span>Holidays in</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Select country"
            className="w-48 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-base font-bold text-slate-700 shadow-sm backdrop-blur-sm outline-none transition hover:bg-white/90 focus:ring-4 focus:ring-blue-300"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Select year"
            className="w-28 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-base font-bold text-slate-700 shadow-sm backdrop-blur-sm outline-none transition hover:bg-white/90 focus:ring-4 focus:ring-blue-300"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </h1>

        <div className="mx-auto flex max-w-4xl items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setMonthIndex((current) => Math.max(0, current - 1))}
            disabled={monthIndex === 0}
            aria-label="Previous month"
            title="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/60 text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &larr;
          </button>

          <div className="min-w-0 flex-1">
            {(() => {
              const month = months[monthIndex];
              const { blanks, days } = buildCalendar(year, month);
              const items = holidaysByMonth[month] ?? [];

              return (
                <div key={month} className="rounded-2xl border border-white/40 bg-white/40 p-8 shadow-md backdrop-blur-sm">

                  <h2 className="mb-6 text-center text-3xl font-semibold text-slate-700">
                    {new Date(Number(year), Number(month) - 1).toLocaleString("en", {
                      month: "long",
                    })}
                  </h2>

                  <div className="mb-4 grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <div>Mon</div><div>Tue</div><div>Wed</div>
                    <div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: blanks }).map((_, i) => (
                      <div key={`blank-${i}`} className="h-16 sm:h-20"></div>
                    ))}

                    {days.map((day) => {
                      const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
                      const holiday = items.find((h) => h.date === dateStr);
                      const holidayColor = isRedDay(holiday)
                        ? "border-red-300 bg-red-100/70"
                        : isGreenDay(holiday)
                          ? "border-green-300 bg-green-200/70"
                          : "border-white/40 bg-white/70";

                      return (
                        <div
                          key={dateStr}
                          className={`flex h-16 sm:h-20 flex-col items-center justify-start rounded-xl 
                          border ${holidayColor} backdrop-blur-sm p-2 shadow-sm 
                          transition-all hover:-translate-y-1 hover:shadow-md
                        `}
                        >
                          <span className="text-sm font-semibold text-slate-700 sm:text-base">
                            {day}
                          </span>

                          {holiday && (
                            <span className="mt-1 text-[0.65rem] font-medium text-slate-700 sm:text-xs text-center">
                              {holiday.localName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <button
            type="button"
            onClick={() => setMonthIndex((current) => Math.min(months.length - 1, current + 1))}
            disabled={monthIndex === months.length - 1}
            aria-label="Next month"
            title="Next month"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/60 text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>
      </div>
    </main>
  );
}
