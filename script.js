var gamepad;
var polling;

window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
    document.getElementById("status").textContent = "Connected";
    document.getElementById("id").textContent = e.gamepad.id;
    gamepad = e.gamepad;
});

window.addEventListener("gamepaddisconnected", function (e) {
    console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
    document.getElementById("status").textContent = "Disconnected";
    document.getElementById("id").textContent = "";
    gamepad = null;
});

/*  Mapping of buttons for PS5 controller, based on index
    Dont know if they differ per controller as I only have a PS5 one for testing */
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

// Reset the style of all buttons
function resetButtons() {
    Object.values(buttonMapping).forEach((buttonClass) => {
        document.querySelector(`.${buttonClass}`).style.backgroundColor = "rgb(0, 0, 0, 0.1)";
    });
    document.querySelector(".leftStick_dot").style.left = "50%";
    document.querySelector(".leftStick_dot").style.top = "50%";
    document.querySelector(".rightStick_dot").style.left = "50%";
    document.querySelector(".rightStick_dot").style.top = "50%";
}

function handleButtonPress(buttonIndex, value) {
    const action = buttonMapping[buttonIndex];

    if (action) {
        console.log(`Button ${buttonIndex} pressed, corresponding to ${action}`);
        document.querySelector(`.${action}`).style.backgroundColor = `rgb(0, 0, 0, ${value})`;
    }
}

function handleAxisMove(axisIndex, value) {
    const leftStickDot = document.querySelector(".leftStick_dot");
    const rightStickDot = document.querySelector(".rightStick_dot");

    // Map the axis value from [-1, 1] to [0%, 100%]
    const position = ((value + 1) / 2) * 100;

    // Left stick
    // Horizontal movement
    if (axisIndex === 0) {
        leftStickDot.style.left = `${position}%`;
    } else if (axisIndex === 1) {
        // Vertical movement
        leftStickDot.style.top = `${position}%`;
    }

    // Right stick
    // Horizontal movement
    if (axisIndex === 2) {
        rightStickDot.style.left = `${position}%`;
    } else if (axisIndex === 3) {
        // Vertical movement
        rightStickDot.style.top = `${position}%`;
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
                if (button.pressed) {
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
    }, 20); // Poll every 100 milliseconds
}

startPolling();
