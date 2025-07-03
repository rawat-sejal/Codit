import React, { useState, useEffect, useRef } from 'react';
import ACTIONS from '../Actions';

const Chat = ({ socketRef, username }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socketRef.current) {
            // Listen for incoming messages
            socketRef.current.on(ACTIONS.NEW_MESSAGE, ({ message, sender, timestamp }) => {
                setMessages(prev => [...prev, { message, sender, timestamp }]);
            });

            return () => {
                socketRef.current.off(ACTIONS.NEW_MESSAGE);
            };
        }
    }, [socketRef.current]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socketRef.current) {
            const messageData = {
                message: newMessage.trim(),
                sender: username,
                timestamp: new Date().toLocaleTimeString()
            };
            
            socketRef.current.emit(ACTIONS.SEND_MESSAGE, messageData);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    return (
        <div className="chatContainer">
            <div className="chatHeader">
                <h3>Chat</h3>
            </div>
            <div className="messagesContainer">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === username ? 'ownMessage' : 'otherMessage'}`}>
                        <div className="messageHeader">
                            <span className="messageSender">{msg.sender}</span>
                            <span className="messageTime">{msg.timestamp}</span>
                        </div>
                        <div className="messageContent">{msg.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="messageForm" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="messageInput"
                />
                <button type="submit" className="sendButton">
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat; 