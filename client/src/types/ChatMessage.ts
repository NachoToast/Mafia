interface MessageProps {
    color?: string;
    hideAuthor?: boolean;
}

/** ChatMessage store by client */
export default interface ChatMessage {
    id: string;
    author: string;
    content: string;
    props?: MessageProps;
}

/** ServerChatMessage sent by socket from the server */
export interface SCM {
    author: string;
    content: string;
    props?: MessageProps;
}
