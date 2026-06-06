import { nativeImage } from 'electron';
import { deflateSync } from 'node:zlib';

export interface TrayTimerState {
  mode: 'focus' | 'break';
  isRunning: boolean;
  secondsRemaining: number;
  totalSeconds: number;
}

const UNRIPE_TOMATO = '#3ca35c';
const RIPE_TOMATO = '#ea4d22';
const NEUTRAL_TOMATO = '#d4522d';
const UNRIPE_RGB = { red: 60, green: 163, blue: 92 };
const RIPE_RGB = { red: 234, green: 77, blue: 34 };
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function clamp(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function focusRipenessProgress(state: Pick<TrayTimerState, 'secondsRemaining' | 'totalSeconds'>): number {
  if (state.totalSeconds <= 0) return 0;
  return clamp(1 - state.secondsRemaining / state.totalSeconds);
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

function parseHexColor(color: string) {
  const hex = color.replace('#', '');
  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
  };
}

export function interpolateTomatoColor(progress: number): string {
  const clamped = clamp(progress);
  if (clamped === 0) return UNRIPE_TOMATO;
  if (clamped === 1) return RIPE_TOMATO;

  const redProgress = clamp(clamped * 1.23);
  const red = UNRIPE_RGB.red + (RIPE_RGB.red - UNRIPE_RGB.red) * redProgress;
  const green = UNRIPE_RGB.green + (RIPE_RGB.green - UNRIPE_RGB.green) * clamped;
  const blue = UNRIPE_RGB.blue + (RIPE_RGB.blue - UNRIPE_RGB.blue) * clamped;

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function drawPixel(buffer: Buffer, size: number, x: number, y: number, color: {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const offset = (y * size + x) * 4;
  buffer[offset] = color.red;
  buffer[offset + 1] = color.green;
  buffer[offset + 2] = color.blue;
  buffer[offset + 3] = color.alpha;
}

export function createTomatoPngBuffer(fillColor: string, size: number): Buffer {
  const pixels = Buffer.alloc(size * size * 4);
  const fill = parseHexColor(fillColor);
  const leaf = { red: 47, green: 125, blue: 69, alpha: 255 };
  const highlight = { red: 255, green: 255, blue: 255, alpha: 80 };
  const tomato = { ...fill, alpha: 255 };
  const centerX = (size - 1) / 2;
  const centerY = size * 0.62;
  const radiusX = size * 0.37;
  const radiusY = size * 0.34;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;

      if (dx * dx + dy * dy <= 1) {
        drawPixel(pixels, size, x, y, tomato);
      }
    }
  }

  const stemY = Math.round(size * 0.24);
  for (let x = Math.round(size * 0.28); x <= Math.round(size * 0.72); x += 1) {
    drawPixel(pixels, size, x, stemY, leaf);
    drawPixel(pixels, size, x, stemY + 1, leaf);
  }
  for (let offset = 0; offset <= Math.round(size * 0.2); offset += 1) {
    drawPixel(pixels, size, Math.round(centerX) - offset, stemY + offset, leaf);
    drawPixel(pixels, size, Math.round(centerX) + offset, stemY + offset, leaf);
    drawPixel(pixels, size, Math.round(centerX), stemY + offset, leaf);
  }

  for (let y = Math.round(size * 0.42); y < Math.round(size * 0.62); y += 1) {
    for (let x = Math.round(size * 0.28); x < Math.round(size * 0.44); x += 1) {
      drawPixel(pixels, size, x, y, highlight);
    }
  }

  const scanlines = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    const scanlineOffset = y * (size * 4 + 1);
    scanlines[scanlineOffset] = 0;
    pixels.copy(scanlines, scanlineOffset + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createTomatoTrayIcon(fillColor: string) {
  const icon = nativeImage.createFromBuffer(createTomatoPngBuffer(fillColor, 16));
  icon.addRepresentation({
    scaleFactor: 2,
    buffer: createTomatoPngBuffer(fillColor, 32),
  });
  icon.setTemplateImage(false);
  return icon;
}

export function createTrayIconForState(state: TrayTimerState) {
  if (state.mode === 'break') {
    return createTomatoTrayIcon(RIPE_TOMATO);
  }

  return createTomatoTrayIcon(interpolateTomatoColor(focusRipenessProgress(state)));
}

export function createTrayIcons() {
  return {
    initial: createTomatoTrayIcon(NEUTRAL_TOMATO),
    forState: createTrayIconForState,
  };
}
