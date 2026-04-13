/**
 * 字幕文件解析器：支持 SRT 与 WebVTT
 * 不依赖任何第三方库
 */

export interface SubtitleCue {
  /** 索引（SRT 为数字字符串；VTT 可选） */
  id?: string;
  /** 起始时间（秒） */
  start: number;
  /** 结束时间（秒） */
  end: number;
  /** 纯文本（多行合并，保留换行） */
  text: string;
}

export interface SubtitleParseResult {
  format: 'srt' | 'vtt';
  cues: SubtitleCue[];
  /** WebVTT 的头部注释/元数据（可选） */
  header?: string;
}

/**
 * 将 "HH:MM:SS,ms" 或 "HH:MM:SS.ms" 或 "MM:SS.ms" 时间戳转为秒数
 */
function parseTimestamp(ts: string): number {
  const cleaned = ts.trim().replace(',', '.');
  const parts = cleaned.split(':').map((p) => p.trim());
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Number(m) * 60 + Number(s);
  }
  return Number(cleaned) || 0;
}

/**
 * 格式化秒数为 HH:MM:SS.mmm
 */
export function formatSubtitleTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00:00.000';
  const total = Math.floor(seconds * 1000);
  const ms = total % 1000;
  const s = Math.floor(total / 1000) % 60;
  const m = Math.floor(total / 60000) % 60;
  const h = Math.floor(total / 3600000);
  const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

const TIME_LINE_RE = /(\d{1,2}:)?\d{1,2}:\d{1,2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{1,2}[.,]\d{1,3}/;

/**
 * 解析字幕文本内容
 */
export function parseSubtitle(text: string, format?: 'srt' | 'vtt'): SubtitleParseResult {
  // 统一换行
  const normalized = text.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
  const isVtt = format === 'vtt' || /^WEBVTT/.test(normalized);
  const actualFormat: 'srt' | 'vtt' = isVtt ? 'vtt' : 'srt';

  const lines = normalized.split('\n');
  const cues: SubtitleCue[] = [];
  let header: string | undefined;

  let i = 0;

  // VTT 头部
  if (isVtt) {
    const headerLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      headerLines.push(lines[i]);
      i++;
    }
    header = headerLines.join('\n');
    // 跳过空行
    while (i < lines.length && lines[i].trim() === '') i++;
  }

  while (i < lines.length) {
    // 跳过空行
    while (i < lines.length && lines[i].trim() === '') i++;
    if (i >= lines.length) break;

    let id: string | undefined;
    let timeLine: string | null = null;

    // 当前行可能是 id 也可能是时间行
    if (TIME_LINE_RE.test(lines[i])) {
      timeLine = lines[i];
      i++;
    } else {
      // 当前行视为 id，下一行应为时间行
      id = lines[i].trim() || undefined;
      i++;
      if (i < lines.length && TIME_LINE_RE.test(lines[i])) {
        timeLine = lines[i];
        i++;
      } else {
        // 非有效 cue 块，跳过
        continue;
      }
    }

    if (!timeLine) continue;

    const match = timeLine.match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);
    if (!match) continue;
    const start = parseTimestamp(match[1]);
    const end = parseTimestamp(match[2]);

    // 文本可能有多行，直到空行或结束
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      textLines.push(lines[i]);
      i++;
    }

    cues.push({
      id,
      start,
      end,
      text: textLines.join('\n'),
    });
  }

  return {
    format: actualFormat,
    cues,
    header,
  };
}
