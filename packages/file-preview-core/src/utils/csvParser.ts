/**
 * 轻量 CSV/TSV 解析器
 * 支持 RFC 4180 基础特性：
 * - 双引号字段、字段内包含分隔符
 * - 双引号转义（"" 表示字面量 "）
 * - 字段内换行（\r\n / \n）
 */

export interface CsvParseOptions {
  /** 分隔符，CSV 为 "," TSV 为 "\t"。默认根据文件名自动识别 */
  delimiter?: string;
  /** 将首行作为表头 */
  firstRowAsHeader?: boolean;
}

export interface CsvParseResult {
  /** 表头（可能为空数组） */
  header: string[];
  /** 数据行 */
  rows: string[][];
  /** 列数 */
  columnCount: number;
  /** 分隔符（实际使用的） */
  delimiter: string;
}

/**
 * 根据文件名推断分隔符
 */
export function guessCsvDelimiter(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'tsv') return '\t';
  return ',';
}

/**
 * 解析 CSV/TSV 文本
 */
export function parseCsv(text: string, options: CsvParseOptions = {}): CsvParseResult {
  const delimiter = options.delimiter ?? ',';
  const firstRowAsHeader = options.firstRowAsHeader ?? true;

  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === delimiter) {
      current.push(field);
      field = '';
      i += 1;
      continue;
    }

    if (ch === '\r') {
      // 跳过 \r\n 的 \r
      if (text[i + 1] === '\n') {
        i += 1;
      }
      current.push(field);
      rows.push(current);
      current = [];
      field = '';
      i += 1;
      continue;
    }

    if (ch === '\n') {
      current.push(field);
      rows.push(current);
      current = [];
      field = '';
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // 末尾还有未提交内容
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  // 移除末尾全部为空的空行（最后一行通常是多余的换行）
  while (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 1 && last[0] === '') {
      rows.pop();
    } else {
      break;
    }
  }

  let header: string[] = [];
  let dataRows = rows;
  if (firstRowAsHeader && rows.length > 0) {
    header = rows[0];
    dataRows = rows.slice(1);
  }

  const columnCount = Math.max(
    header.length,
    ...dataRows.map((r) => r.length),
    0
  );

  // 对齐每行列数
  for (const row of dataRows) {
    while (row.length < columnCount) row.push('');
  }

  return {
    header,
    rows: dataRows,
    columnCount,
    delimiter,
  };
}
