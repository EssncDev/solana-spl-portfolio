import React, { useState, useEffect } from "react";

function PortfolioValue() {
  const [data, setData] = useState();
  const [start, setStart] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {

        async function calcPortfolioValue(array) {
          let portfolioValue = 0;
          const arrayWithoutTs = array.slice(0, array.length -1);
          console.log(arrayWithoutTs)
          for (const elmt of arrayWithoutTs) {
              if ( elmt.value ) {
                portfolioValue += elmt.value;
              }
          }
          if(portfolioValue > 0) {
            return (portfolioValue).toFixed(2);
          }
        }

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
          const jsonData = await response.json();
          const startArray = jsonData.data[0];
          const array = jsonData.data[(jsonData.data).length - 1];

          setData(await calcPortfolioValue(array));
          setStart(await calcPortfolioValue(startArray)); 
        }

      } catch (error) {
        //console.error('Error fetching data:', error);
      }
    };

    const intervalId = setInterval(fetchData, 60*1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
        <p> Airdrop Portfolio:</p>
        <p>${data} USD | {(data*0.93).toFixed(2)}€</p>
        { (data/start > 1) ? <p style={{color: 'green'}}>Since start {(((data/start)-1)*100).toFixed(1)}% | ${(data-start).toFixed(1)} USD </p> : <p style={{color:'red'}}>Since start {(((data/start)-1)*100).toFixed(1)}% | ${(data-start).toFixed(1)} USD</p>}
    </div>
  );
}

export default PortfolioValue;