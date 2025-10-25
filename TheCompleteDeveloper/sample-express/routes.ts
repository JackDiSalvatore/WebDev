import fetch from "node-fetch";
import { WeatherQueryInterface, WeatherDetailType } from "./custom.js";

const routeHello = () => "Hello World!\n";

const routeWeather = (query: WeatherQueryInterface): WeatherDetailType =>
  queryWeatherData(query);

const queryWeatherData = (query: WeatherQueryInterface): WeatherDetailType => {
  return {
    zipcode: query.zipcode,
    weather: "sunny",
    temp: 35,
  };
};

export { routeHello, routeWeather };
