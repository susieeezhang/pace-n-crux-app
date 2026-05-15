const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
    workoutType: String,
    duration: Number,

    food: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,

    painLevel: Number,
    rehab: String,
    plannedWorkout: String,
    notes: String,

    city: String,
    latitude: Number,
    longitude: Number,

    temperature: Number,
    windSpeed: Number,
    weatherNote: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Entry", entrySchema);