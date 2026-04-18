import dayjs from 'dayjs';

export interface TOCItem {
  level: number;
  text: string;
  id: string;
}

export interface PostData {
  id: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  content: string;
  tags: string[];
  readingTime: number;
}

// 解析 markdown 文件的 front matter
function parseFrontMatter(markdown: string): { data: Record<string, string>; content: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: markdown };
  }

  const data: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim().replace(/^"(.*)"$/, '$1');
    if (key) data[key] = value;
  });

  return { data, content: match[2].trim() };
}

// 计算阅读时间（中文 400 字/分钟，英文 200 词/分钟）
function calculateReadingTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = content.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200);
  return Math.max(1, minutes);
}

// 从 markdown 内容提取目录
export function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    toc.push({ level: match[1].length, text, id });
  }
  return toc;
}

// 构建时自动发现并加载所有 markdown 文件
const modules = import.meta.glob('../content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// 一次性解析所有文章
const allPosts: PostData[] = Object.entries(modules)
  .map(([path, raw]) => {
    const fileName = path.split('/').pop()!.replace(/\.md$/, '');
    const { data, content } = parseFrontMatter(raw);
    const date = data.date || '';
    const tags = data.tags
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    return {
      id: fileName,
      title: data.title || fileName,
      date,
      formattedDate: date ? dayjs(date).format('YYYY年MM月DD日') : '',
      excerpt: data.excerpt || '',
      content,
      tags,
      readingTime: calculateReadingTime(content),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

// 收集所有标签（去重）
const allTags: string[] = [...new Set(allPosts.flatMap(p => p.tags))].sort();

// ── 导出的查询函数（全部同步） ──────────────────────────

export function getAllPosts(): PostData[] {
  return allPosts;
}

export function getPostById(id: string): PostData | undefined {
  return allPosts.find(p => p.id === id);
}

export function getPostsByYear(): Record<string, PostData[]> {
  const byYear: Record<string, PostData[]> = {};
  for (const post of allPosts) {
    const year = dayjs(post.date).format('YYYY');
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(post);
  }
  return byYear;
}

export function getAllTags(): string[] {
  return allTags;
}

export function getTagCounts(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of allPosts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getRecentPosts(limit = 5): PostData[] {
  return allPosts.slice(0, limit);
}

export function getPostsByTag(tag: string): PostData[] {
  return allPosts.filter(p => p.tags.includes(tag));
}

export function getAdjacentPosts(id: string): { prev?: PostData; next?: PostData } {
  const idx = allPosts.findIndex(p => p.id === id);
  if (idx === -1) return {};
  return {
    next: idx > 0 ? allPosts[idx - 1] : undefined,
    prev: idx < allPosts.length - 1 ? allPosts[idx + 1] : undefined,
  };
}
