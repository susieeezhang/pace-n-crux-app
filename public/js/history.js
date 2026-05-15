const tempUnit = localStorage.getItem("tempUnit") || "F";

const temps = document.querySelectorAll(".temperature");

temps.forEach(temp => {
    const celsius = Number(temp.dataset.celsius);

    if (tempUnit === "F") {
        const fahrenheit = (celsius * 9 / 5) + 32;
        temp.textContent = `${fahrenheit.toFixed(1)}°F`;
    } else {
        temp.textContent = `${celsius.toFixed(1)}°C`;
    }
});

const distanceUnit = localStorage.getItem("distanceUnit") || "mi";

const winds = document.querySelectorAll(".wind");

winds.forEach(wind => {
    const kmh = Number(wind.dataset.kmh);

    if (distanceUnit === "mi") {
        const mph = kmh * 0.621371;
        wind.textContent = `${mph.toFixed(1)} mph`;
    } else {
        wind.textContent = `${kmh.toFixed(1)} km/h`;
    }
});