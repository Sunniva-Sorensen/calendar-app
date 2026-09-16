import { useEffect, useState } from "react";

type Holiday = {
  date: string;
  localName: string;
  name: string;
};

export function App() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    async function getHolidays(year: string, country: string) {
      try {
        const result = await fetch(
          `https://date.nager.at/api/v3/publicholidays/${year}/${country}`,
        );
        const data = await result.json();
        setHolidays(data);
      } catch (error) {
        console.error("Something went wrong", error);
      }
    }

  getHolidays("2026", "no");

  }, []);

  return (
    <main>
      <h1>Overview of Holidays in {{getHolidays.country}} {{getHolidays.year}}</h1>
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
