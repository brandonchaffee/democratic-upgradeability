pragma solidity ^0.4.23;

import "../democratic/DemocraticUpgrading.sol";

contract DemTokenV3 is  DemocraticUpgrading {
    bool internal _initialized;

    function initialize(uint256 _supply, uint256 _window) public {
        //These initialization arguments should be hardcoded
        require(!_initialized);
        totalSupply_ = _supply;
        balances[msg.sender] = _supply;
        windowSize = _window;
        _initialized = true;
    }

    event Burn(address indexed from, uint256 value);
    function burn(uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        totalSupply_ -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }

    function foo() public pure {

    }
}
