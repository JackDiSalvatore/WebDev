const routeHello = () => "Hello World!\n";
const routeWeather = (query) => queryWeatherData(query);
const queryWeatherData = (query) => {
    return {
        zipcode: query.zipcode,
        weather: "sunny",
        temp: 35,
    };
};
export { routeHello, routeWeather };
