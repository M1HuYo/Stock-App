import React, { useEffect, useState } from "react";
import Line from "./lineChart";
import "./api.css";

const apiSet = [
  "https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=demo",
  "https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey=demo",
];
const Api = () => {
  const [data, setData] = useState([]);
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchPromises = apiSet.map((url) =>
        fetch(url).then((res) => {
          if (!res.ok)
            throw new Error(`Network response was not ok for ${url}`);
          return res.json();
        })
      );
      const results = await Promise.all(fetchPromises);
      const quarterlyData = results.map((result) => result.quarterlyReports);
      setData(quarterlyData);
      if (quarterlyData[selectedDatasetIndex]?.length > 0) {
        const firstItem = quarterlyData[selectedDatasetIndex][0];
        const availableProperties = Object.keys(firstItem).filter(
          (prop) => prop !== "fiscalDateEnding" && prop !== "reportedCurrency"
        );
        if (availableProperties.length > 0) {
          setSelectedProperty(availableProperties[0]);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate chart data
  const generateChartData = () => {
    const labels =
      data[selectedDatasetIndex]?.map((report) => report.fiscalDateEnding) ||
      [];
    const values =
      data[selectedDatasetIndex]?.map((report) =>
        Number(report[selectedProperty])
      ) || [];

    return {
      labels,
      datasets: [
        {
          label: selectedProperty,
          data: values,
          fill: false,
          backgroundColor: "rgba(29, 161, 242, 0.2)",
          borderColor: "rgb(29, 161, 242)",
          pointBackgroundColor: "rgb(255, 192, 203)",
        },
      ],
    };
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="title">Quarterly Reports (USD)</h1>
      <div className="dropdowns">
        <select
          value={selectedDatasetIndex}
          onChange={(e) => setSelectedDatasetIndex(e.target.value)}
          className="dropdown"
        >
          <option value="">Select Dataset</option>
          <option value="0">Dataset 1</option>
          <option value="1">Dataset 2</option>
        </select>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="dropdown"
        >
          <option value="">Select Property</option>
          {selectedDatasetIndex &&
            data[selectedDatasetIndex]?.length > 0 &&
            Object.keys(data[selectedDatasetIndex][0]).map((prop) => {
              if (prop !== "fiscalDateEnding" && prop !== "reportedCurrency") {
                return (
                  <option key={prop} value={prop}>
                    {prop}
                  </option>
                );
              }
              return null;
            })}
        </select>
      </div>
      <div className="chart-container">
        <Line data={generateChartData()} />
      </div>
    </div>
  );
};

export default Api;
