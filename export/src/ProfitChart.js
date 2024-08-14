import React, { useEffect, useRef, useState } from "react";
import "./ProfitChart.css";

export default function TradingPlatformChart() {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [initialStartingValue, setInitialStartingValue] = useState(null);
  const [viewIndex, setViewIndex] = useState(100); // Start from 100th point
  const [currentDataPoint, setCurrentDataPoint] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/profit"); // Replace with your API endpoint
      const result = await response.json();

      const formattedData = result.map((value) => parseFloat(value).toFixed(2));
      setData(formattedData);

      if (initialStartingValue === null && formattedData.length > 0) {
        const newStartingValue = parseFloat(formattedData[0]);
        setInitialStartingValue(newStartingValue);
      }

      const visibleData = formattedData.slice(viewIndex);
      if (visibleData.length > 0) {
        setDisplayData(visibleData);
        setCurrentDataPoint(visibleData[visibleData.length - 1]); // Set current data point
        setCurrentIndex(visibleData.length - 1); // Set index of the current data point
      }

      if (initialStartingValue !== null) {
        const totalProfit = visibleData
          .filter((val) => parseFloat(val) >= initialStartingValue)
          .reduce(
            (acc, val) => acc + (parseFloat(val) - initialStartingValue),
            0
          );
        const totalLoss = visibleData
          .filter((val) => parseFloat(val) < initialStartingValue)
          .reduce(
            (acc, val) => acc + (initialStartingValue - parseFloat(val)),
            0
          );

        setTotalProfit(totalProfit.toFixed(2));
        setTotalLoss(totalLoss.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10); // Fetch data every second

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [viewIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const padding = 100;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const maxProfit = Math.max(...displayData.map((val) => parseFloat(val)));
    const minProfit = Math.min(...displayData.map((val) => parseFloat(val)));
    const yRange = maxProfit - minProfit || 1; // Avoid division by zero
    const yScale = (canvasHeight - 2 * padding) / yRange;
    const xScale = (canvasWidth - 2 * padding) / (displayData.length - 1);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(
        padding,
        canvasHeight - padding - i * ((canvasHeight - 2 * padding) / 10)
      );
      ctx.lineTo(
        canvasWidth - padding,
        canvasHeight - padding - i * ((canvasHeight - 2 * padding) / 10)
      );
      ctx.stroke();
    }

    // Draw the trading index line chart
    ctx.beginPath();
    ctx.moveTo(
      padding,
      canvasHeight - padding - (displayData[0] - minProfit) * yScale
    );

    displayData.forEach((point, i) => {
      const x = padding + i * xScale;
      const y =
        canvasHeight - padding - (parseFloat(point) - minProfit) * yScale;
      ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#4caf50"; // Green line for profit
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the horizontal line for the current data point
    if (currentDataPoint !== null && currentIndex !== null) {
      const currentY =
        canvasHeight -
        padding -
        (parseFloat(currentDataPoint) - minProfit) * yScale;
      const currentX = padding + currentIndex * xScale;

      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(canvasWidth - padding, currentY);
      ctx.strokeStyle = "#ff5722"; // Orange line for current data point
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line for current data point
      ctx.stroke();

      // Draw vertical line for the current data point
      ctx.beginPath();
      ctx.moveTo(currentX, padding);
      ctx.lineTo(currentX, canvasHeight - padding);
      ctx.strokeStyle = "#ff5722"; // Same color as horizontal line
      ctx.lineWidth = 2;
      ctx.setLineDash([]); // Reset to solid line
      ctx.stroke();

      // Draw the current value label
      ctx.fillStyle = "#ff5722"; // Same color as the lines
      ctx.font = "16px Arial";
      ctx.textAlign = "right";
      ctx.fillText(
        `Current Value: ${currentDataPoint}`,
        currentX - 10,
        currentY - 10
      );
    }

    // Draw the y-axis labels
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.textAlign = "right";
    ctx.fillText(maxProfit.toFixed(2), padding - 10, padding);
    ctx.fillText(
      minProfit.toFixed(2),
      padding - 10,
      canvasHeight - padding + 20
    );
  }, [displayData, initialStartingValue, currentDataPoint, currentIndex]);

  const handleViewOlderData = () => {
    if (viewIndex + 100 < data.length) {
      setViewIndex(viewIndex + 100);
      setDisplayData(data.slice(viewIndex + 100, viewIndex + 200));
    }
  };

  const handleViewNewerData = () => {
    if (viewIndex > 100) {
      setViewIndex(viewIndex - 100);
      setDisplayData(data.slice(viewIndex - 100, viewIndex));
    }
  };

  return (
    <div className="chart-container">
      <div className="stats">
        <div
          className="stat profit"
          style={{ color: totalProfit > 0 ? "#4caf50" : "#333" }}
        >
          Total Profit: ${totalProfit}
        </div>
        <div
          className="stat loss"
          style={{ color: totalLoss > 0 ? "#f44336" : "#333" }}
        >
          Total Loss: ${totalLoss}
        </div>
      </div>
      <canvas ref={canvasRef} id="tradingPlatformChart"></canvas>
      <div className="controls">
        <button
          onClick={handleViewOlderData}
          disabled={viewIndex + 100 >= data.length}
        >
          View Older Data
        </button>
        <button onClick={handleViewNewerData} disabled={viewIndex <= 100}>
          View Newer Data
        </button>
      </div>
    </div>
  );
}
