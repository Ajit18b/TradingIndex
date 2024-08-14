import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "./BarAnimation.css"; // Import the custom CSS file

export default function BarAnimation() {
  const [seriesNb, setSeriesNb] = useState(2);
  const [itemNb, setItemNb] = useState(5);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/profit"); // Replace with your API endpoint
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 1000); // Fetch data every second

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  const handleItemNbChange = (event, newValue) => {
    if (typeof newValue !== "number") return;
    setItemNb(newValue);
  };

  const handleSeriesNbChange = (event, newValue) => {
    if (typeof newValue !== "number") return;
    setSeriesNb(newValue);
  };

  // Create the series data based on the fetched data
  const series = data.slice(0, seriesNb).map((item, index) => ({
    label: `Series ${index + 1}`,
    data: item.slice(0, itemNb),
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <div
        className={`bar-chart ${skipAnimation ? "no-animation" : "animate"}`}
      >
        {series.map((s, i) => (
          <div key={i} className="bar-series">
            {s.data.map((value, j) => (
              <div
                key={j}
                className="bar"
                style={{ height: `${value}px`, width: `${100 / itemNb}%` }}
              />
            ))}
          </div>
        ))}
      </div>
      <FormControlLabel
        checked={skipAnimation}
        control={
          <Checkbox
            onChange={(event) => setSkipAnimation(event.target.checked)}
          />
        }
        label="Skip Animation"
        labelPlacement="end"
      />
      <Typography id="input-item-number" gutterBottom>
        Number of items
      </Typography>
      <Slider
        value={itemNb}
        onChange={handleItemNbChange}
        valueLabelDisplay="auto"
        min={1}
        max={20}
        aria-labelledby="input-item-number"
      />
      <Typography id="input-series-number" gutterBottom>
        Number of series
      </Typography>
      <Slider
        value={seriesNb}
        onChange={handleSeriesNbChange}
        valueLabelDisplay="auto"
        min={1}
        max={10}
        aria-labelledby="input-series-number"
      />
    </Box>
  );
}
