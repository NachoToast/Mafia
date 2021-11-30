# Mafia

# Changing Endpoints

![image](https://user-images.githubusercontent.com/32235595/143984774-d2526a22-9956-4813-b0c9-f1b49abb26b3.png)

**Client** endpoints are located in the [endpoints](./client/src/config/endpoints.jsonc) file, make sure they're the same as the ones for the server (see below).

> If you want to have a local client _and_ server set up, just edit the client's `serverEndpoint` to point to `http://localhost`!

**Server** endpoints are declared when the [ServerHub](./server/src/classes/ServerHub.ts) starts, you can configure this in the [index](./server/src/index.ts#L3) file.

For instance, the default options here are port `3001`, and server name 'mafia' (Note that the endpoint is always `localhost`).

```ts
export const serverHub = new ServerHub(3001, 'mafia');
```
