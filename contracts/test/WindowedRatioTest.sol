pragma solidity ^0.4.23;

import "../democratic/DemocraticUpgrading.sol";
import "../democratic/WindowedRatio.sol";

contract WindowedRatioTest is DemocraticUpgrading, WindowedRatio {
    bool internal _initialized;

    function initialize(
        uint256 _supply,
        uint256 _window,
        uint256 _numerator,
        uint256 _denominator
    ) public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        windowSize = _window;
        ratioNumerator = _numerator;
        ratioDenominator = _denominator;
        balances[msg.sender] = _supply;
        _initialized = true;

    }
}
