pragma solidity ^0.4.23;

import "../democratic/DemocraticUpgrading.sol";
import "../democratic/WindowedMajority.sol";

contract WindowedMajorityTest is DemocraticUpgrading, WindowedMajority {
    bool internal _initialized;

    function initialize(uint256 _supply, uint256 _window) public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        balances[msg.sender] = _supply;
        windowSize = _window;
        _initialized = true;
    }
}
