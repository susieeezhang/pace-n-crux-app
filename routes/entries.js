const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");

router.get("/", (req, res) => {
    res.render("index");
});

router.post("/submit", async (req, res) => {
    let temperature = null;
    let windSpeed = null;
    let weatherNote = "Weather unavailable";

    if (req.body.latitude && req.body.longitude) {
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${req.body.latitude}&longitude=${req.body.longitude}&current_weather=true`;

        const response = await fetch(weatherURL);
        const weatherData = await response.json();

        if (weatherData.current_weather) {
            temperature = weatherData.current_weather.temperature;
            windSpeed = weatherData.current_weather.windspeed;
            weatherNote = "Outdoor conditions recorded";
        }
    }

    const newEntry = new Entry({
        workoutType: req.body.workoutType,
        duration: req.body.duration,
        food: req.body.food,
        notes: req.body.notes,
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat,
        painLevel: req.body.painLevel,
        rehab: req.body.rehab,
        plannedWorkout: req.body.plannedWorkout,
        city: req.body.city,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        temperature: temperature,
        windSpeed: windSpeed
    });

    await newEntry.save();

    res.redirect("/history");
});

router.get("/history", async (req, res) => {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.render("history", { entries: entries });
});

router.get("/settings", (req, res) => {
    res.render("settings");
});

module.exports = router;