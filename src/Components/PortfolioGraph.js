import React, { useState, useEffect } from "react";
import { LineChart } from '@mui/x-charts/LineChart';

/**
 * HOW MANY POINTS SHALL BE VISIBLE ON CHART
 * 
 * DEFAULT = 10
 * 
 * SUGGESTION: 5, 10, 15, 20, 25 
 * 
 * EVERY ADDITIONAL DATAPOINT WILL MAKE IT LOOK MESSI
 */
const datapoints = 10;

function PortfolioChart() {

    const [dataPoints, setDataPoints] = useState([]);
    const [tsPoints, setTsPoints] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:5000/portfolio", {
              "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              },
              "referrerPolicy": "strict-origin-when-cross-origin",
              "body": null,
              "method": "GET",
              "mode": "cors",
              "credentials": "omit"
          });
          
          if (response.status === 200) {
            let portfolioDataPoints = [];
            let timestampArray = [];
            let jsonData = await response.json();
            const stepGap = (jsonData.data).length / (datapoints - 1);

            for (let i = 0; i < (jsonData.data).length; i += Math.floor(stepGap)-1) {
              const snapshot = jsonData.data[i];
              let totalValue = 0;
              for (const elmt in snapshot) {
                  const jsonElmt = snapshot[elmt];
                  if ( jsonElmt.value ) {
                      totalValue += jsonElmt.value;
                  } else {
                      timestampArray.push(new Date(jsonElmt * 1000))
                  }
              }
              portfolioDataPoints.push(totalValue)
            }

            let totalValue = 0;
            const lastElmt = jsonData.data[(jsonData.data).length - 1];
            for (const elmt in lastElmt) {
              const jsonElmt = lastElmt[elmt];
              if ( jsonElmt.value ) {
                  totalValue += jsonElmt.value;
              } else {
                  timestampArray.push(new Date(jsonElmt * 1000))
              }
            }
            portfolioDataPoints.push(totalValue)

            setDataPoints(portfolioDataPoints)
            setTsPoints(timestampArray)
          }
        } catch (error) {
          //console.error('Error fetching data:', error);
        }
      };

  
      fetchData();
      const intervalId = setInterval(fetchData, 20*1000);
  
      return () => clearInterval(intervalId);
    }, []);

  if (tsPoints.length === dataPoints.length) {
    return (
      <div className="portfolioDisplay">
          <LineChart
              xAxis={[{ data: tsPoints }]}
              series={[
                  {
                  data: dataPoints,
                  area: true,
                  color: '#286ac0',
                  },
              ]}
              width={650}
              height={400}
          />
      </div>
    );
  } else {
    return (
      <div className="portfolioDisplay">
          <LineChart
              xAxis={[{ data: tsPoints }]}
              series={[
                  {
                  data: dataPoints.slice(0, (dataPoints).length - 1),
                  area: true,
                  color: '#286ac0',
                  },
              ]}
              width={650}
              height={400}
          />
      </div>
    );
  }
}

export default PortfolioChart;