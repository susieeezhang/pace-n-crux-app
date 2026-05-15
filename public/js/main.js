console.log("main.js loaded");

const locationBtn = document.getElementById("locationBtn");
const citySearch = document.getElementById("citySearch");
const suggestions = document.getElementById("suggestions");
const form = document.querySelector("form");

function shortLocation(place) {
    const address = place.address || {};
    const city =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        place.name ||
        "";

    const state = address.state || "";
    return state ? `${city}, ${state}` : city;
}

function setLocation(city, lat, lon) {
    citySearch.value = city;
    document.getElementById("city").value = city;
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lon;
}

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
            );

            const data = await response.json();
            const city = shortLocation(data);

            setLocation(city, lat, lon);
            alert("Location added!");
        },
        (error) => {
            alert("Location error: " + error.message);
        }
    );
});

citySearch.addEventListener("input", async () => {
    document.getElementById("city").value = "";
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";

    const query = citySearch.value;

    if (query.length < 3) {
        suggestions.innerHTML = "";
        return;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&addressdetails=1`;

    const response = await fetch(url);
    const data = await response.json();

    suggestions.innerHTML = "";

    data.forEach(place => {
        const div = document.createElement("div");
        div.textContent = shortLocation(place);

        div.addEventListener("click", () => {
            const city = shortLocation(place);
            setLocation(city, place.lat, place.lon);
            suggestions.innerHTML = "";
        });

        suggestions.appendChild(div);
    });
});

form.addEventListener("submit", (event) => {
    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;

    if (!lat || !lon) {
        event.preventDefault();
        alert("Please select a city from the dropdown or use current location before submitting.");
    }
});