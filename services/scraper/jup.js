async function fetchJupData(currency) {
    try {
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${currency}`);
      if (response.ok) {
        const data = await response.json();
        return(data.data[currency]);
      } else {
        return(false)
      }
    } catch(error) {
      console.error('Error fetching Jup data:', error);
    }
  }
  
  module.exports={
      fetchJupData
  }