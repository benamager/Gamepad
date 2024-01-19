const pollInterval = 25;

var gamepad;
var polling;

window.addEventListener("gamepadconnected", function (e) {
    document.getElementById("status").textContent = "Connected";
    document.getElementById("id").textContent = e.gamepad.id;
    document.querySelector(".statusIndicator").style.backgroundColor = "green";

    gamepad = e.gamepad;
});

window.addEventListener("gamepaddisconnected", function (e) {
    document.getElementById("status").textContent = "Disconnected";
    document.getElementById("id").textContent = "";
    document.querySelector(".statusIndicator").style.backgroundColor = "red";

    gamepad = null;
});

const buttonMapping = {
    // Buttons
    3: "buttons_up",
    1: "buttons_right",
    2: "buttons_left",
    0: "buttons_down",
    // Arrows
    12: "arrows_up",
    15: "arrows_right",
    13: "arrows_down",
    14: "arrows_left",
    // Left triggers
    4: "leftTriggers_up",
    6: "leftTriggers_down",
    // Right triggers
    5: "rightTriggers_up",
    7: "rightTriggers_down",
};

// Reset the gamepad input elements
function resetButtons() {
    // Buttons
    Object.values(buttonMapping).forEach((buttonClass, index) => {
        let element = document.querySelector(`.${buttonClass}`);
        element.style.background = "rgb(0, 0, 0, 0.1)";
    });

    // Stick positioning
    document.querySelector(".leftStick_dot").style.left = "50%";
    document.querySelector(".leftStick_dot").style.top = "50%";
    document.querySelector(".rightStick_dot").style.left = "50%";
    document.querySelector(".rightStick_dot").style.top = "50%";

    // Stick opacity
    document.querySelector(".leftStick_dot").style.background = "rgb(0, 0, 0, 0.1)";
    document.querySelector(".rightStick_dot").style.background = "rgb(0, 0, 0, 0.1)";
}

function handleButtonPress(buttonIndex, value) {
    const action = buttonMapping[buttonIndex];

    if (action) {
        const element = document.querySelector(`.${action}`);

        // Bottom left/right triggers which are pressure sensitive
        if (buttonIndex === 6 || buttonIndex === 7) {
            // Calculate gradient percentage
            let percentage = value * 100;

            // Apply a linear gradient from either left or right, and overlay it with black at 0.1 opacity
            const to = buttonIndex === 6 ? "left" : "right";
            element.style.background = `linear-gradient(to ${to}, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), linear-gradient(to ${to}, black ${percentage}%, transparent ${percentage}%)`;
        } else {
            element.style.backgroundColor = "rgba(0, 0, 0, 1)";
        }
    }
}

function handleAxisMove(axisIndex, value) {
    const leftStickDot = document.querySelector(".leftStick_dot");
    const rightStickDot = document.querySelector(".rightStick_dot");

    // Map the axis value from [-1, 1] to [0%, 100%]
    const position = ((value + 1) / 2) * 100;

    // Update position for left or right stick dot and calculate opacity
    function handleStickDot(stick, axisIndex1, axisIndex2) {
        stick.style.left = axisIndex === axisIndex1 ? `${position}%` : stick.style.left;
        stick.style.top = axisIndex === axisIndex2 ? `${position}%` : stick.style.top;

        const horizontalDistance = Math.abs((stick.style.left.replace("%", "") || 50) - 50);
        const verticalDistance = Math.abs((stick.style.top.replace("%", "") || 50) - 50);
        const maxDistance = Math.max(horizontalDistance, verticalDistance);
        const opacity = Math.max(maxDistance / 50, 0.1);

        stick.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    }

    // Left or right stick
    if (axisIndex === 0 || axisIndex === 1) {
        handleStickDot(leftStickDot, 0, 1);
    } else if (axisIndex === 2 || axisIndex === 3) {
        handleStickDot(rightStickDot, 2, 3);
    }
}

function startPolling() {
    // Stop any existing polling
    if (polling) {
        clearInterval(polling);
    }

    polling = setInterval(() => {
        resetButtons();
        const gamepad = navigator.getGamepads()[0];

        if (gamepad) {
            // Button values
            gamepad.buttons.forEach((button, index) => {
                if (button.value > 0) {
                    handleButtonPress(index, button.value);
                }
            });
            // Axes values
            gamepad.axes.forEach((axis, index) => {
                if (axis > 0.05 || axis < -0.05) {
                    handleAxisMove(index, axis);
                }
            });
        }
    }, pollInterval);
}
startPolling();

// Firefox Gamepad API is lacking
var isFirefox = typeof InstallTrigger !== "undefined";
if (isFirefox) {
    document.getElementById("error").textContent = "Firefox gamepad API is lacking, consider using any Chromium based browser instead.";
    document.getElementById("error").style.display = "block";
}
