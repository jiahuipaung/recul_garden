import dayjs from 'dayjs';

// 文章类型定义
export interface PostData {
  id: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  content: string;
}

// 解析markdown文件的front matter
function parseFrontMatter(markdown: string): { data: any; content: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: markdown };
  }

  const frontMatter = match[1];
  const content = match[2];

  // 解析front matter
  const data: any = {};
  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      // 移除引号
      data[key.trim()] = value.replace(/^"(.*)"$/, '$1');
    }
  });

  return { data, content: content.trim() };
}

// 获取所有文章数据
export async function getAllPosts(): Promise<PostData[]> {
  try {
    // 从/posts.json获取文章列表
    const response = await fetch('/posts.json');
    if (!response.ok) {
      console.error('Failed to fetch posts.json:', response.status, response.statusText);
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }
    const fileNames = await response.json();
    console.log('Fetched posts.json:', fileNames);
    
    // 获取所有文章详情
    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName: string) => fileName.endsWith('.md'))
        .map(async (fileName: string) => {
          try {
            // 移除 ".md" 获取文件ID
            const id = fileName.replace(/\.md$/, '');

            // 读取markdown文件内容
            const response = await fetch(`/posts/${fileName}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch post: ${fileName} (${response.status} ${response.statusText})`);
            }
            const fileContents = await response.text();
            console.log(`Fetched post ${fileName} successfully`);

            // 解析markdown文件的front matter
            const { data, content } = parseFrontMatter(fileContents);

            const date = data.date;
            const formattedDate = dayjs(date).format('YYYY年MM月DD日');

            // 合并数据
            return {
              id,
              title: data.title,
              date,
              formattedDate,
              excerpt: data.excerpt || '',
              content
            };
          } catch (error) {
            console.error(`Error processing post ${fileName}:`, error);
            throw error;
          }
        })
    );

    // 按日期排序
    return allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// 获取所有文章的ID
export async function getAllPostIds() {
  try {
    const response = await fetch('/posts.json');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const fileNames = await response.json();
    
    return fileNames
      .filter((fileName: string) => fileName.endsWith('.md'))
      .map((fileName: string) => {
        return {
          params: {
            id: fileName.replace(/\.md$/, '')
          }
        };
      });
  } catch (error) {
    console.error('Error fetching post IDs:', error);
    return [];
  }
}

// 根据ID获取文章数据
export async function getPostData(id: string): Promise<PostData> {
  try {
    const response = await fetch(`/posts/${id}.md`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${id}`);
    }
    const fileContents = await response.text();

    // 解析markdown文件的front matter
    const { data, content } = parseFrontMatter(fileContents);
    
    const date = data.date;
    const formattedDate = dayjs(date).format('YYYY年MM月DD日');

    // 合并数据
    return {
      id,
      title: data.title,
      date,
      formattedDate,
      excerpt: data.excerpt || '',
      content
    };
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
}

// 按年份归档文章
export async function getPostsByYear(): Promise<Record<string, PostData[]>> {
  const posts = await getAllPosts();
  const postsByYear: Record<string, PostData[]> = {};

  posts.forEach(post => {
    const year = dayjs(post.date).format('YYYY');
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  return postsByYear;
} 