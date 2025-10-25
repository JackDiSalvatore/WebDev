import { routeHello, routeWeather } from "./routes.js";
import express from "express";
import path from "path";
const server = express();
const port = 3000;
server.get("/hello", function (_req, res) {
    const response = routeHello();
    res.send(response);
});
server.get("/api/weather/:zipcode", function (req, res) {
    const response = routeWeather({ zipcode: req.params.zipcode });
    res.send(response);
});
server.get("/components/weather", function (req, res) {
    const filePath = path.join(process.cwd(), "public", "weather.html");
    res.setHeader("Content-Type", "text/html");
    res.sendFile(filePath);
});
server.listen(port, function () {
    console.log("Listening on " + port);
});
