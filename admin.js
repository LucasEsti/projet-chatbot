const socket = new WebSocket('ws://localhost:8081');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection ouverte:', event);
});

// Verification du client s'il existe
let existingClients = [];

// Pour les clients connectés
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const clientId = data.clientId;
    // Si le clientId existe
    if (!existingClients.includes(clientId)) {
        const clientList = document.getElementById('clientList');
        // Afficher le client avec son ID
        const listItem = document.createElement('li');
        listItem.textContent = `Client ${clientId}`;
        listItem.addEventListener('click', () => {
            createClientChatWindow(clientId);
            const activeItems = document.querySelectorAll('.clientList li.active');
            activeItems.forEach(item => item.classList.remove('active'));
            listItem.classList.add('active');
        });
        clientList.appendChild(listItem);

        existingClients.push(clientId);
    }
});

// Pour la creation de Zone de discussion de chaque client
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const adminMessage = data.adminMessage;
    const messageContent = data.content;
    const clientId = data.clientId;
    const clientName = data.clientName; // Ajout du nom du client
    const messageType = data.type; // Ajouter cette ligne pour obtenir le type du message

    let clientMessageDiv = document.getElementById(`messageLog-${clientId}`);
    if (!clientMessageDiv) {
        clientMessageDiv = document.createElement('div');
        clientMessageDiv.id = `messageLog-${clientId}`;
        clientMessageDiv.innerHTML = `<h3>Messages du client ${clientId}</h3>`;
        document.body.appendChild(clientMessageDiv);
    }

    // Vérifier le type du message
    if (messageType === 'image') {
        const imgElement = document.createElement('img');
        imgElement.src = 'data:image/jpg;base64,' + messageContent;
        clientMessageDiv.appendChild(imgElement);
    } else {
        clientMessageDiv.innerHTML += `<p><strong>${adminMessage}:</strong> ${messageContent}</p>`;
    }
    displayClientMessage(clientId, clientName, messageContent); // Appel de la fonction displayClientMessage
});

socket.addEventListener('close', (event) => {
    console.log('WebSocket connection fermé', event);
});

socket.addEventListener('error', (event) => {
    console.error('WebSocket error', event);
});

// Ajouter des événements sur l'envoie de message...
function createClientChatWindow(clientId) {
    const clientConversation = document.getElementById('clientConversation');
    const selectedClientIdSpan = document.getElementById('selectedClientId');
    selectedClientIdSpan.textContent = clientId;

    let clientMessageDiv = document.getElementById(`messageLog-${clientId}`);
    if (!clientMessageDiv) {
        clientMessageDiv = document.createElement('div');
        clientMessageDiv.id = `messageLog-${clientId}`;
        clientMessageDiv.innerHTML = `<h3>Messages du client ${clientId}</h3>`;
        document.body.appendChild(clientMessageDiv);
    }

    // Ajouter un input d'envoi de message pour le client spécifique
    const adminMessageInput = document.createElement('input');
    adminMessageInput.setAttribute('type', 'text');
    adminMessageInput.setAttribute('id', `adminMessageInput_${clientId}`);
    adminMessageInput.setAttribute('placeholder', 'Envoyer un message');
    clientMessageDiv.appendChild(adminMessageInput);

    // Ajouter un bouton d'envoi de message pour le client spécifique
    const sendAdminMessageButton = document.createElement('button');
    sendAdminMessageButton.setAttribute('class', 'sendAdminMessageButton'); // Ajoutez une classe pour identifier les boutons d'envoi de message
    sendAdminMessageButton.setAttribute('data-client-id', clientId); // Ajouter un attribut data-client-id pour garder une trace de l'ID du client
    sendAdminMessageButton.textContent = 'Envoyer';
    clientMessageDiv.appendChild(sendAdminMessageButton);

    // Ajouter un gestionnaire d'événements pour le bouton d'envoi de message
    sendAdminMessageButton.addEventListener('click', () => {
        const adminMessageInput = document.getElementById(`adminMessageInput_${clientId}`);
        const adminMessage = adminMessageInput.value.trim();
        if (adminMessage) {
            sendMessageToClient(clientId, adminMessage);
            adminMessageInput.value = '';
        }
    });
   
}

// Ajouter des événements sur l'envoi de message spécifique à chaque fenêtre de discussion client
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('sendAdminMessageButton')) {
        const clientId = event.target.getAttribute('data-client-id');
        const adminMessageInput = document.getElementById(`adminMessageInput_${clientId}`);
        const adminMessage = adminMessageInput.value.trim();
        if (adminMessage) {
            sendMessageToClient(clientId, adminMessage);
            adminMessageInput.value = '';
        }
    }
});

// Afficher les messages des clients
function displayClientMessage(clientId, clientName, message) {
    const clientMessageDiv = document.getElementById(`messageLog-${clientId}`);
    if (clientMessageDiv) {
        // Vérifier s'il y a déjà un input présent
        const hasInput = clientMessageDiv.querySelector('input');
        if (!hasInput) {
            const newMessageDiv = document.createElement('div');

            // Vérifier si le message est une image base64
            if (isBase64Image(message)) {
                const imgElement = document.createElement('img');
                imgElement.src = message;
                newMessageDiv.appendChild(imgElement); // Ajouter l'image directement au message div
            } else {
                 // Afficher le message avec le nom du client
                 newMessageDiv.innerHTML = `<p><strong>${clientName}:</strong> ${message}</p>`;
            }

            // Insérer le nouveau message div avant l'input
            insertMessageBeforeInput(newMessageDiv, document.getElementById(`adminMessageInput_${clientId}`));
            
            // Supprimer les messages en dessous de l'input
            let nextSibling = document.getElementById(`adminMessageInput_${clientId}`).nextSibling;
            while (nextSibling && nextSibling !== document.getElementById(`sendAdminMessageButton_${clientId}`)) {
                const currentNextSibling = nextSibling;
                nextSibling = nextSibling.nextSibling;
                if (currentNextSibling.tagName !== 'BUTTON') {
                    clientMessageDiv.removeChild(currentNextSibling);
                }

            }
        }
        
    }
    // Déplacer l'input et le bouton à la fin de la div clientMessageDiv
    clientMessageDiv.appendChild(document.getElementById(`adminMessageInput_${clientId}`));
    clientMessageDiv.appendChild(document.getElementById(`sendAdminMessageButton_${clientId}`)); 
}



// Fonction utilitaire pour vérifier si le message est une image base64
function isBase64Image(message) {
    // Vérifier si le message commence par "data:image/" (pour les images base64) 
    // OU s'il se termine par une extension d'image (pour les URL d'images)
    return message.startsWith('data:image/') || /\.(jpg|jpeg|png|gif)$/i.test(message);
}
function insertMessageBeforeInput(messageDiv, inputElement) {
    inputElement.parentNode.insertBefore(messageDiv, inputElement);
}

// Afficher les messages des clients
function sendMessageToClient(clientId, message) {
    const data = {
        toClient: true,
        clientId: clientId,
        content: message
    };
    socket.send(JSON.stringify(data));
    const clientMessageDiv = document.getElementById(`messageLog-${clientId}`);
    if (clientMessageDiv) {
        const newMessageDiv = document.createElement('div');
        newMessageDiv.innerHTML = `<p><strong>Admin:</strong> ${message}</p>`;
        insertMessageBeforeInput(newMessageDiv, document.getElementById(`adminMessageInput_${clientId}`));
    }
}

// Ajouter des évenements sur l'envoie de message...
document.getElementById('sendAdminMessageButton').addEventListener('click', () => {
    const adminMessage = document.getElementById('adminMessageInput').value.trim();
    const selectedClientId = document.getElementById('adminMessageInput').dataset.clientId; // Récupérer l'ID du client à partir de l'attribut data-client-id
    if (adminMessage && selectedClientId) {
        sendMessageToClient(selectedClientId, adminMessage);
        displayAdminMessage(adminMessage);
        document.getElementById('adminMessageInput').value = '';
    }
});

// Afficher le message de l'admin...
function displayAdminMessage(message) {
    const messageLog = document.getElementById('messageLog');
}


