import { VehicleConfiguration } from '../types/vehicle';

/**
 * Builds a clean, shareable URL with all active vehicle customization parameters.
 */
export function generateShareUrl(config: VehicleConfiguration): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  if (config.modelId) params.set('model', config.modelId);
  if (config.colorId) params.set('color', config.colorId);
  if (config.finishType) params.set('finish', config.finishType);
  if (config.wheelId) params.set('wheel', config.wheelId);
  if (config.wheelFinishId) params.set('wheelFinish', config.wheelFinishId);
  if (config.caliperColorId) params.set('caliper', config.caliperColorId);
  if (config.aeroPackageId) params.set('aero', config.aeroPackageId);
  if (config.roofId) params.set('roof', config.roofId);
  if (config.interiorId) params.set('interior', config.interiorId);
  if (config.ambientLightColor) params.set('ambient', config.ambientLightColor.replace('#', ''));
  if (config.packageIds && config.packageIds.length > 0) {
    params.set('packages', config.packageIds.join(','));
  }
  if (config.studioPreset) params.set('preset', config.studioPreset);

  url.search = params.toString();
  return url.toString();
}

/**
 * Copies text to clipboard with modern Clipboard API and fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback for older browsers / iframes
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
