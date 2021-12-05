export enum PlayerStatuses {
    spectator,
    alive,
    dead,
}

/** Player object stored by client */
export default interface Player {
    username: string;
    number: number;
    status: PlayerStatuses;

    /** Extra text to append to the players name on the list.
     *
     * e.g. If my name is NachoToast, it would show NachoToast (You)
     *
     * Or if I was the revealed mayor, it would show NachoToast (Mayor)
     */
    extra: string;
    connected: boolean;
    isOwner: boolean;
}
