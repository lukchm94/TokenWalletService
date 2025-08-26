import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../../src/modules/health/interfaces/controllers/health.controller';
import { PrismaService } from '../../../../src/shared/database/prisma.service';
import { AppLoggerService } from '../../../../src/shared/logger/app-logger.service';

/**
 * Unit tests for the HealthController.
 * This test suite uses NestJS's testing module to create a mock environment,
 * allowing us to isolate and test the controller's methods.
 */
describe('HealthController', () => {
  let controller: HealthController;
  let mockPrismaService: PrismaService;

  beforeEach(async () => {
    // We create a mock version of the PrismaService.
    // The health check method queries `$queryRaw` so we need to mock that.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockPrismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    } as any; // Using `as any` to simplify mocking for testing purposes

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      // We provide mock implementations for the services the controller depends on.
      // This is the core principle of dependency injection in testing.
      providers: [
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  /**
   * Test the `checkDb` method. We will mock the Prisma query to simulate
   * a successful database connection and verify the controller returns a 200 OK status.
   */
  describe('checkDb', () => {
    it('should return status OK on successful database connection', async () => {
      // Act
      const result = await controller.checkDb();

      // Assert
      // We expect the result to have a specific shape and a success message.
      expect(result).toEqual({
        db: 'ok',
        message: 'DB connection ok',
      });

      // We verify that the Prisma query function was called.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
    });

    /**
     * Test a failure scenario where the database connection fails.
     * We will mock the Prisma query to throw an error and verify the controller
     * handles it gracefully, returning a 500 Internal Server Error.
     */
    it('should handle a failed database connection gracefully', async () => {
      // Arrange - Make the mock function reject with an error
      mockPrismaService.$queryRaw = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      // Act
      const result = await controller.checkDb();

      // Assert
      // The controller handles the error and returns a resolved object.
      expect(result.db).toEqual('error');
      expect(result.message).toEqual('Connection failed');
    });
  });

  /**
   * Test the `healthCheck` method. This is a simple test that checks if the
   * method returns the expected status string.
   */
  describe('healthCheck', () => {
    it('should return a "healthy" status', () => {
      // Act
      const result = controller.checkHealth();

      // Assert
      expect(result).toEqual({
        status: 'ok',
      });
    });
  });
});
