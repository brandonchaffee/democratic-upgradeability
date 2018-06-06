pragma solidity ^0.4.23;

import "../DemocraticUpgrading.sol";

contract DemTokenV2 is  DemocraticUpgrading {
    constructor() public {

    }

    event Burn(address indexed from, uint256 value);
    function burn(uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        emit Burn(msg.sender, _value);
        return true;
    }
}
