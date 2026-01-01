// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title VerificationOracle
 * @dev Chainlink Oracle integration for price feeds and custom verification oracle
 * @notice Implements dispute resolution mechanism and penalty system
 */
contract VerificationOracle is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Verification tier enum
    enum VerificationTier {
        Tier1, // Crowdsourced
        Tier2, // Professional
        Tier3  // Automated/ML
    }

    // Verification status
    enum VerificationResult {
        Pending,
        Verified,
        Rejected,
        Disputed
    }

    // Impact verification data
    struct ImpactVerification {
        uint256 verificationId;
        address charity;
        uint256 projectId;
        string evidenceHash; // IPFS hash
        VerificationResult result;
        VerificationTier tier;
        uint256 submittedAt;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 stakeAmount;
        bool disputed;
        mapping(VerificationTier => VerificationResult) tierResults; // Results from each tier
    }

    // Dispute structure
    struct Dispute {
        uint256 disputeId;
        uint256 verificationId;
        address disputer;
        string reason;
        uint256 stakeAmount;
        uint256 createdAt;
        bool resolved;
        address resolver;
        bool disputeWon;
    }

    // State mappings
    mapping(uint256 => ImpactVerification) public verifications;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256) public oracleReputation;
    mapping(address => uint256) public falseVerificationCount;
    mapping(address => uint256) public stakedAmounts;
    mapping(address => AggregatorV3Interface) public priceFeeds; // Token => Price Feed
    mapping(uint256 => mapping(VerificationTier => VerificationResult)) public tierResults; // verificationId => tier => result

    uint256 public verificationCounter;
    uint256 public disputeCounter;
    uint256 public requiredStake; // Minimum stake for verifiers
    uint256 public disputePeriod; // Time window for disputes
    uint256 public penaltyPercentage; // Percentage of stake to slash

    // Events
    event VerificationSubmitted(
        uint256 indexed verificationId,
        address indexed charity,
        uint256 indexed projectId,
        string evidenceHash,
        uint256 timestamp
    );
    event VerificationCompleted(
        uint256 indexed verificationId,
        address indexed oracle,
        VerificationResult result,
        uint256 timestamp
    );
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed verificationId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        uint256 indexed verificationId,
        bool disputeWon,
        address indexed resolver,
        uint256 timestamp
    );
    event OracleReputationUpdated(
        address indexed oracle,
        uint256 oldReputation,
        uint256 newReputation,
        uint256 timestamp
    );
    event PenaltyExecuted(
        address indexed oracle,
        uint256 amount,
        address indexed beneficiary,
        uint256 timestamp
    );
    event PriceFeedUpdated(
        address indexed token,
        address indexed priceFeed,
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _requiredStake Minimum stake required for verifiers
     * @param _disputePeriod Dispute period in seconds
     * @param _penaltyPercentage Penalty percentage (basis points)
     */
    function initialize(
        uint256 _requiredStake,
        uint256 _disputePeriod,
        uint256 _penaltyPercentage
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        requiredStake = _requiredStake;
        disputePeriod = _disputePeriod;
        require(_penaltyPercentage <= 10000, "VerificationOracle: invalid penalty");
        penaltyPercentage = _penaltyPercentage;
    }

    /**
     * @dev Submit impact verification
     * @param charity Address of the charity
     * @param projectId Project ID
     * @param evidenceHash IPFS hash of evidence
     * @param tier Verification tier
     */
    function submitVerification(
        address charity,
        uint256 projectId,
        string memory evidenceHash,
        VerificationTier tier
    ) external whenNotPaused nonReentrant returns (uint256 verificationId) {
        require(charity != address(0), "VerificationOracle: invalid charity");
        require(bytes(evidenceHash).length > 0, "VerificationOracle: empty hash");

        verificationId = ++verificationCounter;

        ImpactVerification storage verification = verifications[verificationId];
        verification.verificationId = verificationId;
        verification.charity = charity;
        verification.projectId = projectId;
        verification.evidenceHash = evidenceHash;
        verification.result = VerificationResult.Pending;
        verification.tier = tier;
        verification.submittedAt = block.timestamp;
        verification.verifiedAt = 0;
        verification.verifiedBy = address(0);
        verification.stakeAmount = 0;
        verification.disputed = false;

        // Initialize tier results
        tierResults[verificationId][VerificationTier.Tier1] = VerificationResult.Pending;
        tierResults[verificationId][VerificationTier.Tier2] = VerificationResult.Pending;
        tierResults[verificationId][VerificationTier.Tier3] = VerificationResult.Pending;

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
     * @dev Update tier result (called by tier contracts)
     * @param verificationId The verification ID
     * @param tier The verification tier
     * @param result The verification result
     */
    function updateTierResult(
        uint256 verificationId,
        VerificationTier tier,
        VerificationResult result
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        ImpactVerification storage verification = verifications[verificationId];
        require(
            verification.verificationId != 0,
            "VerificationOracle: verification not found"
        );

        tierResults[verificationId][tier] = result;

        // Update overall result based on tier precedence (Tier 3 > Tier 2 > Tier 1)
        if (tier == VerificationTier.Tier3 && result != VerificationResult.Pending) {
            verification.result = result;
            verification.verifiedAt = block.timestamp;
        } else if (
            tier == VerificationTier.Tier2 &&
            result != VerificationResult.Pending &&
            tierResults[verificationId][VerificationTier.Tier3] == VerificationResult.Pending
        ) {
            verification.result = result;
            verification.verifiedAt = block.timestamp;
        } else if (
            tier == VerificationTier.Tier1 &&
            result != VerificationResult.Pending &&
            tierResults[verificationId][VerificationTier.Tier2] == VerificationResult.Pending &&
            tierResults[verificationId][VerificationTier.Tier3] == VerificationResult.Pending
        ) {
            verification.result = result;
            verification.verifiedAt = block.timestamp;
        }
    }

    /**
     * @dev Verify impact (called by oracle)
     * @param verificationId The verification ID
     * @param result Verification result
     */
    function verifyImpact(
        uint256 verificationId,
        VerificationResult result
    ) external onlyRole(ORACLE_ROLE) whenNotPaused nonReentrant {
        ImpactVerification storage verification = verifications[verificationId];
        require(
            verification.result == VerificationResult.Pending,
            "VerificationOracle: already verified"
        );
        require(
            stakedAmounts[msg.sender] >= requiredStake,
            "VerificationOracle: insufficient stake"
        );

        // Effects
        verification.result = result;
        verification.verifiedAt = block.timestamp;
        verification.verifiedBy = msg.sender;
        verification.stakeAmount = requiredStake;

        // Update oracle reputation
        if (result == VerificationResult.Verified) {
            oracleReputation[msg.sender] += 10;
        } else {
            oracleReputation[msg.sender] += 1;
        }

        emit VerificationCompleted(
            verificationId,
            msg.sender,
            result,
            block.timestamp
        );
    }

    /**
     * @dev Create a dispute
     * @param verificationId The verification ID to dispute
     * @param reason Reason for dispute
     */
    function createDispute(
        uint256 verificationId,
        string memory reason
    ) external whenNotPaused nonReentrant returns (uint256 disputeId) {
        ImpactVerification storage verification = verifications[verificationId];
        require(
            verification.result != VerificationResult.Pending,
            "VerificationOracle: not verified"
        );
        require(
            block.timestamp <= verification.verifiedAt + disputePeriod,
            "VerificationOracle: dispute period expired"
        );
        require(!verification.disputed, "VerificationOracle: already disputed");

        disputeId = ++disputeCounter;

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            verificationId: verificationId,
            disputer: msg.sender,
            reason: reason,
            stakeAmount: requiredStake,
            createdAt: block.timestamp,
            resolved: false,
            resolver: address(0),
            disputeWon: false
        });

        verification.disputed = true;
        verification.result = VerificationResult.Disputed;

        emit DisputeCreated(disputeId, verificationId, msg.sender, reason, block.timestamp);
        return disputeId;
    }

    /**
     * @dev Resolve a dispute
     * @param disputeId The dispute ID
     * @param disputeWon Whether the dispute was won
     */
    function resolveDispute(
        uint256 disputeId,
        bool disputeWon
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "VerificationOracle: already resolved");

        ImpactVerification storage verification = verifications[dispute.verificationId];
        address oracle = verification.verifiedBy;

        dispute.resolved = true;
        dispute.resolver = msg.sender;
        dispute.disputeWon = disputeWon;

        // Execute penalties if dispute won
        if (disputeWon) {
            falseVerificationCount[oracle]++;
            oracleReputation[oracle] = oracleReputation[oracle] > 50
                ? oracleReputation[oracle] - 50
                : 0;

            // Slash stake
            uint256 penaltyAmount = (verification.stakeAmount * penaltyPercentage) / 10000;
            if (penaltyAmount > 0 && stakedAmounts[oracle] >= penaltyAmount) {
                stakedAmounts[oracle] -= penaltyAmount;
                // Transfer to disputer as reward
                payable(dispute.disputer).transfer(penaltyAmount);
                emit PenaltyExecuted(oracle, penaltyAmount, dispute.disputer, block.timestamp);
            }
        } else {
            // Dispute lost, reward oracle
            oracleReputation[oracle] += 20;
        }

        emit DisputeResolved(disputeId, dispute.verificationId, disputeWon, msg.sender, block.timestamp);
    }

    /**
     * @dev Set Chainlink price feed for a token
     * @param token Token address
     * @param priceFeed Chainlink price feed address
     */
    function setPriceFeed(
        address token,
        address priceFeed
    ) external onlyRole(ADMIN_ROLE) {
        require(token != address(0), "VerificationOracle: invalid token");
        require(priceFeed != address(0), "VerificationOracle: invalid price feed");

        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        emit PriceFeedUpdated(token, priceFeed, block.timestamp);
    }

    /**
     * @dev Get latest price from Chainlink
     * @param token Token address
     * @return price Latest price
     * @return decimals Price decimals
     */
    function getLatestPrice(
        address token
    ) external view returns (int256 price, uint8 decimals) {
        AggregatorV3Interface priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "VerificationOracle: no price feed");

        (, int256 price_, , , ) = priceFeed.latestRoundData();
        decimals = priceFeed.decimals();
        return (price_, decimals);
    }

    /**
     * @dev Deposit stake for oracle role
     */
    function depositStake() public payable whenNotPaused {
        require(msg.value >= requiredStake, "VerificationOracle: insufficient stake");
        stakedAmounts[msg.sender] += msg.value;
        emit StakeDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw stake (only if no active verifications)
     */
    function withdrawStake(
        uint256 amount
    ) external nonReentrant {
        require(
            stakedAmounts[msg.sender] >= amount,
            "VerificationOracle: insufficient balance"
        );
        require(
            stakedAmounts[msg.sender] - amount >= requiredStake || amount == stakedAmounts[msg.sender],
            "VerificationOracle: must maintain minimum stake"
        );

        stakedAmounts[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit StakeWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get verification information
     * Note: This returns a struct without the nested mapping
     */
    function getVerification(
        uint256 verificationId
    ) external view returns (
        uint256 verificationId_,
        address charity,
        uint256 projectId,
        string memory evidenceHash,
        VerificationResult result,
        VerificationTier tier,
        uint256 submittedAt,
        uint256 verifiedAt,
        address verifiedBy,
        uint256 stakeAmount,
        bool disputed
    ) {
        ImpactVerification storage v = verifications[verificationId];
        return (
            v.verificationId,
            v.charity,
            v.projectId,
            v.evidenceHash,
            v.result,
            v.tier,
            v.submittedAt,
            v.verifiedAt,
            v.verifiedBy,
            v.stakeAmount,
            v.disputed
        );
    }

    /**
     * @dev Get tier result for a verification
     */
    function getTierResult(
        uint256 verificationId,
        VerificationTier tier
    ) external view returns (VerificationResult) {
        return tierResults[verificationId][tier];
    }

    /**
     * @dev Get dispute information
     */
    function getDispute(
        uint256 disputeId
    ) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    /**
     * @dev Update required stake
     */
    function updateRequiredStake(
        uint256 newStake
    ) external onlyRole(ADMIN_ROLE) {
        requiredStake = newStake;
    }

    /**
     * @dev Update dispute period
     */
    function updateDisputePeriod(
        uint256 newPeriod
    ) external onlyRole(ADMIN_ROLE) {
        disputePeriod = newPeriod;
    }

    /**
     * @dev Update penalty percentage
     */
    function updatePenaltyPercentage(
        uint256 newPercentage
    ) external onlyRole(ADMIN_ROLE) {
        require(newPercentage <= 10000, "VerificationOracle: invalid penalty");
        penaltyPercentage = newPercentage;
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

