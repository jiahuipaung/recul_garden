import { FileNode } from '../types/file';

export const parseFileTree = async (_: string): Promise<FileNode[]> => {
  try {
    // 使用import.meta.glob获取所有markdown文件
    const modules = import.meta.glob('/public/docs/database/**/*.md', { 
      eager: true,
      as: 'raw'
    });

    // 将文件路径转换为树形结构
    const tree: FileNode[] = [];
    const paths = Object.keys(modules);

    paths.forEach(path => {
      // 移除'/public/docs/database/'前缀
      const relativePath = path.replace('/public/docs/database/', '');
      const parts = relativePath.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');
        const existingNode = current.find(node => node.name === part);

        if (existingNode) {
          if (!isLast) {
            current = existingNode.children || [];
          }
        } else {
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'directory',
            children: isLast ? undefined : [],
            isExpanded: false
          };

          current.push(newNode);
          if (!isLast && newNode.children) {
            current = newNode.children;
          }
        }
      });
    });

    return tree;
  } catch (error) {
    console.error('Error parsing file tree:', error);
    return [];
  }
};

export const loadFileContent = async (filePath: string): Promise<string> => {
  try {
    // 使用import.meta.glob加载文件内容
    const modules = import.meta.glob('/public/docs/database/**/*.md', { 
      eager: true,
      as: 'raw'
    });
    
    // 构建完整的文件路径
    const fullPath = `/public/docs/database/${filePath}`;
    
    // 获取文件内容
    const content = modules[fullPath] as string;
    if (!content) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    return content;
  } catch (error) {
    console.error('Error loading file content:', error);
    return '';
  }
}; 