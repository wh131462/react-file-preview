import type { InjectionKey, Ref, ComputedRef } from 'vue';
import type { Locale, Translator } from '@eternalheart/file-preview-core';

export interface LocaleInjection {
  locale: Ref<Locale>;
  t: ComputedRef<Translator>;
}

export const LOCALE_KEY: InjectionKey<LocaleInjection> = Symbol('file-preview-locale');
