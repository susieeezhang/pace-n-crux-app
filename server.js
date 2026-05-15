const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Entry = require("./models/Entry");
const entriesRouter = require("./routes/entries");


dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

app.use("/", entriesRouter);

app.get("/settings", (req, res) => {
    res.render("settings");
});

app.post("/submit", async (req, res) => {

    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${req.body.latitude}&longitude=${req.body.longitude}&current=temperature_2m,wind_speed_10m`
    );

    const weatherData = await weatherResponse.json();

    const temperature =
        weatherData.current.temperature_2m;

    const windSpeed =
        weatherData.current.wind_speed_10m;


    const newEntry = new Entry({

        workoutType: req.body.workoutType,
        duration: req.body.duration,

        food: req.body.food,
        calories: req.body.calories,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fat: req.body.fat,

        painLevel: req.body.painLevel,
        rehab: req.body.rehab,
        plannedWorkout: req.body.plannedWorkout,
        notes: req.body.notes,

        city: req.body.city,
        latitude: req.body.latitude,
        longitude: req.body.longitude,

        temperature: temperature,
        windSpeed: windSpeed

    });

    await newEntry.save();

    console.log("Saved entry:", newEntry);

    res.send("Entry saved to MongoDB!");

});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

