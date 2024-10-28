// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract IotaLights {
    struct Lights {
        bool light1;
        bool light2;
        bool light3;
    }

    Lights public currentLights;

    event LightStatusChanged(uint8 lightNumber, bool newState);

    function toggleLight(uint8 lightNumber) public {
        require(lightNumber >= 1 && lightNumber <= 3, "Invalid light number");

        if (lightNumber == 1) {
            currentLights.light1 = !currentLights.light1;
            emit LightStatusChanged(1, currentLights.light1);
        } else if (lightNumber == 2) {
            currentLights.light2 = !currentLights.light2;
            emit LightStatusChanged(2, currentLights.light2);
        } else if (lightNumber == 3) {
            currentLights.light3 = !currentLights.light3;
            emit LightStatusChanged(3, currentLights.light3);
        }
    }

    function getLightsStatus() public view returns (bool, bool, bool) {
        return (currentLights.light1, currentLights.light2, currentLights.light3);
    }
}
