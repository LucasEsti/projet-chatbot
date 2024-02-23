const socket = new WebSocket('ws://localhost:8081');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data); // Vérifiez les données reçues dans la console

    const adminMessage = data.adminMessage;
    const messageType = data.type;
    const messageContent = data.content;

    // Vérifier le type du message
    if (messageType === 'image') {
        console.log("Received image content:", messageContent); // Vérifiez le contenu de l'image dans la console

        // Créer un nouvel élément img
        const imgElement = document.createElement('img');

        // Définir l'attribut src avec les données de l'image base64
        imgElement.src = 'data:image/jpg;base64,' + messageContent; // Remplacez 'image/jpeg' par le type de votre image si nécessaire

        // Ajouter l'élément img au messageLog
        const messageLog = document.getElementById('messageLog');
        messageLog.appendChild(imgElement);
    } else {
        // Si ce n'est pas une image, afficher le message texte normalement
        const messageLog = document.getElementById('messageLog');
        messageLog.innerHTML += `<p><strong>${adminMessage}:</strong> ${messageContent}</p>`;
    }
});

socket.addEventListener('close', (event) => {
    console.log('WebSocket connection fermé', event);
});

socket.addEventListener('error', (event) => {
    console.error('WebSocket error', event);
});

function sendMessageToAdmin(message, name){
    const data = {
        toAdmin: true,
        content: message,
        clientName: name // Ajouter le nom du client ici
    };
    socket.send(JSON.stringify(data));

    const messageLog = document.getElementById('messageLog');
    messageLog.innerHTML += `<p><strong>${name}:</strong> ${message}</p>`;
}

//Variable pour l'entrer du nom
let userName = null; 

//Pour le nom du client
document.getElementById('sendMessageButton').addEventListener('click', () => {
    const userMessage = document.getElementById('messageInput').value.trim();

    //Verifier si le nom du client est déja été saisi
    if (!userName) {
        //Si le nom n'as pas encore été saisi
        userName = prompt("Entrer votre nom :");

        //Vérifier si l'utilisateur a saisi un nom
        if (!userName) {
            alert("Vous devez entrer un nom");
            return;
        }
    }

    //Envoyer le message a l'administrateur avec le nom de l'utilisateur
    if (userMessage) {
        sendMessageToAdmin(userMessage, userName);
        document.getElementById('messageInput').value = '';
    } else {
        alert("Veuillez entrer un message.");
    }
});

// Fonction pour envoyer une image au serveur
// Envoyer une image avec l'ID du client
function sendImage() {
    const file = document.getElementById('imageInput').files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageBase64 = event.target.result.split(',')[1];
            const message = {
                type: 'image',
                content: imageBase64,
                extension: file.name.split('.').pop(),
                filename: file.name,
                clientId: getClientId() // Ajouter l'ID du client
            };
            socket.send(JSON.stringify(message));
        };
        reader.readAsDataURL(file);
    }
}




function getClientId() {
    // Supposons que l'ID du client est stocké dans un élément HTML avec l'ID 'clientID'
    // Vous pouvez récupérer cette valeur à partir du DOM
    const clientIdElement = document.getElementById('clientID');
    if (clientIdElement) {
        return clientIdElement.textContent; // Renvoie le texte contenu dans l'élément
    } else {
        return ''; // Renvoie une chaîne vide si l'élément n'est pas trouvé
    }
}


// Écouter le changement dans l'élément d'entrée de type fichier
document.getElementById('imageInput').addEventListener('change', sendImage);


document.getElementById('sendMessageButton').addEventListener('click', () => {
    const userMessage = document.getElementById('messageInput').value.trim();

    if (userMessage) {
        sendMessageToAdmin(userMessage);
        document.getElementById('messageInput').value = '';
    }
});


