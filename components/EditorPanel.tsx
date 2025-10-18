import React from 'react';
import type { GeneratedEbook } from '../types';
import { Card } from './ui/Card';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Button } from './ui/Button';

interface EditorPanelProps {
  ebook: GeneratedEbook | null;
}

const createMarkdown = (ebook: GeneratedEbook): string => {
    let md = `# ${ebook.title}\n\n`;
    
    if (ebook.coverImageUrl && !ebook.coverImageUrl.startsWith('data:')) {
        md += `![Buch-Cover](${ebook.coverImageUrl})\n\n`;
    }

    if (ebook.tableOfContents.length > 0) {
        md += `## Inhaltsverzeichnis\n\n`;
        ebook.tableOfContents.forEach(item => {
            md += `- ${item.title}\n`;
        });
        md += `\n`;
    }
    
    md += ebook.content.replace(/<h1>.*<\/h1>\n?/,'').replace(/<div.*<\/div>\n?/,'').replace(/<br\s*\/?>/gi, '\n');

    if (ebook.glossary.length > 0) {
        md += `\n## Glossar\n\n`;
        ebook.glossary.forEach(item => {
            md += `**${item.term}:** ${item.definition}\n\n`;
        });
    }
    
    if (ebook.citations.length > 0) {
        md += `\n## Zitate\n\n`;
        ebook.citations.forEach(item => {
            md += `- [${item.title}](${item.uri}) - *${item.source}*\n`;
        });
        md += `\n`;
    }
    
    if (ebook.index.length > 0) {
        md += `\n## Index\n\n`;
        md += ebook.index.join(', ');
        md += `\n`;
    }

    return md;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ ebook }) => {
  const handleDownloadMd = () => {
    if (!ebook) return;
    const markdown = createMarkdown(ebook);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ebook.title.replace(/\s/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
    
  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-700 gap-2 flex-wrap">
        <h2 className="text-xl font-bold text-slate-100">eBook-Vorschau</h2>
        {ebook && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => alert('PDF-Export in Kürze verfügbar!')}>
              <DownloadIcon className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="secondary" onClick={() => alert('EPUB-Export in Kürze verfügbar!')}>
              <DownloadIcon className="w-4 h-4" />
              EPUB
            </Button>
            <Button variant="secondary" onClick={handleDownloadMd}>
              <DownloadIcon className="w-4 h-4" />
              .md
            </Button>
          </div>
        )}
      </div>
      <div className="flex-grow overflow-y-auto p-6 bg-slate-900/50">
        {ebook ? (
          <article className="prose prose-invert prose-lg max-w-none prose-h1:text-indigo-400 prose-h1:text-4xl prose-h2:text-slate-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
            <h1>{ebook.title}</h1>
            {ebook.coverImageUrl && (
              <div className="text-center my-8">
                <img src={ebook.coverImageUrl} alt="Buch-Cover" className="mx-auto rounded-lg shadow-2xl max-w-sm" />
                <p className="text-sm italic text-slate-400 mt-2">AI Cover-Prompt: "{ebook.coverPrompt}"</p>
              </div>
            )}

            {ebook.tableOfContents.length > 0 && (
              <section>
                <h2>Inhaltsverzeichnis</h2>
                <ul>
                  {ebook.tableOfContents.map((item, index) => (
                    <li key={index}>{item.title}</li>
                  ))}
                </ul>
              </section>
            )}

            <section dangerouslySetInnerHTML={{ __html: ebook.content.replace(/\n/g, '<br />') }} />

            {ebook.glossary.length > 0 && (
              <section>
                <h2>Glossar</h2>
                {ebook.glossary.map((item, index) => (
                  <p key={index}><strong>{item.term}:</strong> {item.definition}</p>
                ))}
              </section>
            )}

            {ebook.citations.length > 0 && (
                <section>
                    <h2>Zitate</h2>
                    <ul>
                    {ebook.citations.map((item, index) => (
                        <li key={index}><a href={item.uri} target="_blank" rel="noopener noreferrer">{item.title}</a> - <em>{item.source}</em></li>
                    ))}
                    </ul>
                </section>
            )}

            {ebook.index.length > 0 && (
                <section>
                    <h2>Index</h2>
                    <p className="text-sm">{ebook.index.join(', ')}</p>
                </section>
            )}

          </article>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <BookOpenIcon className="w-24 h-24 mb-4" />
            <h3 className="text-2xl font-semibold">Ihr generiertes eBook erscheint hier.</h3>
            <p className="mt-2 text-center max-w-md">Geben Sie Ihren Dokumententext ein, wählen Sie die KI-Agenten aus und beauftragen Sie das Team, um zu beginnen.</p>
          </div>
        )}
      </div>
    </Card>
  );
};