# Mafia

# Changing Endpoints

![image](https://user-images.githubusercontent.com/32235595/143978116-ef786576-64cb-445b-af61-0e6c6e270016.png)

**Client** endpoints are located in the [endpoints](./client/src/constants/endpoints.ts) file, make sure they're the same as the ones for the server (see below).
> If you want to have a local client *and* server set up, edit the client's `serverEndpoint` to point to `http://localhost` instead of the default!

**Server** endpoints are declared when the [ServerHub](./server/src/classes/ServerHub.ts) starts, you can configure this in the [index](./server/src/index.ts#L3) file.

For instance, the default options here are port `3001`, and server name 'mafia' (Note that the endpoint is always `localhost`).

```ts
export const serverHub = new ServerHub(3001, 'mafia');
```
