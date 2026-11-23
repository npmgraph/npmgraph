import { describe, expect, it } from 'vitest';
import Module from './Module.ts';
import { getRepoUrlForModule } from './repo-util.ts';

describe('getRepoUrlForModule', () => {
  it('should extract GitHub URL from repository.url field', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://github.com/facebook/react.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/facebook/react');
  });

  it('should handle repository as string', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: 'github:user/repo',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should extract GitHub URL from homepage field when repository is missing', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      homepage: 'https://github.com/user/repo',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should handle bugs.url with /issues suffix', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      bugs: {
        url: 'https://github.com/user/repo/issues',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should prioritize repository over homepage', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://github.com/real/repo.git',
      },
      homepage: 'https://github.com/other/repo',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/real/repo');
  });

  it('should return undefined for non-repo homepage', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      homepage: 'https://example.com',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe(undefined);
  });

  it('should handle GitLab repositories', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://gitlab.com/user/repo.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://gitlab.com/user/repo');
  });

  it('should handle SSH format URLs', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'git@github.com:user/repo.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should handle http GitHub repository URLs with .git suffix', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://github.com/drewyoung1/armyjs.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/drewyoung1/armyjs');
  });

  it('should handle https GitHub repository URLs with .git suffix', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://github.com/uuidjs/uuid.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/uuidjs/uuid');
  });

  it('should handle Bitbucket repositories', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://bitbucket.org/user/repo.git',
      },
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://bitbucket.org/user/repo');
  });

  it('should strip /pulls suffix from URLs', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      homepage: 'https://github.com/user/repo/pulls',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should strip /wiki suffix from URLs', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      homepage: 'https://github.com/user/repo/wiki',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });

  it('should return undefined when no repository info is available', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe(undefined);
  });

  it('should handle bugs as string', () => {
    const module = new Module({
      name: 'test',
      version: '1.0.0',
      bugs: 'https://github.com/user/repo/issues',
    });

    const result = getRepoUrlForModule(module);
    expect(result).toBe('https://github.com/user/repo');
  });
});
