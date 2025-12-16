// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FreshChain {
    
    // Owner/Admin of the contract
    address private owner;
    
    enum BatchStatus { Created, InTransit, Arrived, Inspected }
    
    struct SensorReading {
        int temperature;
        int humidity;
        string location;
        uint timestamp;
        address recordedBy;
    }
    
    struct Batch {
        uint batchId;
        string productName;
        uint quantity;
        address currentOwner;
        address producer;
        BatchStatus status;
        bool passedInspection;
        uint createdAt;
        SensorReading[] sensorReadings;
    }
    
    mapping(address => bool) internal producers;
    mapping(address => bool) internal transporters;
    mapping(address => bool) internal distributors;
    mapping(address => bool) internal retailers;
    
    mapping(uint => Batch) internal batches;
    
    event ProducerRegistered(address producer);
    event TransporterRegistered(address transporter);
    event DistributorRegistered(address distributor);
    event RetailerRegistered(address retailer);
    event BatchCreated(uint batchId, string productName, uint quantity, address producer);
    event SensorDataAdded(uint batchId, int temperature, int humidity, string location);
    event OwnershipTransferred(uint batchId, address from, address to);
    event BatchArrived(uint batchId, bool passedInspection);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyProducer() {
        require(producers[msg.sender], "Only registered producer can call this function");
        _;
    }
    
    modifier onlyTransporter() {
        require(transporters[msg.sender], "Only registered transporter can call this function");
        _;
    }
    
    modifier onlyRetailer() {
        require(retailers[msg.sender], "Only registered retailer can call this function");
        _;
    }
    
    modifier batchExists(uint batchId) {
        require(batches[batchId].createdAt != 0, "Batch does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerProducer(address producer) external onlyOwner {
        require(producer != address(0), "Invalid address");
        require(!producers[producer], "Producer already registered");
        producers[producer] = true;
        emit ProducerRegistered(producer);
    }
    
    function registerTransporter(address transporter) external onlyOwner {
        require(transporter != address(0), "Invalid address");
        require(!transporters[transporter], "Transporter already registered");
        transporters[transporter] = true;
        emit TransporterRegistered(transporter);
    }
    
    function registerDistributor(address distributor) external onlyOwner {
        require(distributor != address(0), "Invalid address");
        require(!distributors[distributor], "Distributor already registered");
        distributors[distributor] = true;
        emit DistributorRegistered(distributor);
    }
    
    function registerRetailer(address retailer) external onlyOwner {
        require(retailer != address(0), "Invalid address");
        require(!retailers[retailer], "Retailer already registered");
        retailers[retailer] = true;
        emit RetailerRegistered(retailer);
    }
    
    function createBatch(uint batchId, string memory productName, uint quantity) external onlyProducer {
        require(batches[batchId].createdAt == 0, "Batch ID already exists");
        require(quantity > 0, "Quantity must be greater than zero");
        require(bytes(productName).length > 0, "Product name cannot be empty");
        
        Batch storage newBatch = batches[batchId];
        newBatch.batchId = batchId;
        newBatch.productName = productName;
        newBatch.quantity = quantity;
        newBatch.currentOwner = msg.sender;
        newBatch.producer = msg.sender;
        newBatch.status = BatchStatus.Created;
        newBatch.passedInspection = false;
        newBatch.createdAt = block.timestamp;
        
        emit BatchCreated(batchId, productName, quantity, msg.sender);
    }
    
    function addSensorData(uint batchId, int temperature, int humidity, string memory location) external onlyTransporter batchExists(batchId) {
        require(temperature >= -10 && temperature <= 40, "Temperature must be between -10 and 40");
        require(humidity >= 0 && humidity <= 40, "Humidity must be between 0 and 40");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        Batch storage batch = batches[batchId];
        
        // Update status to InTransit if it's the first sensor reading
        if (batch.status == BatchStatus.Created) {
            batch.status = BatchStatus.InTransit;
        }
        
        SensorReading memory reading = SensorReading({
            temperature: temperature,
            humidity: humidity,
            location: location,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        });
        
        batch.sensorReadings.push(reading);
        
        emit SensorDataAdded(batchId, temperature, humidity, location);
    }
    
    // Ownership Transfer
    function transferOwnership(uint batchId, address newOwner) external batchExists(batchId) {
        require(newOwner != address(0), "Invalid new owner address");
        
        Batch storage batch = batches[batchId];
        require(batch.currentOwner == msg.sender, "Only current owner can transfer ownership");
        require(batch.status != BatchStatus.Inspected, "Cannot transfer inspected batch");
        
        // Verify that the caller is authorized (Producer, Transporter, or Distributor)
        require(
            producers[msg.sender] || transporters[msg.sender] || distributors[msg.sender],
            "Only producer, transporter, or distributor can transfer ownership"
        );
        
        // Verify that the new owner is a registered actor
        require(
            transporters[newOwner] || distributors[newOwner] || retailers[newOwner],
            "New owner must be a registered transporter, distributor, or retailer"
        );
        
        address previousOwner = batch.currentOwner;
        batch.currentOwner = newOwner;
        
        emit OwnershipTransferred(batchId, previousOwner, newOwner);
    }
    
    function markAsArrived(uint batchId, bool passedInspection) external onlyRetailer batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.currentOwner == msg.sender, "Only current owner can mark as arrived");
        require(batch.status != BatchStatus.Inspected, "Batch already inspected");
        
        batch.status = BatchStatus.Inspected;
        batch.passedInspection = passedInspection;
        
        emit BatchArrived(batchId, passedInspection);
    }
    
    // View Functions
    function getBatch(uint batchId) external view batchExists(batchId) returns (
        uint,
        string memory,
        uint,
        address,
        address,
        BatchStatus,
        bool,
        uint
    ) {
        Batch storage batch = batches[batchId];
        return (
            batch.batchId,
            batch.productName,
            batch.quantity,
            batch.currentOwner,
            batch.producer,
            batch.status,
            batch.passedInspection,
            batch.createdAt
        );
    }
    
    function getSensorReadings(uint batchId) external view batchExists(batchId) returns (SensorReading[] memory) {
        return batches[batchId].sensorReadings;
    }
    
    function getSensorReadingCount(uint batchId) external view batchExists(batchId) returns (uint) {
        return batches[batchId].sensorReadings.length;
    }

    function getBatchHistory(uint batchId) public view batchExists(batchId) returns (
        uint id,
        string memory productName,
        uint quantity,
        address currentOwner,
        address producer,
        BatchStatus status,
        bool passedInspection,
        uint createdAt,
        SensorReading[] memory sensorReadings
    ) {
        Batch storage batch = batches[batchId];
        
        return (
            batch.batchId,
            batch.productName,
            batch.quantity,
            batch.currentOwner,
            batch.producer,
            batch.status,
            batch.passedInspection,
            batch.createdAt,
            batch.sensorReadings
        );
    }
}