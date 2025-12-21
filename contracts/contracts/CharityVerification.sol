// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title CharityVerification
 * @dev Multi-sig approval system for charity onboarding with reputation scoring
 * @notice Implements challenge period for fraud reports and slashing conditions
 */
contract CharityVerification is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Verification status enum
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Challenged,
        Suspended
    }

    // Charity information
    struct Charity {
        address charityAddress;
        string name;
        string description;
        string registrationNumber;
        uint256 reputationScore;
        VerificationStatus status;
        uint256 createdAt;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 challengePeriodEnd;
    }

    // Multi-sig requirements
    uint256 public requiredApprovals;
    uint256 public challengePeriodDuration; // in seconds

    // State mappings
    mapping(address => Charity) public charities;
    mapping(address => mapping(address => bool)) public verifierApprovals;
    mapping(address => uint256) public approvalCounts;
    mapping(address => address[]) public charityVerifiers;
    mapping(address => uint256) public reputationHistory;
    mapping(address => uint256) public fraudReports;

    // Events
    event CharityRegistered(
        address indexed charity,
        string name,
        uint256 timestamp
    );
    event VerificationApproved(
        address indexed charity,
        address indexed verifier,
        uint256 approvalCount,
        uint256 timestamp
    );
    event CharityVerified(
        address indexed charity,
        address[] verifiers,
        uint256 timestamp
    );
    event CharityRejected(
        address indexed charity,
        address indexed verifier,
        string reason,
        uint256 timestamp
    );
    event FraudReported(
        address indexed charity,
        address indexed reporter,
        string reason,
        uint256 timestamp
    );
    event ChallengePeriodStarted(
        address indexed charity,
        uint256 endTimestamp
    );
    event CharitySuspended(
        address indexed charity,
        address indexed admin,
        string reason,
        uint256 timestamp
    );
    event ReputationUpdated(
        address indexed charity,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    event SlashingExecuted(
        address indexed charity,
        uint256 amount,
        address indexed beneficiary,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _requiredApprovals Number of verifier approvals needed
     * @param _challengePeriodDuration Challenge period duration in seconds
     */
    function initialize(
        uint256 _requiredApprovals,
        uint256 _challengePeriodDuration
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        require(_requiredApprovals > 0, "CharityVerification: invalid approvals");
        requiredApprovals = _requiredApprovals;
        challengePeriodDuration = _challengePeriodDuration;
    }

    /**
     * @dev Register a new charity for verification
     * @param charityAddress Address of the charity
     * @param name Charity name
     * @param description Charity description
     * @param registrationNumber Official registration number
     */
    function registerCharity(
        address charityAddress,
        string memory name,
        string memory description,
        string memory registrationNumber
    ) external whenNotPaused nonReentrant {
        require(
            charityAddress != address(0),
            "CharityVerification: invalid address"
        );
        require(
            charities[charityAddress].charityAddress == address(0),
            "CharityVerification: already registered"
        );
        require(bytes(name).length > 0, "CharityVerification: empty name");

        charities[charityAddress] = Charity({
            charityAddress: charityAddress,
            name: name,
            description: description,
            registrationNumber: registrationNumber,
            reputationScore: 100, // Initial score
            status: VerificationStatus.Pending,
            createdAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0),
            challengePeriodEnd: 0
        });

        emit CharityRegistered(charityAddress, name, block.timestamp);
    }

    /**
     * @dev Approve a charity verification (multi-sig)
     * @param charityAddress Address of the charity to approve
     */
    function approveVerification(
        address charityAddress
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused nonReentrant {
        Charity storage charity = charities[charityAddress];
        require(
            charity.status == VerificationStatus.Pending,
            "CharityVerification: not pending"
        );
        require(
            !verifierApprovals[charityAddress][msg.sender],
            "CharityVerification: already approved"
        );

        // Effects
        verifierApprovals[charityAddress][msg.sender] = true;
        approvalCounts[charityAddress]++;
        charityVerifiers[charityAddress].push(msg.sender);

        emit VerificationApproved(
            charityAddress,
            msg.sender,
            approvalCounts[charityAddress],
            block.timestamp
        );

        // Check if we have enough approvals
        if (approvalCounts[charityAddress] >= requiredApprovals) {
            charity.status = VerificationStatus.Approved;
            charity.verifiedAt = block.timestamp;
            charity.verifiedBy = msg.sender;
            charity.challengePeriodEnd = block.timestamp + challengePeriodDuration;

            emit CharityVerified(
                charityAddress,
                charityVerifiers[charityAddress],
                block.timestamp
            );
            emit ChallengePeriodStarted(charityAddress, charity.challengePeriodEnd);
        }
    }

    /**
     * @dev Reject a charity verification
     * @param charityAddress Address of the charity to reject
     * @param reason Reason for rejection
     */
    function rejectVerification(
        address charityAddress,
        string memory reason
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        Charity storage charity = charities[charityAddress];
        require(
            charity.status == VerificationStatus.Pending,
            "CharityVerification: not pending"
        );

        charity.status = VerificationStatus.Rejected;

        emit CharityRejected(charityAddress, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Report fraud on a charity
     * @param charityAddress Address of the charity
     * @param reason Reason for fraud report
     */
    function reportFraud(
        address charityAddress,
        string memory reason
    ) external whenNotPaused nonReentrant {
        Charity storage charity = charities[charityAddress];
        require(
            charity.status == VerificationStatus.Approved ||
                charity.status == VerificationStatus.Challenged,
            "CharityVerification: cannot challenge"
        );

        // If within challenge period, start challenge
        if (
            charity.status == VerificationStatus.Approved &&
            block.timestamp <= charity.challengePeriodEnd
        ) {
            charity.status = VerificationStatus.Challenged;
            emit ChallengePeriodStarted(charityAddress, charity.challengePeriodEnd);
        }

        fraudReports[charityAddress]++;
        emit FraudReported(charityAddress, msg.sender, reason, block.timestamp);

        // Auto-suspend if too many fraud reports
        if (fraudReports[charityAddress] >= 5) {
            charity.status = VerificationStatus.Suspended;
            emit CharitySuspended(
                charityAddress,
                address(0),
                "Multiple fraud reports",
                block.timestamp
            );
        }
    }

    /**
     * @dev Update charity reputation score
     * @param charityAddress Address of the charity
     * @param newScore New reputation score (0-1000)
     */
    function updateReputation(
        address charityAddress,
        uint256 newScore
    ) external onlyRole(ADMIN_ROLE) {
        require(newScore <= 1000, "CharityVerification: invalid score");
        Charity storage charity = charities[charityAddress];
        require(
            charity.charityAddress != address(0),
            "CharityVerification: charity not found"
        );

        uint256 oldScore = charity.reputationScore;
        reputationHistory[charityAddress] = oldScore;
        charity.reputationScore = newScore;

        emit ReputationUpdated(charityAddress, oldScore, newScore, block.timestamp);
    }

    /**
     * @dev Suspend a charity
     * @param charityAddress Address of the charity
     * @param reason Reason for suspension
     */
    function suspendCharity(
        address charityAddress,
        string memory reason
    ) external onlyRole(ADMIN_ROLE) {
        Charity storage charity = charities[charityAddress];
        require(
            charity.charityAddress != address(0),
            "CharityVerification: charity not found"
        );

        charity.status = VerificationStatus.Suspended;
        emit CharitySuspended(charityAddress, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Execute slashing (penalty) for malicious behavior
     * @param charityAddress Address of the charity
     * @param amount Amount to slash
     * @param beneficiary Address to receive slashed funds
     */
    function executeSlashing(
        address charityAddress,
        uint256 amount,
        address beneficiary
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(
            charities[charityAddress].status == VerificationStatus.Suspended,
            "CharityVerification: not suspended"
        );
        require(beneficiary != address(0), "CharityVerification: invalid beneficiary");

        // This would interact with escrow contract to slash funds
        // For now, we emit the event
        emit SlashingExecuted(charityAddress, amount, beneficiary, block.timestamp);
    }

    /**
     * @dev Get charity information
     */
    function getCharity(
        address charityAddress
    ) external view returns (Charity memory) {
        return charities[charityAddress];
    }

    /**
     * @dev Get verifiers for a charity
     */
    function getCharityVerifiers(
        address charityAddress
    ) external view returns (address[] memory) {
        return charityVerifiers[charityAddress];
    }

    /**
     * @dev Update required approvals
     */
    function updateRequiredApprovals(
        uint256 newRequiredApprovals
    ) external onlyRole(ADMIN_ROLE) {
        require(newRequiredApprovals > 0, "CharityVerification: invalid approvals");
        requiredApprovals = newRequiredApprovals;
    }

    /**
     * @dev Update challenge period duration
     */
    function updateChallengePeriod(
        uint256 newDuration
    ) external onlyRole(ADMIN_ROLE) {
        challengePeriodDuration = newDuration;
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
}

