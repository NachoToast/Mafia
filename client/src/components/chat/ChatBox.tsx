import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatBox = ({ messages }: { messages: string[] }) => {
    const scrollToBottom = () => {
        if (messageEndRef.current !== null) {
            const current = messageEndRef.current as HTMLElement;
            current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(scrollToBottom, [messages]);

    const messageEndRef = useRef(null);
    return (
        <div style={{ overflowY: 'auto', height: '30vh' }}>
            {messages.map((message) => (
                <ChatMessage message={message} />
            ))}
            <div ref={messageEndRef} />
        </div>
    );
};

export default ChatBox;
