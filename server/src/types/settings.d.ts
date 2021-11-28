import { JoinVerification } from '../classes/ConnectionSystem';
import { BaseLoggerParams } from '../classes/Logger';

export interface ConnectionSettings {
    /** Allow multiple players from same IP to join the same game.
     *
     * **Pros**: Multiple people on same network can join the game.
     *
     * **Cons**: People can make multiple tabs to join on multiple accounts.
     */
    allowDuplicateIP?: boolean;

    /** Maximum duration a player can remain connected. Accepts formats like `1h`, `1d`, `30m`, etc..
     *
     * **Recommended**: `1h`
     */
    tokenDuration?: string;

    /** How long to wait for connections to verify themselves before disconnecting them.
     *
     * **Pros**: More accommodating for bad internet.
     *
     * **Cons**: Bad internet = bad playing experience.
     */
    requestTimeoutSeconds?: number;

    /** Ways to verify the player is who they say they are when joining a game.
     *
     * Valid options are: `token`, `ip`, `gamecode`, and `username`. Use a combination of these, but note that `token` does both `gamecode` and `username` (and is way more secure than both).
     *
     * **Pros**: Prevent unwanted joiners and impersonators.
     *
     * **Cons**: None currently known, report them on the GitHub repo if you encounter any.
     */
    playerVerification?: JoinVerification[];

    /** Allow players to reconnect to the game.
     *
     * **Pros**: People can get back in if they refresh or wifi dies.
     *
     * **Cons**: ¯\\\_(ツ)_/¯
     */
    allowReconnects?: boolean;

    /** Allow spectators to reconnect to the game.
     *
     * **Pros/Cons**: None, this option is just personal preference.
     */
    allowSpectatorReconnects?: boolean;

    /** Allow players to reconnect to the game before it has started.
     *
     * **Pros**: ¯\\\_(ツ)_/¯
     *
     * **Cons**: Player list can quickly become full.
     */
    allowPregameReconnects?: boolean;

    /** Whether alive players who disconnect should be killed.
     *
     * **Pros**: Prevents game dragging on if people disconnect.
     *
     * **Cons**: If reconnects are enabled then death could've been pointless.
     */
    killDisconnectedPlayers?: boolean;
}

export interface LoggingSettings {
    /** Whether the lobby should log events.
     *
     * **Pros**: Very helpful for debugging and diagnostics.
     *
     * **Cons**: Can get big if you have lots of them.
     */
    enabled?: boolean;

    /** Advanced, options for base game logger. */
    baseParams?: BaseLoggerParams;

    /** Whether the lobby should log join, leave, and rejoin attempts.
     *
     * **Pros**: Can help diagnose connection issues.
     *
     * **Cons**: Can get big if you have lots of them.
     */
    logConnections?: boolean;

    /** Advanced, options for base game logger. */
    connectionParams?: BaseLoggerParams;
}

export interface ServerHubSettings {
    /** Log stuff like game creation and destruction. */
    logKeyServerEvents: boolean;

    /** Logger params for above option. */
    KSEParams: BaseLoggerParams;

    /** Log generation of game codes. */
    logGameCodeGeneration: boolean;

    /** Logger params for above option. */
    GCGParams: BaseLoggerParams;
}
