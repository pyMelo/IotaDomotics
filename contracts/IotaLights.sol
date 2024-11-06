// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IotaLights {
    bool[3] public lights;

    function toggleLight(uint8 lightNumber) public {
        require(lightNumber < 3, "Invalid light number");
        lights[lightNumber] = !lights[lightNumber];
    }

    function getLightsStatus() public view returns (bool, bool, bool) {
        return (lights[0], lights[1], lights[2]);
    }
}