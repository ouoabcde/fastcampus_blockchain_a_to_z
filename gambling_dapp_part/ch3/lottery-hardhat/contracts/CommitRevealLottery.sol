// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract CommitRevealLottery {
    uint256 public commitCloses;
    uint256 public revealCloses;
    uint256 public constant DURATION = 4;

    uint256 public lotteryId;
    address[] public players;
    address public winner;
    bytes32 seed;
    mapping (address => bytes32) public commitments;
    mapping (uint256 => address) public lotteryHistory;

    constructor() {
        commitCloses = block.number + DURATION;
        revealCloses = commitCloses + DURATION;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function enter(bytes32 commitment) public payable {
        require(msg.value >= .01 ether, "msg.value should be greater than or equal to 0.01 ether");
        require(block.number < commitCloses, "commit duration is over");
        
        commitments[msg.sender] = commitment;
    }

    function createCommitment(uint256 secret) public view returns (bytes32) {
        return keccak256(abi.encodePacked(msg.sender, secret));
    }

    function isAlreadyRevealed() public view returns (bool) {
        for (uint256 i; i < players.length; i++) {
            if (msg.sender == players[i]) return true;
        }
        return false;
    }

    function reveal(uint256 secret) public {
        require(block.number >= commitCloses, "commit duration is not closed yet");
        require(block.number < revealCloses, "reveal duration is already closed");
        require(!isAlreadyRevealed(), "You already revealed");
        
        bytes32 commit = createCommitment(secret);
        require(commit == commitments[msg.sender], "commit not matches");
        
        seed = keccak256(abi.encodePacked(seed, secret));
        players.push(msg.sender);
    }

    function pickWinner() public {
        require(block.number >= revealCloses, "Not yet to pick winner");
        require(winner == address(0), "winner is already set");

        winner = players[uint256(seed) % players.length];

        lotteryHistory[lotteryId] = winner;
        lotteryId++;
    }

    function withdrawPrize() public {
        require(msg.sender == winner, "You're not the winner");

        // initialize for next phase
        delete winner;
        for (uint256 i = 0; i < players.length; i++) {
            delete commitments[players[i]];
        }
        delete players;
        delete seed;

        commitCloses = block.number + DURATION;
        revealCloses = commitCloses + DURATION;

        (bool success, ) = payable(msg.sender).call{ value: address(this).balance }("");
        require(success, "Failed to send Ether to winner");
    }
}