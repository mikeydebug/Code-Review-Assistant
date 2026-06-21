import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DatabaseService } from '../database/database.service';

const execAsync = promisify(exec);

const SKIP_PATTERNS = ['node_modules/', '.git/', '__pycache__/', '.DS_Store', '.next/', 'dist/', 'build/'];
const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h', '.cs', '.rb', '.php',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.ini',
  '.md', '.txt', '.sql', '.sh', '.bash', '.zsh',
  '.env.example', '.gitignore', '.dockerignore', 'Dockerfile',
];
const MAX_FILE_SIZE = 100_000; // 100KB per file

@Injectable()
export class FilesService {
  constructor(private db: DatabaseService) {}

  async processZip(projectId: string, buffer: Buffer) {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const results: any[] = [];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      if (SKIP_PATTERNS.some((p) => entry.entryName.includes(p))) continue;

      const ext = path.extname(entry.entryName).toLowerCase();
      const basename = path.basename(entry.entryName);
      if (!CODE_EXTENSIONS.includes(ext) && !CODE_EXTENSIONS.includes(basename)) continue;

      const content = entry.getData().toString('utf8');
      if (content.length > MAX_FILE_SIZE) continue;

      const file = await this.db.file.upsert({
        where: { projectId_path: { projectId, path: entry.entryName } },
        update: { content, size: content.length },
        create: {
          name: basename,
          path: entry.entryName,
          content,
          language: this.detectLanguage(ext || basename),
          size: content.length,
          projectId,
        },
      });
      results.push(file);
    }

    return results;
  }

  async processFiles(projectId: string, files: Express.Multer.File[]) {
    const results: any[] = [];
    for (const file of files) {
      const content = file.buffer.toString('utf8');
      const ext = path.extname(file.originalname).toLowerCase();

      const saved = await this.db.file.upsert({
        where: { projectId_path: { projectId, path: file.originalname } },
        update: { content, size: content.length },
        create: {
          name: path.basename(file.originalname),
          path: file.originalname,
          content,
          language: this.detectLanguage(ext),
          size: content.length,
          projectId,
        },
      });
      results.push(saved);
    }
    return results;
  }

  async processGithub(projectId: string, url: string) {
    if (!url.startsWith('https://github.com/')) {
      throw new BadRequestException('Only https://github.com/ URLs are supported');
    }

    const tempDir = path.join(os.tmpdir(), `project_${projectId}_${Date.now()}`);
    try {
      await execAsync(`git clone --depth 1 ${url} ${tempDir}`);
    } catch (e) {
      throw new BadRequestException('Failed to clone repository. Is it public?');
    }
    
    const getFiles = async (dir: string): Promise<string[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(entries.map((entry) => {
        const res = path.join(dir, entry.name);
        return entry.isDirectory() ? getFiles(res) : [res];
      }));
      return Array.prototype.concat(...files);
    };
    
    const allFiles = await getFiles(tempDir);
    const results: any[] = [];
    
    for (const filePath of allFiles) {
      const relPath = path.relative(tempDir, filePath).replace(/\\/g, '/');
      if (SKIP_PATTERNS.some(p => relPath.includes(p))) continue;
      
      const ext = path.extname(relPath).toLowerCase();
      const basename = path.basename(relPath);
      if (!CODE_EXTENSIONS.includes(ext) && !CODE_EXTENSIONS.includes(basename)) continue;
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (content.length > MAX_FILE_SIZE) continue;
        
        const file = await this.db.file.upsert({
          where: { projectId_path: { projectId, path: relPath } },
          update: { content, size: content.length },
          create: {
            name: basename,
            path: relPath,
            content,
            language: this.detectLanguage(ext || basename),
            size: content.length,
            projectId,
          },
        });
        results.push(file);
      } catch (err) {
        // Skip files that can't be read as utf8 (e.g. binary)
      }
    }
    
    // cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
    return results;
  }

  async getFileTree(projectId: string, userId: string) {
    await this.verifyProjectOwner(projectId, userId);
    const files = await this.db.file.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
      select: { id: true, name: true, path: true, language: true, size: true },
    });

    const tree = this.buildTree(files);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    return { tree, totalFiles: files.length, totalSize };
  }

  async getFileById(fileId: string, userId: string) {
    const file = await this.db.file.findUnique({
      where: { id: fileId },
      include: { project: { select: { userId: true } } },
    });
    if (!file || file.project.userId !== userId) throw new NotFoundException('File not found');
    return file;
  }

  buildTree(files: { id: string; name: string; path: string; language: string; size: number }[]) {
    const root: any[] = [];

    for (const file of files) {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        let dir = current.find((n: any) => n.name === part && n.type === 'directory');
        if (!dir) {
          dir = { name: part, type: 'directory', path: parts.slice(0, i + 1).join('/'), children: [] };
          current.push(dir);
        }
        current = dir.children;
      }

      current.push({
        id: file.id,
        name: file.name,
        type: 'file',
        path: file.path,
        language: file.language,
        size: file.size,
      });
    }

    return root;
  }

  private detectLanguage(extOrName: string): string {
    const map: Record<string, string> = {
      '.ts': 'typescript', '.tsx': 'typescript',
      '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
      '.py': 'python', '.java': 'java', '.go': 'go',
      '.rs': 'rust', '.cpp': 'cpp', '.c': 'c', '.h': 'c',
      '.cs': 'csharp', '.rb': 'ruby', '.php': 'php',
      '.html': 'html', '.css': 'css', '.scss': 'scss',
      '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
      '.toml': 'toml', '.md': 'markdown', '.sql': 'sql',
      '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
      'Dockerfile': 'dockerfile',
    };
    return map[extOrName] || 'plaintext';
  }

  private async verifyProjectOwner(projectId: string, userId: string) {
    const project = await this.db.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
