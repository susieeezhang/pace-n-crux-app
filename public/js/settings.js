const toggleGroups = document.querySelectorAll(".toggle-group");

const defaults = {
    tempUnit: "F",
    distanceUnit: "mi"
};

toggleGroups.forEach(group => {
    const settingName = group.dataset.setting;
    const savedValue = localStorage.getItem(settingName) || defaults[settingName];
    const buttons = group.querySelectorAll("button");

    buttons.forEach(button => {
        if (button.dataset.value === savedValue) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            localStorage.setItem(settingName, button.dataset.value);

            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
});


const analyzeFoodBtn = document.getElementById("analyzeFoodBtn");

analyzeFoodBtn.addEventListener("click", async () => {
    const food = document.getElementById("food").value;

    const response = await fetch("/analyze-food", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `food=${encodeURIComponent(food)}`
    });

    const data = await response.json();

    document.getElementById("calories").value = data.calories;
    document.getElementById("protein").value = data.protein;
    document.getElementById("carbs").value = data.carbs;
    document.getElementById("fat").value = data.fat;
});