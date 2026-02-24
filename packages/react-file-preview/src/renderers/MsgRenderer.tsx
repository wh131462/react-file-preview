import { useState, useEffect } from 'react';
import MsgReader from '@kenjiuno/msgreader';
import type { FieldsData } from '@kenjiuno/msgreader';
import { User, Users, Paperclip, Calendar } from 'lucide-react';

interface MsgRendererProps {
  url: string;
}

function formatRecipients(recipients: FieldsData[] | undefined, type: 'to' | 'cc' | 'bcc'): string {
  if (!recipients) return '';
  return recipients
    .filter((r) => r.recipType === type)
    .map((r) => {
      const name = r.name || '';
      const email = r.smtpAddress || r.email || '';
      if (name && email && name !== email) {
        return `${name} <${email}>`;
      }
      return name || email;
    })
    .filter(Boolean)
    .join('; ');
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString();
  } catch {
    return dateStr;
  }
}

function decodeHtmlBody(fields: FieldsData): string {
  // 优先使用 bodyHtml (string 类型)
  if (fields.bodyHtml) {
    return fields.bodyHtml;
  }
  // 其次尝试 html (Uint8Array 类型)
  if (fields.html) {
    try {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(fields.html);
    } catch {
      // fallback
    }
  }
  // 最后使用纯文本，转换为简单 HTML
  if (fields.body) {
    return `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: system-ui, sans-serif;">${
      fields.body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }</pre>`;
  }
  return '<p style="color: #999;">（无邮件正文）</p>';
}

export const MsgRenderer: React.FC<MsgRendererProps> = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldsData | null>(null);

  useEffect(() => {
    const loadMsg = async () => {
      setLoading(true);
      setError(null);
      setFields(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('文件加载失败');
        }

        const arrayBuffer = await response.arrayBuffer();
        const msgReader = new MsgReader(arrayBuffer);
        const fileData = msgReader.getFileData();
        setFields(fileData);
      } catch (err) {
        console.error('MSG 解析错误:', err);
        setError('Outlook 邮件解析失败');
      } finally {
        setLoading(false);
      }
    };

    loadMsg();
  }, [url]);

  if (loading) {
    return (
      <div className="rfp-flex rfp-items-center rfp-justify-center rfp-w-full rfp-h-full">
        <div className="rfp-w-12 rfp-h-12 rfp-border-4 rfp-border-white/20 rfp-border-t-white rfp-rounded-full rfp-animate-spin" />
      </div>
    );
  }

  if (error || !fields) {
    return (
      <div className="rfp-flex rfp-items-center rfp-justify-center rfp-w-full rfp-h-full">
        <div className="rfp-text-white/70 rfp-text-center">
          <p className="rfp-text-lg">{error || '邮件解析失败'}</p>
        </div>
      </div>
    );
  }

  const toStr = formatRecipients(fields.recipients, 'to');
  const ccStr = formatRecipients(fields.recipients, 'cc');
  const bccStr = formatRecipients(fields.recipients, 'bcc');
  const senderName = fields.senderName || '';
  const senderEmail = fields.senderSmtpAddress || fields.senderEmail || '';
  const sender = senderName && senderEmail && senderName !== senderEmail
    ? `${senderName} <${senderEmail}>`
    : senderName || senderEmail;
  const date = formatDate(fields.clientSubmitTime || fields.messageDeliveryTime || fields.creationTime);
  const subject = fields.subject || '（无主题）';
  const attachments = (fields.attachments || []).filter((a) => !a.attachmentHidden);
  const bodyHtml = decodeHtmlBody(fields);

  return (
    <div className="rfp-w-full rfp-h-full rfp-overflow-auto rfp-p-4 md:rfp-p-8">
      <div className="rfp-max-w-full md:rfp-max-w-4xl rfp-mx-auto rfp-bg-white rfp-rounded-lg rfp-shadow-2xl rfp-overflow-hidden">
        {/* 邮件头部 */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '24px', background: '#f9fafb' }}>
          {/* 主题 */}
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            {subject}
          </h2>

          {/* 元信息 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
            {sender && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <User size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>发件人:</span>
                  <span style={{ color: '#111827' }}>{sender}</span>
                </div>
              </div>
            )}

            {toStr && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Users size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>收件人:</span>
                  <span style={{ color: '#111827' }}>{toStr}</span>
                </div>
              </div>
            )}

            {ccStr && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Users size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>抄送:</span>
                  <span style={{ color: '#111827' }}>{ccStr}</span>
                </div>
              </div>
            )}

            {bccStr && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Users size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>密送:</span>
                  <span style={{ color: '#111827' }}>{bccStr}</span>
                </div>
              </div>
            )}

            {date && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Calendar size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>日期:</span>
                  <span style={{ color: '#111827' }}>{date}</span>
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Paperclip size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#9ca3af' }} />
                <div>
                  <span style={{ color: '#6b7280', marginRight: '8px' }}>附件:</span>
                  <span style={{ color: '#111827' }}>
                    {attachments.map((a) => a.fileName || a.name || '未知文件').join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 邮件正文 */}
        <div
          style={{
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6',
            color: '#333',
          }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </div>
  );
};
