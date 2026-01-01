// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title ProfessionalVerification
 * @dev Tier 2 verification system for professional NGO organizations
 * @notice Higher weight for professional verifications, requires 2+ professional verifiers
 */
contract ProfessionalVerification is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROFESSIONAL_VERIFIER_ROLE = keccak256("PROFESSIONAL_VERIFIER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Verification tier
    uint8 public constant TIER = 2;

    // Verification status
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Disputed
    }

    // Professional verifier information
    struct ProfessionalVerifier {
        address verifierAddress;
        string organizationName;
        string accreditationNumber;
        uint256 reputationScore;
        uint256 totalVerifications;
        uint256 successfulVerifications;
        bool active;
        uint256 registeredAt;
    }

    // Verification record
    struct Verification {
        uint256 verificationId;
        address charity;
        uint256 projectId;
        string evidenceHash;
        VerificationStatus status;
        uint256 submittedAt;
        uint256 verifiedAt;
        address[] verifiers;
        uint256 approvalCount;
        uint256 rejectionCount;
    }

    // State mappings
    mapping(address => ProfessionalVerifier) public professionalVerifiers;
    mapping(uint256 => Verification) public verifications;
    mapping(uint256 => mapping(address => bool)) public verifierApprovals; // verificationId => verifier => approved
    mapping(uint256 => mapping(address => bool)) public verifierRejections; // verificationId => verifier => rejected

    uint256 public verificationCounter;
    uint256 public requiredApprovals; // Minimum professional verifiers needed (2)

    // Events
    event ProfessionalVerifierRegistered(
        address indexed verifier,
        string organizationName,
        string accreditationNumber,
        uint256 timestamp
    );
    event ProfessionalVerifierRemoved(
        address indexed verifier,
        uint256 timestamp
    );
    event VerificationSubmitted(
        uint256 indexed verificationId,
        address indexed charity,
        uint256 indexed projectId,
        string evidenceHash,
        uint256 timestamp
    );
    event VerificationApproved(
        uint256 indexed verificationId,
        address indexed verifier,
        uint256 approvalCount,
        uint256 timestamp
    );
    event VerificationRejected(
        uint256 indexed verificationId,
        address indexed verifier,
        string reason,
        uint256 timestamp
    );
    event VerificationCompleted(
        uint256 indexed verificationId,
        VerificationStatus status,
        address[] verifiers,
        uint256 timestamp
    );
    event DisputeCreated(
        uint256 indexed verificationId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );
    event VerifierReputationUpdated(
        address indexed verifier,
        uint256 oldReputation,
        uint256 newReputation,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _requiredApprovals Minimum professional verifiers needed
     */
    function initialize(uint256 _requiredApprovals) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        require(
            _requiredApprovals > 0,
            "ProfessionalVerification: invalid approvals"
        );
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @dev Register a professional verifier (NGO organization)
     * @param verifierAddress Address of the verifier
     * @param organizationName Name of the organization
     * @param accreditationNumber Accreditation or registration number
     */
    function registerProfessionalVerifier(
        address verifierAddress,
        string memory organizationName,
        string memory accreditationNumber
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(
            verifierAddress != address(0),
            "ProfessionalVerification: invalid address"
        );
        require(
            professionalVerifiers[verifierAddress].verifierAddress == address(0),
            "ProfessionalVerification: already registered"
        );
        require(
            bytes(organizationName).length > 0,
            "ProfessionalVerification: empty name"
        );

        professionalVerifiers[verifierAddress] = ProfessionalVerifier({
            verifierAddress: verifierAddress,
            organizationName: organizationName,
            accreditationNumber: accreditationNumber,
            reputationScore: 500, // Higher initial reputation for professionals
            totalVerifications: 0,
            successfulVerifications: 0,
            active: true,
            registeredAt: block.timestamp
        });

        _grantRole(PROFESSIONAL_VERIFIER_ROLE, verifierAddress);

        emit ProfessionalVerifierRegistered(
            verifierAddress,
            organizationName,
            accreditationNumber,
            block.timestamp
        );
    }

    /**
     * @dev Remove a professional verifier
     * @param verifierAddress Address of the verifier to remove
     */
    function removeProfessionalVerifier(
        address verifierAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(
            professionalVerifiers[verifierAddress].verifierAddress != address(0),
            "ProfessionalVerification: not registered"
        );

        professionalVerifiers[verifierAddress].active = false;
        _revokeRole(PROFESSIONAL_VERIFIER_ROLE, verifierAddress);

        emit ProfessionalVerifierRemoved(verifierAddress, block.timestamp);
    }

    /**
     * @dev Submit a verification for professional review
     * @param charity Address of the charity
     * @param projectId Project ID
     * @param evidenceHash IPFS hash of evidence
     */
    function submitVerification(
        address charity,
        uint256 projectId,
        string memory evidenceHash
    ) external whenNotPaused nonReentrant returns (uint256 verificationId) {
        require(
            charity != address(0),
            "ProfessionalVerification: invalid charity"
        );
        require(
            bytes(evidenceHash).length > 0,
            "ProfessionalVerification: empty hash"
        );

        verificationId = ++verificationCounter;

        verifications[verificationId] = Verification({
            verificationId: verificationId,
            charity: charity,
            projectId: projectId,
            evidenceHash: evidenceHash,
            status: VerificationStatus.Pending,
            submittedAt: block.timestamp,
            verifiedAt: 0,
            verifiers: new address[](0),
            approvalCount: 0,
            rejectionCount: 0
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
     * @dev Approve a verification (called by professional verifier)
     * @param verificationId The verification ID
     */
    function approveVerification(
        uint256 verificationId
    ) external onlyRole(PROFESSIONAL_VERIFIER_ROLE) whenNotPaused nonReentrant {
        Verification storage verification = verifications[verificationId];
        require(
            verification.status == VerificationStatus.Pending,
            "ProfessionalVerification: not pending"
        );
        require(
            !verifierApprovals[verificationId][msg.sender],
            "ProfessionalVerification: already approved"
        );
        require(
            professionalVerifiers[msg.sender].active,
            "ProfessionalVerification: verifier inactive"
        );

        // Record approval
        verifierApprovals[verificationId][msg.sender] = true;
        verification.approvalCount++;
        verification.verifiers.push(msg.sender);

        emit VerificationApproved(
            verificationId,
            msg.sender,
            verification.approvalCount,
            block.timestamp
        );

        // Check if we have enough approvals
        if (verification.approvalCount >= requiredApprovals) {
            verification.status = VerificationStatus.Approved;
            verification.verifiedAt = block.timestamp;

            // Update verifier reputations
            _updateVerifierReputations(verificationId, true);

            emit VerificationCompleted(
                verificationId,
                VerificationStatus.Approved,
                verification.verifiers,
                block.timestamp
            );
        }
    }

    /**
     * @dev Reject a verification (called by professional verifier)
     * @param verificationId The verification ID
     * @param reason Reason for rejection
     */
    function rejectVerification(
        uint256 verificationId,
        string memory reason
    ) external onlyRole(PROFESSIONAL_VERIFIER_ROLE) whenNotPaused {
        Verification storage verification = verifications[verificationId];
        require(
            verification.status == VerificationStatus.Pending,
            "ProfessionalVerification: not pending"
        );
        require(
            !verifierRejections[verificationId][msg.sender],
            "ProfessionalVerification: already rejected"
        );
        require(
            professionalVerifiers[msg.sender].active,
            "ProfessionalVerification: verifier inactive"
        );

        // Record rejection
        verifierRejections[verificationId][msg.sender] = true;
        verification.rejectionCount++;
        verification.verifiers.push(msg.sender);

        emit VerificationRejected(verificationId, msg.sender, reason, block.timestamp);

        // If we have enough rejections, mark as rejected
        if (verification.rejectionCount >= requiredApprovals) {
            verification.status = VerificationStatus.Rejected;
            verification.verifiedAt = block.timestamp;

            // Update verifier reputations
            _updateVerifierReputations(verificationId, false);

            emit VerificationCompleted(
                verificationId,
                VerificationStatus.Rejected,
                verification.verifiers,
                block.timestamp
            );
        }
    }

    /**
     * @dev Update verifier reputations based on verification outcome
     * @param verificationId The verification ID
     * @param approved Whether verification was approved
     */
    function _updateVerifierReputations(
        uint256 verificationId,
        bool approved
    ) internal {
        Verification storage verification = verifications[verificationId];

        for (uint256 i = 0; i < verification.verifiers.length; i++) {
            address verifier = verification.verifiers[i];
            ProfessionalVerifier storage profVerifier = professionalVerifiers[verifier];

            // Check if verifier's vote matches outcome
            bool voteMatches = (approved &&
                verifierApprovals[verificationId][verifier]) ||
                (!approved && verifierRejections[verificationId][verifier]);

            if (voteMatches) {
                profVerifier.successfulVerifications++;
                if (profVerifier.reputationScore < 1000) {
                    uint256 oldReputation = profVerifier.reputationScore;
                    profVerifier.reputationScore = profVerifier.reputationScore < 990
                        ? profVerifier.reputationScore + 10
                        : 1000;

                    emit VerifierReputationUpdated(
                        verifier,
                        oldReputation,
                        profVerifier.reputationScore,
                        block.timestamp
                    );
                }
            }

            profVerifier.totalVerifications++;
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
            "ProfessionalVerification: cannot dispute"
        );

        verification.status = VerificationStatus.Disputed;

        emit DisputeCreated(verificationId, msg.sender, reason, block.timestamp);
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
     * @dev Get professional verifier information
     */
    function getProfessionalVerifier(
        address verifier
    ) external view returns (ProfessionalVerifier memory) {
        return professionalVerifiers[verifier];
    }

    /**
     * @dev Update required approvals
     */
    function updateRequiredApprovals(
        uint256 newRequiredApprovals
    ) external onlyRole(ADMIN_ROLE) {
        require(
            newRequiredApprovals > 0,
            "ProfessionalVerification: invalid approvals"
        );
        requiredApprovals = newRequiredApprovals;
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


