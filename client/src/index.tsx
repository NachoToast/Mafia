import { createTheme, CssBaseline, darkScrollbar, ThemeProvider } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import basicInfoSlice from './redux/slices/basicInfoSlice';
import gameSlice from './redux/slices/gameSlice';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: darkScrollbar(),
            },
        },
    },
});

const store = configureStore({
    reducer: {
        basicInfo: basicInfoSlice,
        game: gameSlice,
    },
});

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);
