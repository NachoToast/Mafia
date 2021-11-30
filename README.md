# Mafia

# Changing Endpoints

**Client** endpoints are located in the [endpoints](./client/src/constants/endpoints.ts) file, make sure they're the same as the ones for the server (see below).

**Server** endpoints are declared when the [ServerHub](./server/src/classes/ServerHub.ts) starts, you can configure this in the [index](./server/src/index.ts#L3) file.

For instance, the default options here are port `3001`, and server name 'mafia' (Note that the endpoint is always `localhost`).

```ts
export const serverHub = new ServerHub(3001, 'mafia');
```
