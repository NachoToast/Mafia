/** Events captured by the game's global io instance, aka ones that aren't tied to player sockets. */
export const RECEIVED_SERVER_EVENTS = {
    JOIN: 'connect',
};

/** Events captured by player-specific socket instances. */
export const RECEIVED_PLAYER_EVENTS = {
    USERNAME_SUBMIT: 'usernameSubmit',
    LEAVE: 'disconnect',
    HERE_IS_TOKEN: 'heresToken',
};

/** Events emitted by the game's global io instance. */
export const EMITTED_SERVER_EVENTS = {};

/** Events emitted by the player-specific socket instance. */
export const EMITTED_PLAYER_EVENTS = {
    UNREGISTERED: 'unregistered',
    GIVE_TOKEN: 'giveToken',
};
