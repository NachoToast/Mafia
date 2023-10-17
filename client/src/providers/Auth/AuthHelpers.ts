import { IAuthContext } from '../../contexts/Auth';

const KEY_AUTH = 'WINTONOVERWATCH_MAFIA.Auth';

/**
 * Retrieves the current session state from {@link sessionStorage}, generating a
 * new one if it doesn't yet exist.
 */
export function generateSessionState(
    discordApplicationId: string,
    redirectUri: string,
): IAuthContext {
    let state = sessionStorage.getItem(KEY_AUTH);

    if (state === null) {
        // Generate new pseudo-random state, not cryptographically
        // secure but good enough for our purposes.
        state = new Array(32)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('');

        sessionStorage.setItem(KEY_AUTH, state);
    }

    const linkParams = new URLSearchParams({
        response_type: 'code',
        client_id: discordApplicationId,
        state: state,
        redirect_uri: redirectUri,
        prompt: 'consent',
        scope: 'identify',
    });

    const oAuthLink = `https://discord.com/api/v10/oauth2/authorize?${linkParams.toString()}`;

    return { oAuthLink, state };
}
