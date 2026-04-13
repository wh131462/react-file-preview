import type { ToolbarGroup } from '../toolbar.types';
import type { Translator } from '@eternalheart/file-preview-core';
import { ChevronLeft, ChevronRight, List, Maximize2, Minimize2 } from 'lucide-vue-next';

export interface MobiToolbarContext {
  mobiRef: { prevPage: () => void; nextPage: () => void; toggleFullWidth: () => void; toggleToc: () => void } | null;
  current: number;
  total: number;
  fullWidth: boolean;
  t: Translator;
}

export function getMobiToolbarGroups(ctx: MobiToolbarContext): ToolbarGroup[] {
  return [
    {
      items: [
        { type: 'button', icon: List, tooltip: ctx.t('toolbar.toc'), action: () => ctx.mobiRef?.toggleToc() },
      ],
    },
    {
      items: [
        { type: 'button', icon: ChevronLeft, tooltip: ctx.t('toolbar.prev_page'), action: () => ctx.mobiRef?.prevPage() },
        { type: 'text', content: `${ctx.current} / ${ctx.total}`, minWidth: '4rem' },
        { type: 'button', icon: ChevronRight, tooltip: ctx.t('toolbar.next_page'), action: () => ctx.mobiRef?.nextPage() },
      ],
    },
    {
      items: [
        {
          type: 'button',
          icon: ctx.fullWidth ? Minimize2 : Maximize2,
          tooltip: ctx.fullWidth ? ctx.t('toolbar.normal_width') : ctx.t('toolbar.full_width'),
          action: () => ctx.mobiRef?.toggleFullWidth(),
        },
      ],
    },
  ];
}
