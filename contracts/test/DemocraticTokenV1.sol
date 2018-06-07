pragma solidity ^0.4.23;

import "../DemocraticUpgrading.sol";

contract DemTokenV1 is  DemocraticUpgrading {
    bool internal _initialized;

    constructor(uint256 _window, uint256 _totalSupply) public
    DemocraticUpgrading(_window, _totalSupply) {
    }

    function initialize(uint256 _supply, uint256 _window) public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        balances[msg.sender] = _supply;
        windowSize = _window;
        _initialized = true;
    }

}
