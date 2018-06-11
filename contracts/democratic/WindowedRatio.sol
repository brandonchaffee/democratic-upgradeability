pragma solidity ^0.4.23;

import "./GenericProposal.sol";

contract WindowedRatio is GenericProposal {
    uint256 ratioNumerator;
    uint256 ratioDenominator;
    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }

    function voteOnProposal(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Proposal storage p = proposals[_id];
        if(_approve){
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesVotesOf[msg.sender] = balances[msg.sender];
            p.yesTotal += balances[msg.sender];
        } else {
            p.noTotal -= p.noVotesOf[msg.sender];
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
            p.noVotesOf[msg.sender] = balances[msg.sender];
            p.noTotal += balances[msg.sender];
        }
        p.isValid = p.yesTotal * ratioDenominator >= p.noTotal * ratioNumerator;
        inVote[msg.sender].push(_id);
    }
}
