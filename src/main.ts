import { app, BrowserWindow, Tray, ipcMain, screen } from 'electron';
import { exec } from 'node:child_process';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';
import { createTrayIcons } from './tray-icons';

if (started) {
  app.quit();
}

interface Settings {
  focusMinutes: number;
  breakMinutes: number;
  lastOpenedDate: string;
}

interface SessionRecord {
  startedAt: string;
  durationSeconds: number;
}

const settingsStore = new Store<Settings>({
  name: 'settings',
  defaults: {
    focusMinutes: 20,
    breakMinutes: 5,
    lastOpenedDate: '',
  },
});

const sessionStore = new Store<{ sessions: SessionRecord[] }>({
  name: 'sessions',
  defaults: { sessions: [] },
});

let tray: Tray | null = null;
let popoverWindow: BrowserWindow | null = null;
let trayIcons: ReturnType<typeof createTrayIcons> | null = null;

function showNotification(title: string, body: string) {
  if (process.platform !== 'darwin') return;
  const t = title.replace(/'/g, "'\\''");
  const b = body.replace(/'/g, "'\\''");
  exec(`osascript -e 'display notification "${b}" with title "${t}" sound name "default"'`);
}

function createPopoverWindow() {
  popoverWindow = new BrowserWindow({
    width: 260,
    height: 460,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    vibrancy: 'popover',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    popoverWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    popoverWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  popoverWindow.on('blur', () => {
    popoverWindow?.hide();
  });

  popoverWindow.on('closed', () => {
    popoverWindow = null;
  });
}

function positionPopover() {
  if (!tray || !popoverWindow) return;

  const trayBounds = tray.getBounds();
  const windowBounds = popoverWindow.getBounds();
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });
  const workArea = display.workArea;

  let x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  let y = Math.round(trayBounds.y + trayBounds.height + 4);

  // Keep within screen bounds
  x = Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - windowBounds.width));
  if (y + windowBounds.height > workArea.y + workArea.height) {
    y = Math.round(trayBounds.y - windowBounds.height - 4);
  }

  popoverWindow.setPosition(x, y, false);
}

function togglePopover() {
  if (!popoverWindow) return;

  if (popoverWindow.isVisible()) {
    popoverWindow.hide();
  } else {
    positionPopover();
    popoverWindow.show();
    popoverWindow.focus();
  }
}

function registerIpcHandlers() {
  ipcMain.on('timer:state-update', (_event, state: {
    mode: 'focus' | 'break';
    isRunning: boolean;
  }) => {
    if (!tray || !trayIcons) return;
    if (!state.isRunning) {
      tray.setImage(trayIcons.idle);
    } else if (state.mode === 'focus') {
      tray.setImage(trayIcons.focus);
    } else {
      tray.setImage(trayIcons.break);
    }
  });

  ipcMain.on('timer:completed', (_event, mode: 'focus' | 'break') => {
    if (popoverWindow && !popoverWindow.isVisible()) {
      positionPopover();
      popoverWindow.show();
      popoverWindow.focus();
    }
    if (mode === 'focus') {
      showNotification('Focus Complete!', 'Time to take a break.');
    } else {
      showNotification('Break Over!', 'Time to get back to work.');
    }
  });

  ipcMain.handle('session:record', (_event, session: SessionRecord) => {
    const sessions = sessionStore.get('sessions');
    sessions.push(session);
    sessionStore.set('sessions', sessions);
  });

  ipcMain.handle('session:get-today', () => {
    const today = new Date().toISOString().slice(0, 10);
    const sessions = sessionStore.get('sessions');
    return sessions.filter(s => s.startedAt.startsWith(today));
  });

  ipcMain.handle('settings:get', () => {
    return {
      focusMinutes: settingsStore.get('focusMinutes'),
      breakMinutes: settingsStore.get('breakMinutes'),
      lastOpenedDate: settingsStore.get('lastOpenedDate'),
    };
  });

  ipcMain.handle('settings:set', (_event, updates: Partial<Settings>) => {
    if (updates.focusMinutes !== undefined) settingsStore.set('focusMinutes', updates.focusMinutes);
    if (updates.breakMinutes !== undefined) settingsStore.set('breakMinutes', updates.breakMinutes);
    if (updates.lastOpenedDate !== undefined) settingsStore.set('lastOpenedDate', updates.lastOpenedDate);
  });

  ipcMain.on('app:quit', () => {
    app.quit();
  });
}

app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  trayIcons = createTrayIcons();
  tray = new Tray(trayIcons.idle);
  tray.setToolTip('Pomodoro');

  if (process.platform === 'darwin') {
    tray.setIgnoreDoubleClickEvents(true);
  }

  tray.on('click', () => {
    togglePopover();
  });

  registerIpcHandlers();
  createPopoverWindow();
});

app.on('window-all-closed', () => {
  // Do not quit on window close — tray app stays alive
});
