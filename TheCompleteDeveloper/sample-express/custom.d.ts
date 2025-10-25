export interface WeatherQueryInterface {
  zipcode: string;
}

export type WeatherDetailType = {
  weather: string;
  zipcode: string;
  temp?: number;
};
