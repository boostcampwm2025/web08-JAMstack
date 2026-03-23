import { createElement, type ReactNode } from 'react';
import Avvvatars from './avvvatars/avvvatars.js';
import { getAvatarColors } from '@codejam/common/avvvatars';
import { SHAPE_PATHS } from './avvvatars/shape-paths.js';
import { type AvatarProvider } from './avatar-generator.js';

export type AvvvatarsVariant = 'shape' | 'character';

export interface AvvvatarsOptions {
  colors?: string[];
  variant?: AvvvatarsVariant;
}

export class AvvvatarsProvider implements AvatarProvider {
  private variant: AvvvatarsVariant;

  constructor(options: AvvvatarsOptions = {}) {
    this.variant = options.variant ?? 'shape';
    // Note: avvvatars는 colors를 지원하지 않음 (내부적으로 고정된 팔레트 사용)
  }

  createComponent(id: string, size: number): ReactNode {
    return createElement(Avvvatars, {
      value: id,
      size,
      variant: this.variant,
    });
  }

  toSvgString(id: string, size: number): string {
    const colors = getAvatarColors(id);
    const bgColor = colors.background;

    if (this.variant === 'character') {
      const name = String(id).substring(0, 2).toUpperCase();
      const fgColor = colors.text;
      const fontSize = Math.round((size / 100) * 37);

      return `<svg viewBox="0 0 32 32" fill="none" width="${size}" height="${size}">
        <circle cx="16" cy="16" r="16" fill="${bgColor}"/>
        <text x="16" y="16" text-anchor="middle" dominant-baseline="central" fill="${fgColor}" font-family="-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="500" style="text-transform: uppercase;">${name}</text>
      </svg>`;
    } else {
      const pathData = SHAPE_PATHS[colors.shapeIndex];
      const fgColor = colors.shape;

      const clipDefs = pathData.clipPathId
        ? `<defs><clipPath id="${pathData.clipPathId}"><rect width="32" height="32" fill="white"/></clipPath></defs>`
        : '';
      const clipOpen = pathData.clipPathId
        ? `<g clip-path="url(#${pathData.clipPathId})">`
        : '';
      const clipClose = pathData.clipPathId ? '</g>' : '';

      return `<svg viewBox="0 0 32 32" fill="none" width="${size}" height="${size}">
        <circle cx="16" cy="16" r="16" fill="${bgColor}"/>
        <g transform="translate(6.4, 6.4) scale(0.6)">
          ${clipDefs}
          ${clipOpen}
          <path d="${pathData.d}" fill="${fgColor}"/>
          ${clipClose}
        </g>
      </svg>`;
    }
  }
}
