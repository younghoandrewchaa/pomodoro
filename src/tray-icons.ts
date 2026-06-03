import { nativeImage, app } from 'electron';
import path from 'node:path';

function assetsPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets');
  }
  return path.join(app.getAppPath(), 'assets');
}

export function createTrayIcons() {
  const dir = assetsPath();

  const idle = nativeImage.createFromPath(path.join(dir, 'trayTemplate.png'));
  idle.addRepresentation({
    scaleFactor: 2,
    buffer: nativeImage.createFromPath(path.join(dir, 'trayTemplate@2x.png')).toPNG(),
  });
  idle.setTemplateImage(true);

  const focus = nativeImage.createFromPath(path.join(dir, 'tray-focus.png'));
  focus.addRepresentation({
    scaleFactor: 2,
    buffer: nativeImage.createFromPath(path.join(dir, 'tray-focus@2x.png')).toPNG(),
  });

  const breakIcon = nativeImage.createFromPath(path.join(dir, 'tray-break.png'));
  breakIcon.addRepresentation({
    scaleFactor: 2,
    buffer: nativeImage.createFromPath(path.join(dir, 'tray-break@2x.png')).toPNG(),
  });

  return { idle, focus, break: breakIcon };
}
