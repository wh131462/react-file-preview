<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchTextUtf8 } from '@eternalheart/file-preview-core';
import { useTranslator } from '../../composables/useTranslator';

const props = defineProps<{
  url: string;
  fileName: string;
}>();

const { t } = useTranslator();

const data = ref<unknown>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const loadJson = async () => {
  loading.value = true;
  error.value = null;
  try {
    const text = await fetchTextUtf8(props.url);
    data.value = JSON.parse(text);
  } catch (err) {
    console.error(err);
    error.value = t.value('json.load_failed');
  } finally {
    loading.value = false;
  }
};

watch(() => props.url, loadJson, { immediate: true });
</script>

<template>
  <div v-if="loading" class="vfp-flex vfp-items-center vfp-justify-center vfp-w-full vfp-h-full">
    <div class="vfp-w-12 vfp-h-12 vfp-border-4 vfp-border-white/20 vfp-border-t-white vfp-rounded-full vfp-animate-spin" />
  </div>

  <div v-else-if="error" class="vfp-flex vfp-items-center vfp-justify-center vfp-w-full vfp-h-full">
    <div class="vfp-text-white/70 vfp-text-center">
      <p class="vfp-text-lg">{{ error }}</p>
    </div>
  </div>

  <div v-else class="vfp-w-full vfp-h-full vfp-overflow-auto vfp-py-3 vfp-pr-4" style="background: #1e1e1e;">
    <JsonNode :value="data" :depth="0" :default-expanded="true" />
  </div>
</template>

<!-- 递归 JSON 节点组件 -->
<script lang="ts">
import { defineComponent, h, inject, computed, type PropType } from 'vue';
import { ChevronRight, ChevronDown } from 'lucide-vue-next';
import { createTranslator, type Translator } from '@eternalheart/file-preview-core';
import { LOCALE_KEY } from '../../i18n/localeKey';

export default defineComponent({ name: 'JsonRenderer' });

function renderValue(value: unknown) {
  if (value === null) return h('span', { class: 'json-null' }, 'null');
  if (value === undefined) return h('span', { class: 'json-null' }, 'undefined');
  if (typeof value === 'boolean') return h('span', { class: 'json-bool' }, String(value));
  if (typeof value === 'number') return h('span', { class: 'json-number' }, String(value));
  if (typeof value === 'string') return h('span', { class: 'json-string' }, `"${value}"`);
  return h('span', { class: 'json-bracket' }, String(value));
}

function renderPrimitiveLine(keyName: string | undefined, value: unknown, indent: number, override?: string) {
  return h('div', { class: 'json-row', style: { paddingLeft: `${indent}px` } }, [
    h('span', { class: 'json-arrow-placeholder' }),
    keyName !== undefined
      ? h('span', { class: 'json-key' }, [
          `"${keyName}"`,
          h('span', { class: 'json-colon' }, ': '),
        ])
      : null,
    override
      ? h('span', { class: 'json-bracket' }, override)
      : renderValue(value),
  ]);
}

const JsonNode = defineComponent({
  name: 'JsonNode',
  props: {
    keyName: { type: String, default: undefined },
    value: { type: null as unknown as PropType<unknown>, required: true },
    depth: { type: Number, required: true },
    defaultExpanded: { type: Boolean, default: false },
  },
  setup(props) {
    const expanded = ref(props.defaultExpanded);
    const toggle = () => { expanded.value = !expanded.value; };
    const injected = inject(LOCALE_KEY, null);
    const tFunc = computed<Translator>(() => injected?.t.value ?? createTranslator({ locale: 'zh-CN' }));
    return { expanded, toggle, tFunc };
  },
  render() {
    const { keyName, value, depth, expanded, toggle, tFunc } = this;
    const indent = depth * 20;

    // 基本类型
    if (value === null || value === undefined || typeof value !== 'object') {
      return renderPrimitiveLine(keyName, value, indent);
    }

    const isArr = Array.isArray(value);
    const entries = isArr ? (value as unknown[]) : Object.entries(value as Record<string, unknown>);
    const count = entries.length;
    const open = isArr ? '[' : '{';
    const close = isArr ? ']' : '}';

    // 空对象/数组
    if (count === 0) {
      return renderPrimitiveLine(keyName, null, indent, `${open}${close}`);
    }

    const children = [];

    // 折叠行
    children.push(
      h('div', {
        class: 'json-row json-toggle',
        style: { paddingLeft: `${indent}px` },
        onClick: toggle,
      }, [
        h('span', { class: 'json-arrow' }, [
          h(expanded ? ChevronDown : ChevronRight, { class: 'vfp-w-3.5 vfp-h-3.5' }),
        ]),
        keyName !== undefined
          ? h('span', { class: 'json-key' }, [
              `"${keyName}"`,
              h('span', { class: 'json-colon' }, ': '),
            ])
          : null,
        h('span', { class: 'json-bracket' }, open),
        !expanded
          ? h('span', { class: 'json-collapsed' }, [
              isArr ? `${count} ${tFunc('json.items')}` : `${count} ${tFunc('json.keys')}`,
              h('span', { class: 'json-bracket' }, ` ${close}`),
            ])
          : null,
      ])
    );

    // 子节点
    if (expanded) {
      if (isArr) {
        (value as unknown[]).forEach((item, i) => {
          children.push(
            h(JsonNode, { key: i, value: item, depth: depth + 1, defaultExpanded: depth < 1 })
          );
        });
      } else {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
          children.push(
            h(JsonNode, { key: k, keyName: k, value: v, depth: depth + 1, defaultExpanded: depth < 1 })
          );
        });
      }
      children.push(
        h('div', { class: 'json-row', style: { paddingLeft: `${indent + 20}px` } }, [
          h('span', { class: 'json-bracket' }, close),
        ])
      );
    }

    return h('div', null, children);
  },
});
</script>

<style scoped>
.json-row {
  display: flex;
  align-items: flex-start;
  padding-top: 1px;
  padding-bottom: 1px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}
.json-toggle {
  cursor: pointer;
  user-select: none;
}
.json-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}
.json-arrow {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
}
.json-arrow-placeholder {
  width: 16px;
  height: 20px;
  flex-shrink: 0;
}
.json-key {
  color: #9cdcfe;
  flex-shrink: 0;
}
.json-colon {
  color: rgba(255, 255, 255, 0.5);
}
.json-bracket {
  color: rgba(255, 255, 255, 0.7);
}
.json-collapsed {
  color: rgba(255, 255, 255, 0.3);
  margin-left: 4px;
}
.json-string {
  color: #ce9178;
}
.json-number {
  color: #b5cea8;
}
.json-bool,
.json-null {
  color: #569cd6;
}
.json-null {
  font-style: italic;
}
</style>
