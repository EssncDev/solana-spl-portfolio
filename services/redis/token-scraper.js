const { fetchJupData } = require('../scraper/jup');
const { RedisClient } = require('./redis.js');
const portfolioJson = require('../portfolio.json');

const getAevoPricing = async(asset) => {
    const req = await fetch(`https://api.aevo.xyz/statistics?asset=${asset}&instrument_type=PERPETUAL`, {
        "headers": {
          "accept": "application/json, text/plain, */*",
        },
        "referrer": "https://app.aevo.xyz/perpetual/dym",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    });
    if (req.status === 200) {
        return(await req.json());
    } else {
        return undefined;
    }
}

const getCoinTJPricing = async(baseAsset, quoteAsset) => {

    const getSwapValue = async(newTS) => {
        const req = await fetch(`https://barn.traderjoexyz.com/v1/candles/avalanche?fromTimestamp=${newTS-43200}&period=300&toTimestamp=${newTS}&tokenA=0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7&tokenB=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7`, {
            "headers": {
              "accept": "application/json",
            },
            "referrer": "https://traderjoexyz.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        if (req.status === 200) {
            return(await req.json());
        } else {
            return undefined;
        }
    }


    const newTS = Math.floor(new Date()/1000);
    const req = await fetch(`https://barn.traderjoexyz.com/v1/candles/avalanche?fromTimestamp=${newTS-43200}&period=300&toTimestamp=${newTS}&tokenA=${quoteAsset}&tokenB=${baseAsset.address}`, {
        "headers": {
            "accept": "application/json",
          },
          "referrer": "https://traderjoexyz.com/",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
        });
    if (req.status === 200) {
        const res = await req.json();
        const swapJson = await getSwapValue(newTS);

        if (res && swapJson) {
            const returnValue = res[res.length - 1].close * swapJson[swapJson.length - 1].close;
            return(returnValue);
        }

    } else {
        return undefined;
    }
}

const getWhaleMarktPricing = async() => {
    const req = await fetch("https://api.whales.market/tokens/token-preview?ids=f833595d-78e5-4cde-b3d4-e7980f09c191,f069fc75-b155-42fb-9829-bb0ae3c95dff,034eb801-cad3-4385-9d56-9843428f1080,0e9afb0b-26ed-4525-b0e2-8567e46f731f", {
        "headers": {
          "accept": "application/json, text/plain, */*",
        },
        "referrer": "https://app.whales.market/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    });

    if (req.status === 200) {
        return(await req.json())
    } else {
        undefined
    }
}

const buildAEVOJson = async() => {
    for (const elmt in portfolioJson.AEVO) {
        const data = portfolioJson.AEVO[elmt];
        const req = await getAevoPricing(elmt);

        if (req) {
            return(
                {
                    "token": undefined,
                    "slug": req.asset,
                    "price": req.mark_price, 
                    "value": req.mark_price * data.amount
                }
            )
        } else {
            return undefined
        }
    }
}

const buildEthJson = async() => {
    const usdt =  portfolioJson.TRADEJOE.USDT;
    for (const elmt in portfolioJson.TRADEJOE.tokens) {
        const data = portfolioJson.TRADEJOE.tokens[elmt];
        const req = await getCoinTJPricing(usdt, elmt);

        if (req) {
            return(
                {
                    "token": undefined,
                    "slug": data.slug,
                    "price": req, 
                    "value": req * data.amount
                }
            )
        } else {
            return undefined
        }
    }
}

const buildWhaleMarketTokens = async() => {
    const req = await getWhaleMarktPricing();
    if (!req) {
        exit()
    }

    const meElmt = (req.data).filter((elmt) => elmt.symbol === 'Magic Eden');
    return(
        {
            "token": undefined,
            "slug": meElmt[0].symbol,
            "price": parseFloat(meElmt[0].average_asks), 
            "value": parseFloat(meElmt[0].average_asks) * 7500
        }
    );
}

const saveDataInDb = async( insertValue ) => {
    const key = 'portfolio';
    const redis = new RedisClient();
    insertValue.push(new Date()/1000);

    const keyExists = await redis.getKey(key);
    if (!keyExists) {
        await redis.setJSON(key, { data : []})
    }

    await redis.pushArrayHistory(key, insertValue);
    redis.quit();
}

const getTokenPrices = async() => {
    const tokenArray = [];
    for (const tokenAddress in portfolioJson.JUP) {
        const data = portfolioJson.JUP[tokenAddress];
        const res = await fetchJupData(tokenAddress);
        if (res) {
            tokenArray.push(
                {
                    "token": tokenAddress,
                    "slug": data.slug,
                    "price": parseFloat(res.price), 
                    "value": res.price * data.amount
                }
            );
        }
    }
    return tokenArray;
}

async function main(){
    try {
        let portfolioValue = 0;
        const results = await Promise.all([getTokenPrices(), buildAEVOJson(), buildEthJson(), buildWhaleMarketTokens()])
        if(results.includes(undefined)) {
            exit();
        }
        
        const tokenArray = results.flat();
        for (const elmt of tokenArray) {
            portfolioValue += elmt.value;
        }

        saveDataInDb(tokenArray);

    } catch {
    }
    
}
main();
setInterval(main, 5*60*1000);