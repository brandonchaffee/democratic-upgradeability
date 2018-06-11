pragma solidity ^0.4.23;

import "../democratic/DemocraticUpgrading.sol";
import "../democratic/EndlessThreshold.sol";

contract EndlessThresholdTest is DemocraticUpgrading, EndlessThreshold {
    bool internal _initialized;

    function initialize(uint256 _supply, uint256 _threshold)
    public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        approvalThreshold = _threshold;
        balances[msg.sender] = _supply;
        _initialized = true;

    }
}
