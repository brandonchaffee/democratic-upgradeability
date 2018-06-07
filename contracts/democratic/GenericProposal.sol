pragma solidity ^0.4.23;

import "./BlockableTransfer.sol";

contract GenericProposal is BlockableTransfer {
    Proposal[] public proposals;

    struct Proposal {
        address target;
        uint256 windowEnd;
        bool isValid;
        uint yesTotal;
        uint noTotal;
        mapping(address => uint) yesVotesOf;
        mapping(address => uint) noVotesOf;
        bool hasBeenApproved;
    }

    event ProposalCreated(
        address indexed target,
        uint256 indexed windowEnd,
        uint256 indexed id,
        bytes32 detailsHash
    );

    function createProposal(address _target, bytes32 _hash)
    public returns(uint256){
        uint256 _id = proposals.length++;
        Proposal storage p = proposals[_id];
        p.target = _target;
        p.windowEnd = now + windowSize;
        emit ProposalCreated(_target, p.windowEnd, _id, _hash);
        return _id;
    }

    function unblockTransfer() public {
        for(uint i=0; i < inVote[msg.sender].length; i++){
            Proposal storage p = proposals[i];
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
        }
        delete inVote[msg.sender];
    }

    modifier inVoteWindow(uint256 _id) {
        require(now < proposals[_id].windowEnd);
        _;
    }

    function voteOnProposal(uint256 _id, bool _approve)
        inVoteWindow(_id)
    public {
        Proposal storage p = proposals[_id];
        if(_approve){
            p.noTotal -= p.noVotesOf[msg.sender];
            p.noVotesOf[msg.sender] = 0;
            p.yesVotesOf[msg.sender] = balances[msg.sender];
            p.yesTotal += balances[msg.sender];
        } else {
            p.yesTotal -= p.yesVotesOf[msg.sender];
            p.yesVotesOf[msg.sender] = 0;
            p.noVotesOf[msg.sender] = balances[msg.sender];
            p.noTotal += balances[msg.sender];
        }
        p.isValid = p.yesTotal > p.noTotal;
        inVote[msg.sender].push(_id);
    }

    function confirmProposal(uint256 _id) public {
        Proposal storage p = proposals[_id];
        require(now > p.windowEnd);
        require(p.isValid);
        require(!p.hasBeenApproved);
        p.hasBeenApproved = true;
    }


}
