<?php

namespace MyApp;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\WebSocket\MessageComponentInterface as WebSocketMessageComponentInterface;

class MessageServer implements WebSocketMessageComponentInterface
{
    protected $clients;
    protected $lastClientId = 0; //var pour suivre le dernier ID
    private $connectedClients = [];

    public function __construct()
    {
        $this->clients = new \SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn)
    {
        //Incrementer l'ID et l'attribuer a l'ID
        $this->lastClientId++;
        $conn->resourceId = $this->lastClientId;
        
        $this->clients->attach($conn);
        //Verifier si le client est l'ID 1
        if ($conn->resourceId == 1) {
            $this->connectedClients[$conn->resourceId] = $conn;
            echo "Client ID 1 connecté et maintenant en ligne.\n";
        } else {
            echo "Client connecté ({$conn->resourceId})\n";
        }

    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $message = json_decode($msg, true);

        // Envoyer l'image à l'administrateur et au client qui l'a envoyée
        if (isset($message['type']) && $message['type'] === 'image') {
            // Envoyer l'image à l'administrateur
            $adminConnection = $this->getAdminConnection();
            if ($adminConnection !== null) {
                $message['clientId'] = $from->resourceId; // Ajouter l'ID du client au message
                $adminConnection->send(json_encode($message));
            }
            // Envoyer l'image au client qui l'a envoyée
            $from->send($msg);
        } elseif (isset($message['toAdmin']) && $message['toAdmin'] === true) {
            // Gérer les messages destinés à l'administrateur
            $adminConnection = $this->getAdminConnection();
            if ($adminConnection !== null) {
                $messageWithClientId = [
                    'adminMessage' => $message['clientName'], // Utiliser le nom du client
                    'clientId' => $from->resourceId,
                    'content' => $message['content']
                ];
                $adminConnection->send(json_encode($messageWithClientId));
            }
        } elseif (isset($message['toClient']) && $message['toClient'] === true) {
            // Gérer les messages destinés aux clients
            $clientConnection = $this->getClientConnection($message['clientId']);
            if ($clientConnection !== null) {
                $messageWithAdmin = [
                    'adminMessage' => 'Admin', // Message de l'admin
                    'content' => $message['content']
                ];
                $clientConnection->send(json_encode($messageWithAdmin));
            }
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
        echo "Client ({$conn->resourceId}) déconnecté\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error occured: {$e->getMessage()}\n";
        $conn->close();
    }

    protected function getAdminConnection()
    {
        foreach ($this->clients as $client) {
            return $client;
        }
        return null;
    }

    protected function getClientConnection($clientId)
    {
        foreach ($this->clients as $client) {
            if ($client->resourceId == $clientId) {
                return $client;
            }
        }
        return null;
    }
}
