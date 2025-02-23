import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockLayoutService, mockLayoutServiceConstructorSpy } = await vi.hoisted(
  async () => {
    const layoutServiceMockModule = await import(
      '../__mocks__/layout-service.mock.js'
    );

    const mockLayoutService =
      new layoutServiceMockModule.LayoutServiceMockImpl();

    return {
      mockLayoutService,
      mockLayoutServiceConstructorSpy: vi.fn(),
    };
  }
);

vi.mock('../layout.service.js', async () => {
  class MyLayoutService {
    constructor(...args: any) {
      mockLayoutServiceConstructorSpy(...args);
      return mockLayoutService;
    }
  }

  return {
    LayoutServiceImpl: MyLayoutService,
  };
});

vi.mock('electron', async () => {
  return {
    app: {
      getPath: vi.fn().mockReturnValue('userData'),
    },
  };
});

vi.mock('../../logger/logger.factory.ts');

describe('layout-instance', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('is a layout service', async () => {
    const Layouts = (await import('../layout.instance.js')).Layouts;
    expect(Layouts).toBe(mockLayoutService);
    expect(mockLayoutServiceConstructorSpy).toHaveBeenCalledWith({
      baseDir: 'userData/layouts',
    });
  });
});
