<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/style/style_client.css">
    <title>LiveChat</title>
</head>
<body>
<div class="container">
        <div class="chat-header">
            <h1>Chat en temps réel</h1>
        </div>
        <div class="message-log" id="messageLog">
            <!-- Les messages seront ajoutés ici -->
        </div>
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="Entrez votre message...">
            <input type="file" id="imageInput">
            <button id="sendMessageButton">Envoyer</button>
        </div>
    <script src="/script/client.js"></script>
</body>
</html>
