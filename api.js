import React, { useEffect, useState } from "react";
import Line from "./lineChart";
import "./api.css";

// set of url for the two endpoints
const apiSet = [
  "https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=demo",
  "https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey=demo",
];

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Api = () => {
  const [data, setData] = useState([]);
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // fetch data from the two endpoints using Promise.all
  const fetchData = async () => {
    // use try catch to handle failed requests
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
      // only retreive quarterlyReports for both datasets
      const quarterlyData = results.map((result) => result.quarterlyReports);
      setData(quarterlyData);
      if (quarterlyData[selectedDatasetIndex]?.length > 0) {
        const firstItem = quarterlyData[selectedDatasetIndex][0]; //time as x-value for chart
        // remove property fiscalDateEnding and reportedCurrency
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

    // chart data
    return {
      labels,
      datasets: [
        {
          label: capitalizeFirstLetter(selectedProperty),
          data: values,
          fill: false,
          backgroundColor: "rgba(29, 161, 242, 0.2)",
          borderColor: "rgb(29, 161, 242)", // blue
          pointBackgroundColor: "rgb(255, 192, 203)", //pink
        },
      ],
    };
  };
  // handling loading and error situation
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="title">Quarterly Reports (in USD)</h1>
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
                    {capitalizeFirstLetter(prop)}
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
