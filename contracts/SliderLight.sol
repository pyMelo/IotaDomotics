// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SliderLight {
    address public owner;

    uint public lightIntensity; // Intensity level from 0-100

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function setLightIntensity(uint _intensity) external onlyOwner {
        require(_intensity <= 100, "Intensity out of range");
        lightIntensity = _intensity;
    }
}
