// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SliderLight {
    address public owner;

    uint public lightIntensity;
    bool public isLightOn; 

    constructor() {
        owner = msg.sender;
        isLightOn = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function setLightIntensity(uint _intensity) external onlyOwner {
        require(_intensity <= 100, "Intensity out of range");
        lightIntensity = _intensity;
        isLightOn = true;
    }

    function turnLightOff() external onlyOwner {
        isLightOn = false; 
    }
}
