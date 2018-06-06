pragma solidity ^0.4.23;

import "../DemocraticUpgrading.sol";

contract DemTokenV1 is  DemocraticUpgrading {
    constructor(uint256 _totalSupply) public {
        balances[msg.sender] = _totalSupply;
    }
}
