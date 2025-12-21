// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title DonationRegistry
 * @dev ERC-1155 based donation registry supporting fungible donations and NFT receipts
 * @notice Implements batch donation processing, royalty support, and upgradeable architecture
 */
contract DonationRegistry is
    Initializable,
    ERC1155Upgradeable,
    ERC2981Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Token ID constants
    uint256 public constant DONATION_TOKEN_ID = 1; // Fungible donation token
    uint256 public constant RECEIPT_TOKEN_ID_BASE = 10000; // Base for NFT receipts

    // Donation tracking
    struct Donation {
        address donor;
        address charity;
        uint256 amount;
        uint256 timestamp;
        uint256 receiptTokenId;
        bool processed;
    }

    // Circuit breaker thresholds
    uint256 public maxDonationAmount;
    uint256 public minDonationAmount;
    uint256 public dailyDonationLimit;
    uint256 public lastResetTimestamp;
    uint256 public dailyDonationTotal;

    // State variables
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public donorDonations;
    mapping(address => uint256[]) public charityDonations;
    mapping(uint256 => bool) public receiptTokenIds;
    uint256 public donationCounter;
    uint256 public platformFeeBps; // Basis points (e.g., 250 = 2.5%)

    // Events
    event DonationCreated(
        uint256 indexed donationId,
        address indexed donor,
        address indexed charity,
        uint256 amount,
        uint256 receiptTokenId,
        uint256 timestamp
    );
    event DonationBatchCreated(
        uint256[] indexed donationIds,
        address indexed donor,
        address[] charities,
        uint256[] amounts,
        uint256 timestamp
    );
    event DonationProcessed(uint256 indexed donationId, bool success);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event CircuitBreakerUpdated(
        uint256 maxAmount,
        uint256 minAmount,
        uint256 dailyLimit
    );
    event DailyLimitReset(uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _defaultRoyaltyReceiver Address to receive platform fees
     * @param _platformFeeBps Platform fee in basis points
     */
    function initialize(
        address _defaultRoyaltyReceiver,
        uint256 _platformFeeBps
    ) public initializer {
        __ERC1155_init("");
        __ERC2981_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        _setDefaultRoyalty(_defaultRoyaltyReceiver, _platformFeeBps);
        platformFeeBps = _platformFeeBps;

        // Initialize circuit breakers
        maxDonationAmount = 1000000 * 10 ** 18; // 1M tokens
        minDonationAmount = 1 * 10 ** 18; // 1 token
        dailyDonationLimit = 10000000 * 10 ** 18; // 10M tokens per day
        lastResetTimestamp = block.timestamp;
    }

    /**
     * @dev Create a single donation
     * @param charity Address of the charity receiving the donation
     * @param amount Amount of tokens to donate
     * @return donationId The ID of the created donation
     */
    function createDonation(
        address charity,
        uint256 amount
    )
        external
        whenNotPaused
        nonReentrant
        returns (uint256 donationId)
    {
        require(charity != address(0), "DonationRegistry: invalid charity");
        require(amount >= minDonationAmount, "DonationRegistry: amount too low");
        require(amount <= maxDonationAmount, "DonationRegistry: amount too high");
        require(
            dailyDonationTotal + amount <= dailyDonationLimit,
            "DonationRegistry: daily limit exceeded"
        );

        // Reset daily counter if needed
        if (block.timestamp >= lastResetTimestamp + 1 days) {
            dailyDonationTotal = 0;
            lastResetTimestamp = block.timestamp;
            emit DailyLimitReset(block.timestamp);
        }

        donationId = ++donationCounter;
        uint256 receiptTokenId = RECEIPT_TOKEN_ID_BASE + donationId;

        // Checks
        require(!receiptTokenIds[receiptTokenId], "DonationRegistry: receipt exists");

        // Effects
        donations[donationId] = Donation({
            donor: msg.sender,
            charity: charity,
            amount: amount,
            timestamp: block.timestamp,
            receiptTokenId: receiptTokenId,
            processed: false
        });

        donorDonations[msg.sender].push(donationId);
        charityDonations[charity].push(donationId);
        receiptTokenIds[receiptTokenId] = true;
        dailyDonationTotal += amount;

        // Interactions
        _mint(msg.sender, DONATION_TOKEN_ID, amount, "");
        _mint(msg.sender, receiptTokenId, 1, "");

        emit DonationCreated(
            donationId,
            msg.sender,
            charity,
            amount,
            receiptTokenId,
            block.timestamp
        );

        return donationId;
    }

    /**
     * @dev Create multiple donations in a single transaction
     * @param charities Array of charity addresses
     * @param amounts Array of donation amounts
     * @return donationIds Array of created donation IDs
     */
    function createDonationBatch(
        address[] calldata charities,
        uint256[] calldata amounts
    )
        external
        whenNotPaused
        nonReentrant
        returns (uint256[] memory donationIds)
    {
        require(
            charities.length == amounts.length,
            "DonationRegistry: arrays length mismatch"
        );
        require(charities.length > 0, "DonationRegistry: empty arrays");
        require(charities.length <= 50, "DonationRegistry: batch too large");

        donationIds = new uint256[](charities.length);
        uint256 totalAmount = 0;

        // Reset daily counter if needed
        if (block.timestamp >= lastResetTimestamp + 1 days) {
            dailyDonationTotal = 0;
            lastResetTimestamp = block.timestamp;
            emit DailyLimitReset(block.timestamp);
        }

        // Validate all donations first
        for (uint256 i = 0; i < charities.length; i++) {
            require(
                charities[i] != address(0),
                "DonationRegistry: invalid charity"
            );
            require(
                amounts[i] >= minDonationAmount,
                "DonationRegistry: amount too low"
            );
            require(
                amounts[i] <= maxDonationAmount,
                "DonationRegistry: amount too high"
            );
            totalAmount += amounts[i];
        }

        require(
            dailyDonationTotal + totalAmount <= dailyDonationLimit,
            "DonationRegistry: daily limit exceeded"
        );

        // Create all donations
        for (uint256 i = 0; i < charities.length; i++) {
            uint256 donationId = ++donationCounter;
            uint256 receiptTokenId = RECEIPT_TOKEN_ID_BASE + donationId;

            donations[donationId] = Donation({
                donor: msg.sender,
                charity: charities[i],
                amount: amounts[i],
                timestamp: block.timestamp,
                receiptTokenId: receiptTokenId,
                processed: false
            });

            donorDonations[msg.sender].push(donationId);
            charityDonations[charities[i]].push(donationId);
            receiptTokenIds[receiptTokenId] = true;
            donationIds[i] = donationId;

            _mint(msg.sender, receiptTokenId, 1, "");
        }

        // Mint all donation tokens at once
        _mint(msg.sender, DONATION_TOKEN_ID, totalAmount, "");
        dailyDonationTotal += totalAmount;

        emit DonationBatchCreated(
            donationIds,
            msg.sender,
            charities,
            amounts,
            block.timestamp
        );

        return donationIds;
    }

    /**
     * @dev Mark a donation as processed (called by escrow contract)
     * @param donationId The ID of the donation to mark as processed
     */
    function markDonationProcessed(
        uint256 donationId
    ) external onlyRole(OPERATOR_ROLE) {
        require(
            donations[donationId].donor != address(0),
            "DonationRegistry: donation not found"
        );
        require(
            !donations[donationId].processed,
            "DonationRegistry: already processed"
        );

        donations[donationId].processed = true;
        emit DonationProcessed(donationId, true);
    }

    /**
     * @dev Update platform fee
     * @param newFeeBps New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(
        uint256 newFeeBps
    ) external onlyRole(ADMIN_ROLE) {
        require(newFeeBps <= 1000, "DonationRegistry: fee too high");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        _setDefaultRoyalty(
            royaltyInfo(DONATION_TOKEN_ID).receiver,
            newFeeBps
        );
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @dev Update circuit breaker thresholds
     */
    function updateCircuitBreakers(
        uint256 _maxAmount,
        uint256 _minAmount,
        uint256 _dailyLimit
    ) external onlyRole(ADMIN_ROLE) {
        require(_minAmount < _maxAmount, "DonationRegistry: invalid amounts");
        require(_dailyLimit > 0, "DonationRegistry: invalid daily limit");

        maxDonationAmount = _maxAmount;
        minDonationAmount = _minAmount;
        dailyDonationLimit = _dailyLimit;

        emit CircuitBreakerUpdated(_maxAmount, _minAmount, _dailyLimit);
    }

    /**
     * @dev Get donation details
     */
    function getDonation(
        uint256 donationId
    ) external view returns (Donation memory) {
        return donations[donationId];
    }

    /**
     * @dev Get all donations for a donor
     */
    function getDonorDonations(
        address donor
    ) external view returns (uint256[] memory) {
        return donorDonations[donor];
    }

    /**
     * @dev Get all donations for a charity
     */
    function getCharityDonations(
        address charity
    ) external view returns (uint256[] memory) {
        return charityDonations[charity];
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

    // ERC2981 Royalty support
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC2981Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            ERC1155Upgradeable.supportsInterface(interfaceId) ||
            ERC2981Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}

