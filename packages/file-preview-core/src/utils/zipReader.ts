/**
 * ZIP 工具：基于 jszip 读取压缩包结构
 * 仅做 framework-agnostic 的读取与分类，渲染交由 renderer 自行处理
 */
import JSZip from 'jszip';
import { decodeUtf8 } from './textDecoder';

export interface ZipEntryInfo {
  /** 完整路径（以 / 分隔，目录带尾部 /） */
  path: string;
  /** 文件名（不含路径） */
  name: string;
  /** 所在目录路径（不含尾部 /） */
  dir: string;
  /** 是否目录 */
  isDir: boolean;
  /** 未压缩大小（字节），目录为 0 */
  size: number;
  /** 最后修改时间 */
  date?: Date;
}

export interface ZipTreeNode {
  /** 名称（不含父路径） */
  name: string;
  /** 完整路径（目录带尾部 /） */
  path: string;
  /** 是否目录 */
  isDir: boolean;
  /** 子节点（仅目录） */
  children?: ZipTreeNode[];
  /** 文件大小 */
  size: number;
}

/**
 * 从 ArrayBuffer 加载 zip
 */
export async function loadZip(buffer: ArrayBuffer): Promise<JSZip> {
  return JSZip.loadAsync(buffer);
}

/**
 * 列出所有条目（平铺）
 */
export function listZipEntries(zip: JSZip): ZipEntryInfo[] {
  const entries: ZipEntryInfo[] = [];
  zip.forEach((relativePath, file) => {
    const isDir = file.dir;
    const normalized = isDir && !relativePath.endsWith('/') ? relativePath + '/' : relativePath;
    const trimmed = isDir ? normalized.replace(/\/$/, '') : normalized;
    const lastSlash = trimmed.lastIndexOf('/');
    const name = lastSlash >= 0 ? trimmed.slice(lastSlash + 1) : trimmed;
    const dir = lastSlash >= 0 ? trimmed.slice(0, lastSlash) : '';
    // jszip 的 _data.uncompressedSize 是私有 API，使用公共类型避免断言
    const size = isDir ? 0 : (file as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
    entries.push({
      path: normalized,
      name,
      dir,
      isDir,
      size,
      date: file.date,
    });
  });
  return entries;
}

/**
 * 将平铺的条目组织为树
 */
export function buildZipTree(entries: ZipEntryInfo[]): ZipTreeNode {
  const root: ZipTreeNode = { name: '', path: '', isDir: true, children: [], size: 0 };
  const dirMap = new Map<string, ZipTreeNode>();
  dirMap.set('', root);

  const ensureDir = (dirPath: string): ZipTreeNode => {
    if (dirMap.has(dirPath)) return dirMap.get(dirPath)!;
    const parts = dirPath.split('/').filter(Boolean);
    let current = root;
    let accum = '';
    for (const part of parts) {
      accum = accum ? `${accum}/${part}` : part;
      let next = dirMap.get(accum);
      if (!next) {
        next = { name: part, path: accum + '/', isDir: true, children: [], size: 0 };
        current.children!.push(next);
        dirMap.set(accum, next);
      }
      current = next;
    }
    return current;
  };

  // 先处理文件；目录按需生成
  for (const entry of entries) {
    if (entry.isDir) {
      ensureDir(entry.path.replace(/\/$/, ''));
      continue;
    }
    const parent = ensureDir(entry.dir);
    parent.children!.push({
      name: entry.name,
      path: entry.path,
      isDir: false,
      size: entry.size,
    });
  }

  // 排序：目录在前，按名称
  const sort = (node: ZipTreeNode) => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const child of node.children) sort(child);
  };
  sort(root);
  return root;
}

/**
 * 读取某个 zip 条目为文本（强制 UTF-8 解码）
 */
export async function readZipEntryText(zip: JSZip, path: string): Promise<string> {
  const file = zip.file(path);
  if (!file) throw new Error(`ZIP entry not found: ${path}`);
  const buf = await file.async('arraybuffer');
  return decodeUtf8(buf);
}

/**
 * 读取某个 zip 条目为 Blob（用于图片/媒体/PDF 等）
 */
export async function readZipEntryBlob(zip: JSZip, path: string, mimeType?: string): Promise<Blob> {
  const file = zip.file(path);
  if (!file) throw new Error(`ZIP entry not found: ${path}`);
  const buffer = await file.async('arraybuffer');
  return new Blob([buffer], mimeType ? { type: mimeType } : undefined);
}
