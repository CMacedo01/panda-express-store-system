import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';

process.env.GOOGLE_API_KEY = 'AIzaSyCARGg1wA07D7Hcg3kMjyzzVF8Yr_6VKPE'

let isToolbarVisible = true; // Tracks the state of the toolbar

// JSON configuration embedded in the source code
const urlConfig = {
    main: "https://authentic-chinese-cuisine.vercel.app",
    pages: [
        { name: "Customer", url: "https://authentic-chinese-cuisine.vercel.app/customer" },
        { name: "Kitchen", url: "https://authentic-chinese-cuisine.vercel.app/kitchen" }
    ]
};

const createWindow = (url: string, withToolbar: boolean) => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: withToolbar, // Show or hide the toolbar
    });

    // Load the specified URL
    mainWindow.loadURL(url);

    mainWindow.maximize();
    mainWindow.setFullScreen(true);
    mainWindow.setResizable(false);

    return mainWindow;
};

const createMenu = (mainWindow: BrowserWindow) => {
    const switchMenu = {
        label: 'Switch',
        submenu: [
            ...urlConfig.pages.map((page) => ({
                label: page.name,
                click: () => {
                    mainWindow.loadURL(page.url);
                },
            })),
            {
                type: 'separator',
            },
            {
                label: 'Hide Toolbar',
                click: () => {
                    // Hide toolbar by recreating the window
                    const currentURL = mainWindow.webContents.getURL();
                    isToolbarVisible = false; // Update state
                    mainWindow.close();
                    const newWindow = createWindow(currentURL, false);
                    createMenu(newWindow);
                },
            },
        ],
    };

    const menuTemplate = [switchMenu];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
};

// Electron lifecycle hooks
app.on('ready', () => {
    const mainWindow = createWindow(
        urlConfig.main,
        isToolbarVisible /* Pass the initial toolbar state */
    );
    createMenu(mainWindow);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const mainWindow = createWindow(
            urlConfig.main,
            isToolbarVisible /* Preserve the toolbar state on activation */
        );
        createMenu(mainWindow);
    }
});
