// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartHome {
    struct Light {
        bool isOn;
    }

    struct Heater {
        bool isOn;
    }

    struct Door {
        bool isOpen;
    }

    mapping(uint256 => Light) private lights;
    mapping(uint256 => Heater) private heaters;
    mapping(uint256 => Door) private doors;

    // Events
    event LightUpdated(uint256 indexed lightId, bool isOn);
    event HeaterUpdated(uint256 indexed heaterId, bool isOn);
    event DoorUpdated(uint256 indexed doorId, bool isOpen);

    // Control functions
    function setLight(uint256 lightId, bool isOn) external {
        lights[lightId].isOn = isOn;
        emit LightUpdated(lightId, isOn);
    }

    function setHeater(uint256 heaterId, bool isOn) external {
        heaters[heaterId].isOn = isOn;
        emit HeaterUpdated(heaterId, isOn);
    }

    function setDoor(uint256 doorId, bool isOpen) external {
        doors[doorId].isOpen = isOpen;
        emit DoorUpdated(doorId, isOpen);
    }

    // Getter functions
    function getLight(uint256 lightId) public view returns (bool) {
        return lights[lightId].isOn;
    }

    function getHeater(uint256 heaterId) public view returns (bool) {
        return heaters[heaterId].isOn;
    }

    function getDoor(uint256 doorId) public view returns (bool) {
        return doors[doorId].isOpen;
    }
}
