<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./style_admin.css">
    <title>LiveChat</title>
</head>
<body>
    <h2>Admin ChatLive</h2>
    
    <div class="clientList">
        <h3>Clients connectés :</h3>
        <ul id="clientList">
        </ul>
    </div>
   
    <!-- Zone de conversation avec le client sélectionné -->
    <div id="clientConversation" style="display: none;">
        <h3>Discussion avec le client <span id="selectedClientId"></span></h3>
        <div id="messageLog" class="messageLog"></div> <!-- Ici, vous devriez voir les messages et les images des clients -->
    </div> 
    
    <script src="./script/admin.js"></script>
</body>
</html>
