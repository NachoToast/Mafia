# Role System

## How It Works

1. During the night, players select their nighttime target.
2. At the end of the night:
    1. Queued actions are sorted in order of role priority.
    2. The player's role's `nightAction()` method is called. This method will mutate the player's [PlayerState](../../types/PlayerState.ts), and add the affected players to the game's `affectedPlayers` list.
    3. Once all `nightActions()` have been called, the game will process the mutated state of all players in the `affectedPlayers` list, sending out socket events accordingly.
3. After a couple seconds, day breaks.
