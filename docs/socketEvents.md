# Socket Events List

### Client

-   `connection`
-   `disconnect`
-   `usernameSubmit`
    -   message (string)
-   `sendPlayerMessage`
    -   message (string)

### Server

-   `usernameTaken`
-   `usernameInvalid`
-   `systemMessage`
    -   string
-   `playerMessage`
    -   message (string)
    -   author (string)
-   `newUser`
    -   user (string)
    -   socket id (string)
