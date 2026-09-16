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
    <main>
      <h1>Overview of Holidays in {countries.find(c => c.countryCode === country)?.name} {year}</h1>

      <div
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {/* År */}
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Land */}
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {countries.map((c) => (
            <option key={c.countryCode} value={c.countryCode}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {holidays && holidays.length && (
        <div>
          {holidays.map((item, index) => (
            <p key={index}>
              {item.localName} {item.name}
            </p>
          ))}
        </div>
      )}
    </main>
  );
}

export default App;
