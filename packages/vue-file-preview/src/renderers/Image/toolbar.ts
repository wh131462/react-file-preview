import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Scan, RefreshCw } from 'lucide-vue-next';
import { h, type FunctionalComponent } from 'vue';
import type { ToolbarGroup } from '../toolbar.types';
import type { Translator } from '@eternalheart/file-preview-core';

const OriginalSizeIcon: FunctionalComponent = (_props, { attrs }) => {
  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs,
  }, [
    h('text', {
      x: '12', y: '17.5', 'text-anchor': 'middle',
      'font-size': '20', 'font-weight': 'bold',
      fill: 'currentColor', stroke: 'none',
    }, '1:1'),
  ]);
};

export interface ImageToolbarContext {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: () => void;
  onOriginalSize: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  t: Translator;
}

export function getImageToolbarGroups(ctx: ImageToolbarContext): ToolbarGroup[] {
  return [
    {
      items: [
        { type: 'button', icon: ZoomOut, tooltip: ctx.t('toolbar.zoom_out'), action: ctx.onZoomOut, disabled: ctx.zoom <= 0.01 },
        { type: 'text', content: `${Math.round(ctx.zoom * 100)}%`, minWidth: '3rem' },
        { type: 'button', icon: ZoomIn, tooltip: ctx.t('toolbar.zoom_in'), action: ctx.onZoomIn, disabled: ctx.zoom >= 10 },
      ],
    },
    {
      items: [
        { type: 'button', icon: Scan, tooltip: ctx.t('toolbar.fit_to_window'), action: ctx.onFitToWidth },
        { type: 'button', icon: OriginalSizeIcon, tooltip: ctx.t('toolbar.original_size'), action: ctx.onOriginalSize },
      ],
    },
    {
      items: [
        { type: 'button', icon: RotateCcw, tooltip: ctx.t('toolbar.rotate_left'), action: ctx.onRotateLeft },
        { type: 'button', icon: RotateCw, tooltip: ctx.t('toolbar.rotate_right'), action: ctx.onRotateRight },
      ],
    },
    {
      items: [
        { type: 'button', icon: RefreshCw, tooltip: ctx.t('toolbar.reset'), action: ctx.onReset },
      ],
    },
  ];
}
