import { createServer } from 'http';
import { memoryUsage } from 'process';
import { Socket, Server } from 'socket.io';
import { DUPLICATE, INTERNAL_ERRORS } from '../constants/serverMessages';
import { PendingPlayer, Player } from './player';

import { statsReportInterval, allowDuplicateIP } from '../gameConfig.json';

export function getIPFromSocket(socket: Socket) {
    return socket.handshake.address.split(':').slice(-1)[0];
}

/** Represents a game room, with a code, playerlist, etc... */
export class Game {
    /** Players who haven't submitted a username yet. */
    private pendingPlayers: { [index: string]: PendingPlayer } = {};

    /** All players who have submitted a username, e.g. spectators, dead, and alive. */
    private playerList: { [index: string]: any } = {};

    /** List of all currently in-use names. */
    public namesList: string[] = [];

    /** List of all IPs (including pending players). */
    private ipsList: string[] = [];

    private running = false;
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        io.on('connection', (socket: Socket) => this.tryAddPendingPlayer(socket));
        console.log('Mafia server started!');

        if (!!statsReportInterval) {
            setInterval(() => this.gameStatusUpdate(), 1000 * statsReportInterval);
        }
    }

    /** Gives memory usage info and other game data. */
    private gameStatusUpdate() {
        console.log('Names', this.namesList);
        console.log('IPs', this.ipsList);
        console.log('Pending Player Count', Object.keys(this.pendingPlayers).length);
        console.log('Player Count', Object.keys(this.playerList).length);
        const heapInfo = memoryUsage();
        console.log(
            `RSS: ${Math.round(heapInfo.rss / 1024 ** 2)}MB, used/total = ${Math.round(
                heapInfo.heapUsed / 1024 ** 2,
            )}/${Math.round(heapInfo.heapTotal / 1024 ** 2)}MB (${Math.floor(
                (100 * heapInfo.heapUsed) / heapInfo.heapTotal,
            )}%)`,
        );
    }

    /** Returns whether the socket ID is already in any player list. */
    private isDuplicateSocket(socket: Socket): boolean {
        if (!!this.pendingPlayers[socket.id]) {
            console.log(DUPLICATE.SOCKET_ID(socket, this.pendingPlayers[socket.id]));
            return false;
        }
        if (!!this.playerList[socket.id]) {
            console.log(DUPLICATE.SOCKET_ID(socket, this.playerList[socket.id]));
            return true;
        }
        return false;
    }

    /** Returns whether the IP (linked to the socket) is already in any player list. */
    public isDuplicateIP(ip: string) {
        const pendingIPMap = Object.keys(this.pendingPlayers);
        const nonPendingIPMap = Object.keys(this.playerList);

        const pendingIPs = pendingIPMap.map((e) => this.pendingPlayers[e].ip);
        const nonPendingIPs = nonPendingIPMap.map((e) => this.playerList[e].ip);

        const pendingIPIndex = pendingIPs.indexOf(ip);
        const nonPendingIPIndex = nonPendingIPs.indexOf(ip);

        if (pendingIPIndex !== -1) {
            console.log(DUPLICATE.IP(this.pendingPlayers[pendingIPMap[pendingIPIndex]]));
            return true;
        }
        if (nonPendingIPIndex !== -1) {
            console.log(DUPLICATE.IP(this.playerList[nonPendingIPMap[nonPendingIPIndex]]));
            return true;
        }

        return false;
    }

    public isDuplicateUsername(username: string) {
        return this.namesList.includes(username.toLowerCase());
    }

    /** Adds a new socket connection to the pending players list. */
    private tryAddPendingPlayer(socket: Socket) {
        if (this.isDuplicateSocket(socket)) return;

        const playerIP = getIPFromSocket(socket);
        if (!allowDuplicateIP) {
            if (this.isDuplicateIP(playerIP)) return;
        }

        this.ipsList.push(playerIP);
        this.pendingPlayers[socket.id] = new PendingPlayer(this, socket, playerIP);
    }

    /** Removes a disconnected player's name from the ip list. */
    private removeIP(player: PendingPlayer | Player) {
        const ipIndex = this.ipsList.indexOf(player.ip);
        if (ipIndex === -1) {
            console.log(INTERNAL_ERRORS.NO_IP_TO_REMOVE(player));
        } else {
            this.ipsList.splice(ipIndex, 1);
        }
    }

    /** Removes a disconnected player's name from the names list. */
    private removeName(player: Player) {
        const nameIndex = this.namesList.indexOf(player.name.toLowerCase());
        if (nameIndex === -1) {
            console.log(INTERNAL_ERRORS.NO_NAME_TO_REMOVE(player));
        } else {
            this.namesList.splice(nameIndex, 1);
        }
    }

    /** Removes a disconnected pending player. */
    public removePendingPlayer(player: PendingPlayer, reason: string) {
        this.removeIP(player);

        delete this.pendingPlayers[player.socket.id];
        console.log(`${player.ip} Disconnected (${reason})`);
    }

    /** Removes a disconnected player. */
    public removePlayer(player: Player, reason: string) {
        this.removeIP(player);
        this.removeName(player);

        // remove name
        delete this.pendingPlayers[player.socket.id];
        console.log(`${player.name} Disconnected (${reason})`);
    }

    public movePlayer(player: PendingPlayer, username: string) {
        delete this.pendingPlayers[player.socket.id];

        this.playerList[player.socket.id] = new Player(this, player.socket, player.ip, username);
        this.namesList.push(username.toLowerCase());

        this.io.emit('systemMessage', `${username} joined the lobby`);
    }

    public globalChatMessage(message: string, player: Player) {
        this.io.emit('playerMessage', message, player.name);
    }
}
