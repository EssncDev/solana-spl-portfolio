import React, { useState, useEffect } from "react";

function GetTokenPrices() {
  const [data, setData] = useState([]);
  const [portValue, setPortValue] = useState();

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
          const jsonData = await response.json();
          const lastArray = (jsonData.data[(jsonData.data).length - 1])
          const useArray = lastArray.slice(0, lastArray.length - 1);
          setData(useArray.sort(function(a, b){return b.value-a.value}));


          let portValue = 0;
          for (const elmt of useArray) {
            if (elmt?.value) {
              portValue += elmt.value;
            }
          }

          setPortValue(portValue);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60*1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
       <ul className="tokenList">
        {data.map((item, index) => (
            <li key={index}>
              <div className="tokenSlot">
                <div>
                  <p>Allocation: { ((item.value / portValue)*100).toFixed(2) }%</p>
                </div>
                <div className="tokenStats">
                  <div>
                    <p style={{textDecoration:'underline'}}>{item.slug}</p>
                    <p>{(item.value/parseFloat(item.price)).toFixed(0)}</p>
                  </div>
                  <div>
                    <p>@{(parseFloat(item.price)).toFixed(3)} USD</p>
                    <p>${(item.value).toFixed(2)} USD</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default GetTokenPrices;