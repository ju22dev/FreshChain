let provider, signer, contract;

const CONTRACT_ADDRESS = "0xBB8dEF1C0aA665877a53bfc0d69F2DA8DcF5dd97"
const CONTRACT_ABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"passedInspection","type":"bool"}],"name":"BatchArrived","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"string","name":"productName","type":"string"},{"indexed":false,"internalType":"uint256","name":"quantity","type":"uint256"},{"indexed":false,"internalType":"address","name":"producer","type":"address"}],"name":"BatchCreated","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"distributor","type":"address"}],"name":"DistributorRegistered","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"producer","type":"address"}],"name":"ProducerRegistered","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"retailer","type":"address"}],"name":"RetailerRegistered","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"int256","name":"temperature","type":"int256"},{"indexed":false,"internalType":"int256","name":"humidity","type":"int256"},{"indexed":false,"internalType":"string","name":"location","type":"string"}],"name":"SensorDataAdded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"transporter","type":"address"}],"name":"TransporterRegistered","type":"event"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"int256","name":"humidity","type":"int256"},{"internalType":"string","name":"location","type":"string"}],"name":"addSensorData","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"string","name":"productName","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"createBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getBatch","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"enum FreshChain.BatchStatus","name":"","type":"uint8"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getBatchHistory","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"productName","type":"string"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"address","name":"producer","type":"address"},{"internalType":"enum FreshChain.BatchStatus","name":"status","type":"uint8"},{"internalType":"bool","name":"passedInspection","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"components":[{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"int256","name":"humidity","type":"int256"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"recordedBy","type":"address"}],"internalType":"struct FreshChain.SensorReading[]","name":"sensorReadings","type":"tuple[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getSensorReadingCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getSensorReadings","outputs":[{"components":[{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"int256","name":"humidity","type":"int256"},{"internalType":"string","name":"location","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"recordedBy","type":"address"}],"internalType":"struct FreshChain.SensorReading[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"bool","name":"passedInspection","type":"bool"}],"name":"markAsArrived","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"distributor","type":"address"}],"name":"registerDistributor","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"producer","type":"address"}],"name":"registerProducer","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"retailer","type":"address"}],"name":"registerRetailer","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"transporter","type":"address"}],"name":"registerTransporter","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

function showMessage(elementId, type, text) {
    const msgElement = document.getElementById(elementId);
    msgElement.className = 'message show ' + type;
    msgElement.textContent = text;
    setTimeout(function () {
        msgElement.className = 'message';
    }, 10000);
}

// ---------------------------
// Connect Wallet
// ---------------------------
async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" });

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        alert("Wallet connected!");
    } else {
        alert("Please install MetaMask first.");
    }
};

function selectUserType(type) {
    const cards = document.querySelectorAll('.user-type-card');
    cards.forEach(function (card) {
        card.classList.remove('active');
    });

    event.target.closest('.user-type-card').classList.add('active');

    const menus = document.querySelectorAll('.menu-section');
    menus.forEach(function (menu) {
        menu.classList.remove('active');
    });

    document.getElementById(type + 'Menu').classList.add('active');
}

async function registerProducer() {
    const address = document.getElementById('producerAddress').value;
    if (!address) {
        showMessage('adminMessage', 'error', 'Please enter address');
        return;
    }

    if (contract) {
        await contract.registerProducer(address)
            .then(function () {
                showMessage('adminMessage', 'success', 'Producer registered!');
                document.getElementById('producerAddress').value = '';
            })
            .catch(function (error) {
                showMessage('adminMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('adminMessage', 'info', 'Demo: Would register producer at ' + address);
        document.getElementById('producerAddress').value = '';
    }
}

async function registerTransporter() {
    const address = document.getElementById('transporterAddress').value;
    if (!address) {
        showMessage('adminMessage', 'error', 'Please enter address');
        return;
    }

    if (contract) {
        contract.registerTransporter(address)
            .then(function () {
                showMessage('adminMessage', 'success', 'Transporter registered!');
                document.getElementById('transporterAddress').value = '';
            })
            .catch(function (error) {
                showMessage('adminMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('adminMessage', 'info', 'Demo: Would register transporter at ' + address);
        document.getElementById('transporterAddress').value = '';
    }
}

async function registerDistributor() {
    const address = document.getElementById('distributorAddress').value;
    if (!address) {
        showMessage('adminMessage', 'error', 'Please enter address');
        return;
    }

    if (contract) {
        await contract.registerDistributor(address)
            .then(function () {
                showMessage('adminMessage', 'success', 'Distributor registered!');
                document.getElementById('distributorAddress').value = '';
            })
            .catch(function (error) {
                showMessage('adminMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('adminMessage', 'info', 'Demo: Would register distributor at ' + address);
        document.getElementById('distributorAddress').value = '';
    }
}

async function registerRetailer() {
    const address = document.getElementById('retailerAddress').value;
    if (!address) {
        showMessage('adminMessage', 'error', 'Please enter address');
        return;
    }

    if (contract) {
        await contract.registerRetailer(address)
            .then(function () {
                showMessage('adminMessage', 'success', 'Retailer registered!');
                document.getElementById('retailerAddress').value = '';
            })
            .catch(function (error) {
                showMessage('adminMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('adminMessage', 'info', 'Demo: Would register retailer at ' + address);
        document.getElementById('retailerAddress').value = '';
    }
}

async function createBatch() {
    const batchId = document.getElementById('newBatchId').value;
    const productName = document.getElementById('newProductName').value;
    const quantity = document.getElementById('newQuantity').value;

    if (!batchId || !productName || !quantity) {
        showMessage('producerMessage', 'error', 'Please fill all fields');
        return;
    }

    if (contract) {
        await contract.createBatch(Number(batchId), productName, quantity)
            .then(function () {
                showMessage('producerMessage', 'success', 'Batch ' + batchId + ' created!');
                document.getElementById('newBatchId').value = '';
                document.getElementById('newProductName').value = '';
                document.getElementById('newQuantity').value = '';
            })
            .catch(function (error) {
                showMessage('producerMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('producerMessage', 'info', 'Demo: Would create batch ' + batchId + ' - ' + productName);
        document.getElementById('newBatchId').value = '';
        document.getElementById('newProductName').value = '';
        document.getElementById('newQuantity').value = '';
    }
}

async function transferOwnership() {
    const batchId = document.getElementById('transferBatchId').value;
    const newOwner = document.getElementById('transferNewOwner').value;

    if (!batchId || !newOwner) {
        showMessage('producerMessage', 'error', 'Please fill all fields');
        return;
    }

    if (contract) {
        await contract.transferOwnership(Number(batchId), newOwner)
            .then(function () {
                showMessage('producerMessage', 'success', 'Batch ' + batchId + ' transferred!');
                document.getElementById('transferBatchId').value = '';
                document.getElementById('transferNewOwner').value = '';
            })
            .catch(function (error) {
                showMessage('producerMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('producerMessage', 'info', 'Demo: Would transfer batch ' + batchId);
        document.getElementById('transferBatchId').value = '';
        document.getElementById('transferNewOwner').value = '';
    }
}

async function addSensorData() {
    const batchId = document.getElementById('sensorBatchId').value;
    const temperature = document.getElementById('sensorTemperature').value;
    const humidity = document.getElementById('sensorHumidity').value;
    const location = document.getElementById('sensorLocation').value;

    if (!batchId || !temperature || !humidity || !location) {
        showMessage('transporterMessage', 'error', 'Please fill all fields');
        return;
    }

    if (temperature < -10 || temperature > 40) {
        showMessage('transporterMessage', 'error', 'Temperature must be -10 to 40');
        return;
    }

    if (humidity < 0 || humidity > 40) {
        showMessage('transporterMessage', 'error', 'Humidity must be 0 to 40');
        return;
    }

    if (contract) {
        await contract.addSensorData(Number(batchId), temperature, humidity, location)
            .then(function () {
                showMessage('transporterMessage', 'success', 'Sensor data added!');
                document.getElementById('sensorBatchId').value = '';
                document.getElementById('sensorTemperature').value = '';
                document.getElementById('sensorHumidity').value = '';
                document.getElementById('sensorLocation').value = '';
            })
            .catch(function (error) {
                showMessage('transporterMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('transporterMessage', 'info', 'Demo: Would add sensor data');
        document.getElementById('sensorBatchId').value = '';
        document.getElementById('sensorTemperature').value = '';
        document.getElementById('sensorHumidity').value = '';
        document.getElementById('sensorLocation').value = '';
    }
}

async function transporterTransferOwnership() {
    const batchId = document.getElementById('transporterTransferBatchId').value;
    const newOwner = document.getElementById('transporterTransferNewOwner').value;

    if (!batchId || !newOwner) {
        showMessage('transporterMessage', 'error', 'Please fill all fields');
        return;
    }

    if (contract) {
        await contract.transferOwnership(Number(batchId), newOwner)
            .then(function () {
                showMessage('transporterMessage', 'success', 'Batch ' + batchId + ' transferred!');
                document.getElementById('transporterTransferBatchId').value = '';
                document.getElementById('transporterTransferNewOwner').value = '';
            })
            .catch(function (error) {
                showMessage('transporterMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('transporterMessage', 'info', 'Demo: Would transfer batch ' + batchId);
        document.getElementById('transporterTransferBatchId').value = '';
        document.getElementById('transporterTransferNewOwner').value = '';
    }
}

async function distributorTransferOwnership() {
    const batchId = document.getElementById('distributorTransferBatchId').value;
    const newOwner = document.getElementById('distributorTransferNewOwner').value;

    if (!batchId || !newOwner) {
        showMessage('distributorMessage', 'error', 'Please fill all fields');
        return;
    }

    if (contract) {
        await contract.transferOwnership(Number(batchId), newOwner)
            .then(function () {
                showMessage('distributorMessage', 'success', 'Batch ' + batchId + ' transferred!');
                document.getElementById('distributorTransferBatchId').value = '';
                document.getElementById('distributorTransferNewOwner').value = '';
            })
            .catch(function (error) {
                showMessage('distributorMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('distributorMessage', 'info', 'Demo: Would transfer batch ' + batchId);
        document.getElementById('distributorTransferBatchId').value = '';
        document.getElementById('distributorTransferNewOwner').value = '';
    }
}

async function markAsArrived() {
    const batchId = document.getElementById('arrivedBatchId').value;
    const passed = document.getElementById('inspectionPassed').checked;

    if (!batchId) {
        showMessage('retailerMessage', 'error', 'Please enter batch ID');
        return;
    }

    if (contract) {
        await contract.markAsArrived(Number(batchId), passed)
            .then(function () {
                showMessage('retailerMessage', 'success', 'Batch ' + batchId + ' marked as arrived! Inspection: ' + (passed ? 'PASSED' : 'FAILED'));
                document.getElementById('arrivedBatchId').value = '';
            })
            .catch(function (error) {
                showMessage('retailerMessage', 'error', 'Error: ' + (error.reason || error.message));
            });
    } else {
        showMessage('retailerMessage', 'info', 'Demo: Would mark batch ' + batchId + ' as arrived (' + (passed ? 'PASSED' : 'FAILED') + ')');
        document.getElementById('arrivedBatchId').value = '';
    }
}

let batch0;
async function viewBatch(userType) {
    const batchIdField = userType === 'distributor' ? 'distributorViewBatchId' : 'retailerViewBatchId';
    const batchInfoDiv = userType === 'distributor' ? 'distributorBatchInfo' : 'retailerBatchInfo';
    const messageId = userType === 'distributor' ? 'distributorMessage' : 'retailerMessage';

    const batchId = document.getElementById(batchIdField).value;

    if (!batchId) {
        showMessage(messageId, 'error', 'Please enter batch ID');
        return;
    }

    if (contract) {
        await contract.getBatch(Number(batchId))
            .then(async function (batch) {
                batch0 = batch
                return await contract.getSensorReadings(Number(batchId))
                    .then(function (sensorReadings) {
                        const statusNames = ['Created', 'InTransit', 'Arrived', 'Inspected'];

                        let html = '<h4>Batch Details</h4>';
                        html += '<p><strong>Batch ID:</strong> ' + Number(batch[0]) + '</p>';
                        html += '<p><strong>Product:</strong> ' + batch[1] + '</p>';
                        html += '<p><strong>Quantity:</strong> ' + Number(batch[2]) + ' kg</p>';
                        html += '<p><strong>Current Owner:</strong> ' + batch[3] + '</p>';
                        html += '<p><strong>Producer:</strong> ' + batch[4] + '</p>';
                        html += '<p><strong>Status:</strong> ' + statusNames[Number(batch[5])] + '</p>';
                        html += '<p><strong>Inspection:</strong> ' + (batch[6] ? 'PASSED ✅' : 'FAILED ❌') + '</p>';
                        html += '<p><strong>Created:</strong> ' + new Date(Number(batch[7]) * 1000) + '</p>';

                        if (sensorReadings.length > 0) {
                            html += '<div class="sensor-readings"><h4>Sensor Readings:</h4>';
                            for (let i = 0; i < sensorReadings.length; i++) {
                                const reading = sensorReadings[i];
                                html += '<div class="sensor-reading">';
                                html += '<p><strong>Reading ' + (i + 1) + '</strong></p>';
                                html += '<p>Temperature: ' + Number(reading.temperature) + '°C</p>';
                                html += '<p>Humidity: ' + Number(reading.humidity) + '%</p>';
                                html += '<p>Location: ' + reading.location + '</p>';
                                html += '<p>Time: ' + new Date(Number(reading.timestamp) * 1000) + '</p>';
                                html += '<p>Recorded by: ' + reading.recordedBy + '</p>';
                                html += '</div>';
                            }
                            html += '</div>';
                        }


                        document.getElementById(batchInfoDiv).innerHTML = html;
                        document.getElementById(batchInfoDiv).style.display = 'block';
                    });
            })
            .catch(function (error) {
                showMessage(messageId, 'error', 'Error fetching batch: ' + (error.reason || error.message));
            });
    } else {
        const html = '<h4>Demo Batch Details</h4>' +
            '<p><strong>Batch ID:</strong> ' + batchId + '</p>' +
            '<p><strong>Product:</strong> Organic Tomatoes</p>' +
            '<p><strong>Quantity:</strong> 500 kg</p>' +
            '<p><strong>Status:</strong> InTransit</p>' +
            '<p><em>Connect to blockchain to see real data</em></p>';
        document.getElementById(batchInfoDiv).innerHTML = html;
        document.getElementById(batchInfoDiv).style.display = 'block';
    }

}
async function generateBatchQR() {
    const batchId = document.getElementById('customerBatchId').value;
    if (!batchId) {
        showMessage('customerMessage', 'error', 'Please enter batch ID');
        return;
    }
    // Clear previous QR code
    document.getElementById('qrcode').src = '';

    // Show QR container
    document.getElementById('qrContainer').style.display = 'block';

    const url = `https://ju22dev.github.io/FreshChain/customer.html?batchId=${batchId}`;

    document.getElementById('qrcode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    document.getElementById('qr-info').innerHTML += `<a href=${url}>Go to URL</a>`;
    showMessage('customerMessage', 'success', 'QR Code generated! Scan to view product history.');
}
