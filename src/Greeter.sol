// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Greeter messages board
/// @notice Guarda mensajes enviados por direcciones, lista de usuarios únicos y permite leer mensajes por dirección
contract Greeter {
    // messages per address
    mapping(address => string[]) private _messages;

    // list of unique users that have sent at least one message
    address[] private _users;
    mapping(address => bool) private _isUser;

    // events
    event MessageSent(
        address indexed sender,
        uint256 indexed index,
        string message
    );

    /// @notice Envía un mensaje y lo guarda bajo la dirección del remitente
    /// @param message El texto del mensaje
    function sendMessage(string calldata message) external {
        if (!_isUser[msg.sender]) {
            _isUser[msg.sender] = true;
            _users.push(msg.sender);
        }
        _messages[msg.sender].push(message);
        emit MessageSent(msg.sender, _messages[msg.sender].length - 1, message);
    }

    /// @notice Obtiene todos los mensajes de una dirección
    /// @param user La dirección cuyos mensajes quieres obtener
    /// @return Un array con los mensajes (puede estar vacío)
    function getMessages(address user) external view returns (string[] memory) {
        return _messages[user];
    }

    /// @notice Obtiene la lista de usuarios que han enviado mensajes
    /// @return Un array con las direcciones de los usuarios
    function getAllUsers() external view returns (address[] memory) {
        return _users;
    }

    /// @notice Obtiene la cantidad de mensajes enviados por una dirección
    /// @param user La dirección a consultar
    /// @return El número de mensajes
    function getMessagesCount(address user) external view returns (uint256) {
        return _messages[user].length;
    }

    /// @notice (Compatibilidad) devuelve el último mensaje del remitente que llama, o una cadena vacía si no hay mensajes
    function greet() external view returns (string memory) {
        string[] storage msgs = _messages[msg.sender];
        if (msgs.length == 0) return "";
        return msgs[msgs.length - 1];
    }
}
