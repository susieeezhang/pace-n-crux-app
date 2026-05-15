const locationBtn = document.getElementById("locationBtn");
const citySearch = document.getElementById("citySearch");
const suggestions = document.getElementById("suggestions");
const form = document.querySelector("form");

function shortLocation(place) {
    const address = place.address || {};
    const city = address.city || address.town || address.village || address.hamlet || place.name || "";
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

let foods = [];

const analyzeFoodBtn = document.getElementById("analyzeFoodBtn");
const addFoodBtn = document.getElementById("addFoodBtn");

function cleanFoodName(foodText) {
    let text = foodText.toLowerCase().trim();

    text = text.replace(/^\d+(\.\d+)?\s*/, "");
    text = text.replace(/\b(serving|servings|g|gram|grams|oz|ounce|ounces|cup|cups)\b/g, "");
    text = text.replace(/\s+/g, " ").trim();

    if (text.endsWith("s") && !text.endsWith("ss")) {
        text = text.slice(0, -1);
    }

    return text;
}

function makeApiFoodText(quantity, unit, baseName) {
    if (unit === "") {
        return `${quantity} ${baseName}`;
    }

    return `${quantity} ${unit} ${baseName}`;
}

async function analyzeFood(foodText) {
    const response = await fetch("/analyze-food", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `food=${encodeURIComponent(foodText)}`
    });

    return await response.json();
}

function updateMacroDisplay(totals) {
    document.getElementById("calories").textContent = totals.calories;
    document.getElementById("protein").textContent = `${totals.protein}g`;
    document.getElementById("carbs").textContent = `${totals.carbs}g`;
    document.getElementById("fat").textContent = `${totals.fat}g`;

    document.getElementById("caloriesInput").value = totals.calories;
    document.getElementById("proteinInput").value = totals.protein;
    document.getElementById("carbsInput").value = totals.carbs;
    document.getElementById("fatInput").value = totals.fat;
}

function updateFoodList() {
    const foodList = document.getElementById("foodList");
    foodList.innerHTML = "";

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    foods.forEach((item, index) => {
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;

        const li = document.createElement("li");
        li.classList.add("food-item");

        li.innerHTML = `
            <div>
                <div class="food-name">${item.baseName}</div>
                <div class="food-macro">
                    ${item.calories} cal · ${item.protein}g protein · ${item.carbs}g carbs · ${item.fat}g fat
                </div>
            </div>

            <input 
                type="number" 
                value="${item.quantity || 1}" 
                min="0.1" 
                step="0.1"
                class="food-quantity"
                data-index="${index}"
            >

            <select class="food-unit" data-index="${index}">
                <option value="" ${item.unit === "" ? "selected" : ""}>serving</option>
                <option value="g" ${item.unit === "g" ? "selected" : ""}>g</option>
                <option value="oz" ${item.unit === "oz" ? "selected" : ""}>oz</option>
                <option value="cup" ${item.unit === "cup" ? "selected" : ""}>cup</option>
            </select>

            <button type="button" class="delete-food" data-index="${index}">×</button>
        `;

        foodList.appendChild(li);
    });

    document.querySelectorAll(".delete-food").forEach(button => {
        button.addEventListener("click", () => {
            foods.splice(Number(button.dataset.index), 1);
            updateFoodList();
        });
    });

    document.querySelectorAll(".food-quantity, .food-unit").forEach(input => {
        input.addEventListener("change", async () => {
            const index = Number(input.dataset.index);
            const row = input.closest(".food-item");

            const oldUnit = foods[index].unit;
            let quantity = row.querySelector(".food-quantity").value;
            const unit = row.querySelector(".food-unit").value;
            const baseName = foods[index].baseName;

            const servingWeight = Number(foods[index].servingWeight || 0);
            const currentQuantity = Number(foods[index].quantity || 1);

            // serving → grams / oz / cup
            if (oldUnit === "" && servingWeight) {
                if (unit === "g") {
                    quantity = currentQuantity * servingWeight;
                }

                if (unit === "oz") {
                    quantity = (currentQuantity * servingWeight) / 28.35;
                }

                if (unit === "cup") {
                    quantity = currentQuantity; // cup varies by food, so keep same number
                }
            }

            // grams → serving / oz / cup
            if (oldUnit === "g" && servingWeight) {
                if (unit === "") {
                    quantity = currentQuantity / servingWeight;
                }

                if (unit === "oz") {
                    quantity = currentQuantity / 28.35;
                }

                if (unit === "cup") {
                    quantity = currentQuantity / servingWeight;
                }
            }

            // oz → grams / serving / cup
            if (oldUnit === "oz" && servingWeight) {
                const grams = currentQuantity * 28.35;

                if (unit === "g") {
                    quantity = grams;
                }

                if (unit === "") {
                    quantity = grams / servingWeight;
                }

                if (unit === "cup") {
                    quantity = grams / servingWeight;
                }
            }

            // cup → serving / grams / oz
            if (oldUnit === "cup" && servingWeight) {
                const grams = currentQuantity * servingWeight;

                if (unit === "") {
                    quantity = currentQuantity;
                }

                if (unit === "g") {
                    quantity = grams;
                }

                if (unit === "oz") {
                    quantity = grams / 28.35;
                }
            }

            quantity = Number(quantity).toFixed(2);

            const foodText = makeApiFoodText(quantity, unit, baseName);
            const data = await analyzeFood(foodText);

            foods[index] = {
                ...foods[index],
                name: foodText,
                quantity: quantity,
                unit: unit,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat,
                servingWeight: foods[index].servingWeight || data.weight
            };

            updateFoodList();
        });
    });

    document.getElementById("foodInput").value =
        foods.map(item => item.name).join(", ");

    document.getElementById("caloriesInput").value =
        Math.round(totals.calories);

    updateMacroDisplay({
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat)
    });
}

analyzeFoodBtn.addEventListener("click", async () => {
    const foodText = document.getElementById("food").value;

    if (!foodText) {
        alert("Please enter a food first.");
        return;
    }

    const data = await analyzeFood(foodText);
    updateMacroDisplay(data);
});

addFoodBtn.addEventListener("click", async () => {
    const rawInput = document.getElementById("food").value;

    if (!rawInput) {
        alert("Please enter a food first.");
        return;
    }

    const foodItems = rawInput
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

    for (const foodText of foodItems) {
        const baseName = cleanFoodName(foodText);
        const apiText = makeApiFoodText(1, "", baseName);
        const data = await analyzeFood(apiText);

        const notRecognized =
            data.calories === 0 &&
            data.protein === 0 &&
            data.carbs === 0 &&
            data.fat === 0;

        if (notRecognized) {
            alert(`Could not recognize "${foodText}". Try something like "1 egg" or "100g chicken breast".`);
            continue;
        }

        const existingIndex = foods.findIndex(item =>
            cleanFoodName(item.baseName) === baseName
        );

        if (existingIndex !== -1) {
            const existing = foods[existingIndex];

            let newQuantity = Number(existing.quantity || 1);
            let newUnit = existing.unit || "";

            if (newUnit === "g" && existing.servingWeight) {
                newQuantity = Number(existing.quantity) / Number(existing.servingWeight);
                newUnit = "";
            }

            newQuantity += 1;

            const updatedFoodText = makeApiFoodText(newQuantity, newUnit, existing.baseName);
            const updatedData = await analyzeFood(updatedFoodText);

            foods[existingIndex] = {
                ...existing,
                name: updatedFoodText,
                quantity: newQuantity,
                unit: newUnit,
                calories: updatedData.calories,
                protein: updatedData.protein,
                carbs: updatedData.carbs,
                fat: updatedData.fat,
                servingWeight: existing.servingWeight || updatedData.weight
            };
        } else {
            foods.push({
                baseName: baseName,
                name: apiText,
                quantity: 1,
                unit: "",
                servingWeight: data.weight,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat
            });
        }
    }

    updateFoodList();
    document.getElementById("food").value = "";
});