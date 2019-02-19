import getModuleFromPath from '../../helpers/getModuleFromPath';
import generateConfig from '../../helpers/runSyncModules';
import interopRequireDefault from '../../helpers/interopRequireDefault';

jest.mock('../../helpers/getModuleFromPath');
getModuleFromPath.mockImplementation((path, options) => () => ({ path, options }));

describe('runSyncModules', () => {
  const config = {
    sync: { hooks: ['module1', 'module2', 'module3'] },
  };
  const moduleConfig = {
    projectRoot: process.cwd(),
    requireInteropWrapper: interopRequireDefault,
  };

  it('should trigger each sync config module function once', () => {
    const { hooks } = config.sync;
    expect(getModuleFromPath).toHaveBeenCalledTimes(0);

    return generateConfig(config).then((value) => {
      hooks.forEach((hook) => {
        expect(getModuleFromPath).toHaveBeenCalledWith(
          hook,
          moduleConfig,
        );
      });

      expect(getModuleFromPath).toHaveBeenCalledTimes(3);
      expect(value).toBeUndefined();
    });
  });
});
