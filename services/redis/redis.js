const redis = require('redis');
const redisPort = 6379;

class RedisClient{

  constructor(){
    this.client = redis.createClient(redisPort);
    this.client.on('error', (err) => this.client = undefined);

    if(this.client){
      this.client.connect();
    }
  }

  /**
   * 
   * @returns {Boolean}
   */
  async checkConnection(){
    return (this.client)? true : false;
  }

  quit(){
    this.client.quit();
    this.client = undefined;
  }

  /**
   * 
   * @param {String} key 
   * @returns 
   */
  async getKey(key){
    return(JSON.parse(await this.client.get(key)));
  }

  /**
   * 
   * @param {String} key 
   * @param {Object} jsonData 
   * @returns 
   */
  async setJSON(key, jsonData) {
    try{
      const jsonString = JSON.stringify(jsonData);
      const status = await this.client.set(key, jsonString);
      if(status){
        return(true);
      }
      else{
        return(false);
      }
    }catch{
      return(false)
    }
  }

  /**
   * 
   * @param {String} key 
   * @param {Array} array 
   * @returns 
   */
  async setArray(key, array){
    try{
      const status = await this.client.set(key, JSON.stringify({data: array}));
      if(status){
        return(true);
      }
      else{
        return(false);
      }
    }catch(e){
      console.log(e);
    }
  }

  /**
   * 
   * @param {String} key 
   * @param {Object} newJsonData 
   * @returns 
   */
  async appendJSON(key, newJsonData) {
    let currentData = {};

    try{
      const currentDataString = await this.client.get(key);
      (currentDataString) ? currentData = JSON.parse(currentDataString) : undefined;
      const updatedData = { ...currentData, ...newJsonData };
      await this.client.set(key, JSON.stringify(updatedData));
      return(true);
    }catch{
      return(false);
    }
  }

  /**
   * 
   * @param {String} key 
   * @param {Object} appendingData 
   */
  async pushArrayHistory(key, appendingData){
    try{
      const currentDataArray= await this.client.get(key);
      const currentArray = JSON.parse(currentDataArray);
      const historyArray = currentArray.data;
      historyArray.push(appendingData)
      await this.setArray(key, historyArray);
      return(true);
    }catch(e){
      console.log(e);
      return(false);
    }
  }
}


class GetRedisData extends RedisClient{

  constructor(){
    super()
  }

  async getPortfolio(){
    const blob = await super.getKey('portfolio');
    if(blob){
      return(blob)
    }else{
      return(undefined)
    }
  }
}


module.exports={
  RedisClient,
  GetRedisData,
}