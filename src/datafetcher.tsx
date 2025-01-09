import { useEffect, useState } from "react";

interface ApiData {
  // Define your expected data structure here
  // For example:
  id?: number;
  title?: string;
  // ... other fields
}

const DataFetcher = () => {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.example.com/data"); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        // setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Data Fetched from API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DataFetcher;
