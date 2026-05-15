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