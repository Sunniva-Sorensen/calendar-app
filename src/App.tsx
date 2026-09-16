import { useEffect, useState } from "react";

type Holiday = {
  date: string;
  localName: string;
  name: string;
};

type Country = {
  countryCode: string;
  name: string;
};

export function App() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [year, setYear] = useState<string>("2026");
  const [country, setCountry] = useState<string>("NO");
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    async function getCountries() {
      const result = await fetch("https://date.nager.at/api/v3/AvailableCountries");
      const data = await result.json();
      setCountries(data);
    }

    getCountries();
  }, []);

  useEffect(() => {
    async function getHolidays() {
      try {
        const result = await fetch(
          `https://date.nager.at/api/v3/publicholidays/${year}/${country}`,
        );
        const data = await result.json();
        setHolidays(data);
      } catch (error) {
        console.error("Something went wrong", error);
      }
    };

    getHolidays();
    }, [year, country]);

    const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

    
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f3f4f6_42%,_#e5e7eb_100%)] text-slate-900 p-6 md:p-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Overview of Holidays in {countries.find((c) => c.countryCode === country)?.name} {year}
        </h1>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none ring-0 transition focus:border-slate-400 md:w-40"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none ring-0 transition focus:border-slate-400 md:w-72"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {holidays.map((h) => (
            <div
              key={h.date}
              className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/75"
            >
              <h2 className="mb-2 text-xl font-semibold text-slate-900">{h.localName}</h2>
              <p className="text-base font-medium text-slate-700">{h.date}</p>
              <p className="mt-2 text-sm text-slate-600">{h.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
