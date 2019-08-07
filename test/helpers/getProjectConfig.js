import glob from 'glob';
import getProjectConfig from '../../src/helpers/getProjectConfig';

jest.mock('glob');

beforeEach(() => {
  glob.sync = jest.fn();
  glob.sync.mockReturnValue([
    './test/fixtures/fun-monorepo/projectA/project.json',
    './test/fixtures/fun-monorepo/projectB/project.json',
    './test/fixtures/fun-monorepo/projectC/project.json',
  ]);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('getProjectConfig', () => {
  const configWithFilePath = { projectConfigPath: '*/fixtures/fun-monorepo/*/project.json' };
  it('should return the original root config if no project path is specified', async () => {
    const dumbTest = { name: 'lol whatever' };
    expect(await getProjectConfig(dumbTest)).toMatchObject(dumbTest);
  });

  it('should return read from config files', async () => {
    const config = await getProjectConfig(configWithFilePath);
    expect(config).not.toBeUndefined();
    expect(config).not.toBeNull();
    expect(Object.keys(config.projects).length).toBe(3);
    expect(Object.keys(config.projects).sort()).toEqual(['projectA', 'projectB', 'projectC']);
    expect(config.projectConfigPath).toBe(configWithFilePath.projectConfigPath);
  });

  it('Should fail if there are project name duplicates', async () => {
    glob.sync.mockReturnValue([
      './test/fixtures/bad-monorepo/projectA/project.json',
      './test/fixtures/bad-monorepo/projectB/project.json',
      './test/fixtures/bad-monorepo/projectC/project.json',
    ]);
    getProjectConfig(configWithFilePath).catch((error) => {
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe('Found duplicate project names: duplicateName');
    });
  });
});
