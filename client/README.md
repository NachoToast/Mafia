# Mafia Client

This is the **client** portion of the mafia codebase. It's what the user sees, and acts as an intermediate between the user (the **client**) and the server (the **api**).

If you want to work on UI design, HTML, CSS, etc.. then this is the place for you.

# Setting up the Client

To set up the client on your own device.
Make sure you have the **current** version of [Node](https://nodejs.org/en/) installed (LTS version probably works too but hasn't been tested).

-   If you just installed `Node`, you'll need to restart your VS Code so it realised you have it installed, otherwise you'll have some issues with the `npm` and `yarn` commands later on.

Note that the client will automatically connect to the ntgc.ddns.net server on startup, if you want to test out interactions with the `server` side of this repository, edit the `serverEndpoint` and port constants in the [endpoints](./src/config/endPointOverrides.jsonc) file. 

To apply this, change the file extension to .json and remove comments from the endPointOverrides file.

### Cloning the Repository

1. Open a new VS Code window.
2. Press `CTRL + SHIFT + P` and type `git clone` (it should be the second one that comes up).
3. Press `enter` button (or hit the `git clone` button) and paste the [URL](https://github.com/NachoToast/Mafia) of this repository into the box.
4. Press `enter` again (or hit the `Clone from URL` button) and choose where you want to put the folder, it will be put in a `Mafia` subfolder automatically.

### Downloading Dependencies

1. In VS Code you can open a terminal with `` CTRL + ` `` or through the `Terminal` button on the top menu bar.
2. The terminal should show you what folder you're currently in, navigate to the `Mafia\Client` folder using the `cd` command:
    - `cd .\Client\` should be all that's required.
    - Tab autocomplete is your best friend here.
3. Install the dependencies using `npm install` (`npm i`) or `yarn`:

-   `npm` is already downloaded with Node, but is slower than `yarn`.
-   `yarn` is much faster, but you'll need to quickly download it first using `npm install yarn -g` (The `-g` is a global flag, meaning you'll never have to download it again).
-   This _will_ take a while since the client uses lots of dependencies (~40k).

### Running the Client

Now you can run the client by typing `yarn start` or `npm start`, it'll take up to a couple minutes to do the first-boot, but afterwards any changes you make to the files will be updated almost instantly on your browser.

# About the Codebase

If you haven't picked it up from the excessively verbose README, the secondary goal of this project is to be a tutorial resource. As such, eventually every directory you can go into will have a `README.md` file that explains why that directory exists and what sort of things it contains.

-   If you're browsing on GitHub, the README's will open automatically for every folder you go into.
-   If you're browsing on VS Code, you'll need to manually open the README's, you can also preview them using `CTRL + SHIFT + V`.

# Contributing

Feel free to fork the repository and make pull requests. Automatic linting is done by the [Prettier](../.prettierrc.js) file, so if your code is randomly formatting itself on save, thats intentional.

## Learn More

Why are there like 40k dependencies for the client? [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
