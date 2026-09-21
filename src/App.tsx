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

        <h1 className="mb-12 text-center text-5xl font-bold tracking-tight text-slate-700">
          Holidays in {countries.find((c) => c.countryCode === country)?.name} {year}
        </h1>

        <div className="mx-auto mb-12 flex max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 text-base text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-300 sm:w-40"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm px-4 py-3 text-base text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-300 sm:w-72"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-12">
          {months.map((month) => {
            const { blanks, days } = buildCalendar(year, month);
            const items = holidaysByMonth[month] ?? [];

            return (
              <div key={month} className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-md p-8">

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
          })}
        </div>
      </div>
    </main>
  );
}
