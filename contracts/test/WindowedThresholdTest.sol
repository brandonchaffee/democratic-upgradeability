pragma solidity ^0.4.23;

import "../democratic/DemocraticUpgrading.sol";
import "../democratic/WindowedThreshold.sol";

contract WindowedThresholdTest is DemocraticUpgrading, WindowedThreshold {
    bool internal _initialized;

    function initialize(uint256 _supply, uint256 _window, uint256 _threshold)
    public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        balances[msg.sender] = _supply;
        approvalThreshold = _threshold;
        windowSize = _window;
        _initialized = true;

    }
}
