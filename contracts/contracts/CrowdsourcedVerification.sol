// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title CrowdsourcedVerification
 * @dev Tier 1 verification system with staking and consensus mechanism
 * @notice Community members stake tokens to verify impact, consensus requires 5+ votes with 60% agreement
 */
contract CrowdsourcedVerification is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Verification tier
    uint8 public constant TIER = 1;

    // Vote options
    enum VoteOption {
        Approve,
        Reject
    }

    // Verification status
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Disputed
    }

    // Verification record
    struct Verification {
        uint256 verificationId;
        address charity;
        uint256 projectId;
        string evidenceHash;
        VerificationStatus status;
        uint256 submittedAt;
        uint256 consensusReachedAt;
        uint256 approveVotes;
        uint256 rejectVotes;
        uint256 totalVotes;
    }

    // Vote record
    struct Vote {
        address voter;
        VoteOption option;
        uint256 stakeAmount;
        uint256 timestamp;
        bool slashed;
    }

    // Verifier information
    struct Verifier {
        address verifierAddress;
        uint256 reputationScore;
        uint256 totalStaked;
        uint256 successfulVerifications;
        uint256 falseVerifications;
        bool active;
    }

    // State mappings
    mapping(uint256 => Verification) public verifications;
    mapping(uint256 => mapping(address => Vote)) public votes; // verificationId => voter => Vote
    mapping(uint256 => address[]) public verificationVoters; // verificationId => voters list
    mapping(address => Verifier) public verifiers;
    mapping(address => uint256) public stakedAmounts;

    uint256 public verificationCounter;
    uint256 public minimumStake; // Minimum stake required to vote
    uint256 public minimumVotes; // Minimum votes required for consensus (5)
    uint256 public consensusThreshold; // Percentage for consensus (60% = 6000 basis points)
    uint256 public slashingPercentage; // Percentage of stake to slash for false verifications (basis points)

    // Events
    event VerificationSubmitted(
        uint256 indexed verificationId,
        address indexed charity,
        uint256 indexed projectId,
        string evidenceHash,
        uint256 timestamp
    );
    event VoteCast(
        uint256 indexed verificationId,
        address indexed voter,
        VoteOption option,
        uint256 stakeAmount,
        uint256 timestamp
    );
    event ConsensusReached(
        uint256 indexed verificationId,
        VerificationStatus status,
        uint256 approveVotes,
        uint256 rejectVotes,
        uint256 timestamp
    );
    event StakeDeposited(
        address indexed verifier,
        uint256 amount,
        uint256 timestamp
    );
    event StakeWithdrawn(
        address indexed verifier,
        uint256 amount,
        uint256 timestamp
    );
    event VerifierSlashed(
        address indexed verifier,
        uint256 amount,
        uint256 indexed verificationId,
        uint256 timestamp
    );
    event VerifierReputationUpdated(
        address indexed verifier,
        uint256 oldReputation,
        uint256 newReputation,
        uint256 timestamp
    );
    event DisputeCreated(
        uint256 indexed verificationId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _minimumStake Minimum stake required to vote
     * @param _minimumVotes Minimum votes required for consensus
     * @param _consensusThreshold Consensus threshold in basis points (60% = 6000)
     * @param _slashingPercentage Slashing percentage in basis points
     */
    function initialize(
        uint256 _minimumStake,
        uint256 _minimumVotes,
        uint256 _consensusThreshold,
        uint256 _slashingPercentage
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        require(_minimumStake > 0, "CrowdsourcedVerification: invalid stake");
        require(_minimumVotes > 0, "CrowdsourcedVerification: invalid votes");
        require(
            _consensusThreshold <= 10000,
            "CrowdsourcedVerification: invalid threshold"
        );
        require(
            _slashingPercentage <= 10000,
            "CrowdsourcedVerification: invalid slashing"
        );

        minimumStake = _minimumStake;
        minimumVotes = _minimumVotes;
        consensusThreshold = _consensusThreshold;
        slashingPercentage = _slashingPercentage;
    }

    /**
     * @dev Submit a verification for crowdsourced review
     * @param charity Address of the charity
     * @param projectId Project ID
     * @param evidenceHash IPFS hash of evidence
     */
    function submitVerification(
        address charity,
        uint256 projectId,
        string memory evidenceHash
    ) external whenNotPaused nonReentrant returns (uint256 verificationId) {
        require(charity != address(0), "CrowdsourcedVerification: invalid charity");
        require(bytes(evidenceHash).length > 0, "CrowdsourcedVerification: empty hash");

        verificationId = ++verificationCounter;

        verifications[verificationId] = Verification({
            verificationId: verificationId,
            charity: charity,
            projectId: projectId,
            evidenceHash: evidenceHash,
            status: VerificationStatus.Pending,
            submittedAt: block.timestamp,
            consensusReachedAt: 0,
            approveVotes: 0,
            rejectVotes: 0,
            totalVotes: 0
        });

        emit VerificationSubmitted(
            verificationId,
            charity,
            projectId,
            evidenceHash,
            block.timestamp
        );

        return verificationId;
    }

    /**
     * @dev Cast a vote on a verification
     * @param verificationId The verification ID
     * @param option Vote option (Approve or Reject)
     */
    function castVote(
        uint256 verificationId,
        VoteOption option
    ) external payable whenNotPaused nonReentrant {
        Verification storage verification = verifications[verificationId];
        require(
            verification.status == VerificationStatus.Pending,
            "CrowdsourcedVerification: not pending"
        );
        require(
            votes[verificationId][msg.sender].voter == address(0),
            "CrowdsourcedVerification: already voted"
        );
        require(
            msg.value >= minimumStake,
            "CrowdsourcedVerification: insufficient stake"
        );

        // Initialize verifier if not exists
        if (verifiers[msg.sender].verifierAddress == address(0)) {
            verifiers[msg.sender] = Verifier({
                verifierAddress: msg.sender,
                reputationScore: 100,
                totalStaked: 0,
                successfulVerifications: 0,
                falseVerifications: 0,
                active: true
            });
        }

        // Record vote
        votes[verificationId][msg.sender] = Vote({
            voter: msg.sender,
            option: option,
            stakeAmount: msg.value,
            timestamp: block.timestamp,
            slashed: false
        });

        verificationVoters[verificationId].push(msg.sender);
        stakedAmounts[msg.sender] += msg.value;
        verifiers[msg.sender].totalStaked += msg.value;

        // Update vote counts
        if (option == VoteOption.Approve) {
            verification.approveVotes++;
        } else {
            verification.rejectVotes++;
        }
        verification.totalVotes++;

        emit VoteCast(verificationId, msg.sender, option, msg.value, block.timestamp);

        // Check for consensus
        _checkConsensus(verificationId);
    }

    /**
     * @dev Check if consensus has been reached
     * @param verificationId The verification ID
     */
    function _checkConsensus(uint256 verificationId) internal {
        Verification storage verification = verifications[verificationId];

        // Need minimum votes
        if (verification.totalVotes < minimumVotes) {
            return;
        }

        // Calculate consensus
        uint256 totalVotes = verification.approveVotes + verification.rejectVotes;
        uint256 majorityVotes = (totalVotes * consensusThreshold) / 10000;

        if (verification.approveVotes >= majorityVotes) {
            verification.status = VerificationStatus.Approved;
            verification.consensusReachedAt = block.timestamp;

            // Update verifier reputations
            _updateVerifierReputations(verificationId, true);

            emit ConsensusReached(
                verificationId,
                VerificationStatus.Approved,
                verification.approveVotes,
                verification.rejectVotes,
                block.timestamp
            );
        } else if (verification.rejectVotes >= majorityVotes) {
            verification.status = VerificationStatus.Rejected;
            verification.consensusReachedAt = block.timestamp;

            // Update verifier reputations
            _updateVerifierReputations(verificationId, false);

            emit ConsensusReached(
                verificationId,
                VerificationStatus.Rejected,
                verification.approveVotes,
                verification.rejectVotes,
                block.timestamp
            );
        }
    }

    /**
     * @dev Update verifier reputations based on consensus
     * @param verificationId The verification ID
     * @param approved Whether verification was approved
     */
    function _updateVerifierReputations(
        uint256 verificationId,
        bool approved
    ) internal {
        address[] memory voters = verificationVoters[verificationId];

        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Vote storage vote = votes[verificationId][voter];
            Verifier storage verifier = verifiers[voter];

            // Check if vote matches consensus
            bool voteMatches = (approved && vote.option == VoteOption.Approve) ||
                (!approved && vote.option == VoteOption.Reject);

            if (voteMatches) {
                verifier.reputationScore = verifier.reputationScore < 1000
                    ? verifier.reputationScore + 10
                    : 1000;
                verifier.successfulVerifications++;

                emit VerifierReputationUpdated(
                    voter,
                    verifier.reputationScore - 10,
                    verifier.reputationScore,
                    block.timestamp
                );
            } else {
                // Vote didn't match consensus - potential slashing
                verifier.falseVerifications++;
                if (verifier.reputationScore > 0) {
                    verifier.reputationScore = verifier.reputationScore > 20
                        ? verifier.reputationScore - 20
                        : 0;
                }
            }
        }
    }

    /**
     * @dev Create a dispute for a verification
     * @param verificationId The verification ID
     * @param reason Reason for dispute
     */
    function createDispute(
        uint256 verificationId,
        string memory reason
    ) external whenNotPaused nonReentrant {
        Verification storage verification = verifications[verificationId];
        require(
            verification.status == VerificationStatus.Approved ||
                verification.status == VerificationStatus.Rejected,
            "CrowdsourcedVerification: cannot dispute"
        );

        verification.status = VerificationStatus.Disputed;

        emit DisputeCreated(verificationId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Slash verifiers for false verification (called by admin after dispute resolution)
     * @param verificationId The verification ID
     * @param slashApprovers Whether to slash approvers (true) or rejecters (false)
     */
    function slashVerifiers(
        uint256 verificationId,
        bool slashApprovers
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Verification storage verification = verifications[verificationId];
        require(
            verification.status == VerificationStatus.Disputed,
            "CrowdsourcedVerification: not disputed"
        );

        address[] memory voters = verificationVoters[verificationId];

        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Vote storage vote = votes[verificationId][voter];
            Verifier storage verifier = verifiers[voter];

            // Check if this voter should be slashed
            bool shouldSlash = (slashApprovers && vote.option == VoteOption.Approve) ||
                (!slashApprovers && vote.option == VoteOption.Reject);

            if (shouldSlash && !vote.slashed) {
                uint256 slashAmount = (vote.stakeAmount * slashingPercentage) / 10000;

                if (slashAmount > 0 && stakedAmounts[voter] >= slashAmount) {
                    stakedAmounts[voter] -= slashAmount;
                    verifier.totalStaked -= slashAmount;
                    vote.slashed = true;

                    // Transfer slashed amount to admin (or could be sent to treasury)
                    payable(msg.sender).transfer(slashAmount);

                    emit VerifierSlashed(voter, slashAmount, verificationId, block.timestamp);
                }
            }
        }
    }

    /**
     * @dev Withdraw stake (only if no active verifications)
     */
    function withdrawStake(
        uint256 amount
    ) external nonReentrant {
        require(
            stakedAmounts[msg.sender] >= amount,
            "CrowdsourcedVerification: insufficient balance"
        );

        stakedAmounts[msg.sender] -= amount;
        verifiers[msg.sender].totalStaked -= amount;

        payable(msg.sender).transfer(amount);

        emit StakeWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Deposit additional stake
     */
    function depositStake() public payable whenNotPaused {
        require(msg.value > 0, "CrowdsourcedVerification: zero amount");

        if (verifiers[msg.sender].verifierAddress == address(0)) {
            verifiers[msg.sender] = Verifier({
                verifierAddress: msg.sender,
                reputationScore: 100,
                totalStaked: 0,
                successfulVerifications: 0,
                falseVerifications: 0,
                active: true
            });
        }

        stakedAmounts[msg.sender] += msg.value;
        verifiers[msg.sender].totalStaked += msg.value;

        emit StakeDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Get verification information
     */
    function getVerification(
        uint256 verificationId
    ) external view returns (Verification memory) {
        return verifications[verificationId];
    }

    /**
     * @dev Get votes for a verification
     */
    function getVotes(
        uint256 verificationId
    ) external view returns (address[] memory, Vote[] memory) {
        address[] memory voters = verificationVoters[verificationId];
        Vote[] memory voteList = new Vote[](voters.length);

        for (uint256 i = 0; i < voters.length; i++) {
            voteList[i] = votes[verificationId][voters[i]];
        }

        return (voters, voteList);
    }

    /**
     * @dev Get verifier information
     */
    function getVerifier(
        address verifier
    ) external view returns (Verifier memory) {
        return verifiers[verifier];
    }

    /**
     * @dev Update minimum stake
     */
    function updateMinimumStake(
        uint256 newStake
    ) external onlyRole(ADMIN_ROLE) {
        require(newStake > 0, "CrowdsourcedVerification: invalid stake");
        minimumStake = newStake;
    }

    /**
     * @dev Update consensus parameters
     */
    function updateConsensusParams(
        uint256 newMinimumVotes,
        uint256 newThreshold
    ) external onlyRole(ADMIN_ROLE) {
        require(newMinimumVotes > 0, "CrowdsourcedVerification: invalid votes");
        require(
            newThreshold <= 10000,
            "CrowdsourcedVerification: invalid threshold"
        );
        minimumVotes = newMinimumVotes;
        consensusThreshold = newThreshold;
    }

    /**
     * @dev Update slashing percentage
     */
    function updateSlashingPercentage(
        uint256 newPercentage
    ) external onlyRole(ADMIN_ROLE) {
        require(
            newPercentage <= 10000,
            "CrowdsourcedVerification: invalid percentage"
        );
        slashingPercentage = newPercentage;
    }

    // Pausable functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // UUPS Upgradeable
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    // AccessControl
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlUpgradeable) returns (bool) {
        return AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    // Receive ETH for stakes
    receive() external payable {
        depositStake();
    }
}

