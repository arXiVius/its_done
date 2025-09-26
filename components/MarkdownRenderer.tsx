import React from 'react';

const parseMarkdownToHTML = (text: string): string => {
  if (!text) return '';

  const blocks = text.split(/\n\s*\n/); // Split by one or more empty lines

  return blocks.map(block => {
    // Basic HTML escaping
    const escapedBlock = block
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    const formatInline = (str: string) => str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Check for tables
    if (escapedBlock.includes('|') && escapedBlock.includes('---')) {
        const lines = escapedBlock.trim().split('\n');
        const headerLine = lines[0];
        const separatorLine = lines[1];
        
        if (separatorLine && separatorLine.includes('---')) {
            try {
                const headers = headerLine.split('|').map(h => h.trim()).slice(1, -1);
                const rows = lines.slice(2).map(rowLine => rowLine.split('|').map(c => c.trim()).slice(1, -1));

                const thead = `<thead><tr class="border-b-2" style="border-color: var(--text-color);">${headers.map(h => `<th class="p-2 text-left font-bold">${formatInline(h)}</th>`).join('')}</tr></thead>`;
                const tbody = `<tbody>${rows.map(row => `<tr class="border-b" style="border-color: var(--text-color); opacity: 0.8;">${row.map(cell => `<td class="p-2">${formatInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;

                return `<div class="overflow-x-auto my-2 border-2 rounded-md" style="border-color: var(--text-color);"><table class="w-full text-sm">${thead}${tbody}</table></div>`;
            } catch (e) {
                // Fallback to paragraph if table parsing fails
            }
        }
    }

    // Check for lists
    if (escapedBlock.trim().startsWith('* ')) {
      const listItems = escapedBlock.split('\n')
        .map(item => item.trim() ? `<li>${formatInline(item.replace(/^\s*\*\s/, ''))}</li>` : '')
        .join('');
      return `<ul class="list-disc list-inside my-2 pl-2">${listItems}</ul>`;
    }

    // Otherwise, it's a paragraph. Replace single newlines with <br> for line breaks within a paragraph.
    return `<p>${formatInline(escapedBlock.replace(/\n/g, '<br/>'))}</p>`;
  }).join('');
};

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const markup = { __html: parseMarkdownToHTML(content) };
  // The wrapper div's class will be inherited for text color.
  // The generated HTML uses Tailwind classes for basic list styling.
  return <div dangerouslySetInnerHTML={markup} />;
};

export default MarkdownRenderer;