import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            getFreshTokens: jest.fn(),
            removeRefreshToken: jest.fn(),
            injectRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      const dto: SignUpDto = { email: 'test@example.com', password: 'password' };
      const result = { user: { id: '1', email: 'test@example.com' }, accessToken: 'token', refreshToken: 'refreshToken' };

      jest.spyOn(authService, 'signUp').mockResolvedValue(result as any);

      expect(await authController.signUp(dto, { cookie: jest.fn() } as any)).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should throw a BadRequestException if user already exists', async () => {
      const dto: SignUpDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(authService, 'signUp').mockRejectedValue(new BadRequestException('User with this email already exists'));

      await expect(authController.signUp(dto, { cookie: jest.fn() } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const dto: SignInDto = { email: 'test@example.com', password: 'password' };
      const result = { user: { id: '1', username: 'test', email: 'test@example.com' }, accessToken: 'token', refreshToken: 'refreshToken' };

      jest.spyOn(authService, 'signIn').mockResolvedValue(result as any);

      expect(await authController.signIn(dto, { cookie: jest.fn() } as any)).toEqual(result);
      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto: SignInDto = { email: 'test@example.com', password: 'wrongpassword' };

      jest.spyOn(authService, 'signIn').mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(authController.signIn(dto, { cookie: jest.fn() } as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getFreshTokens', () => {
    it('should refresh tokens', async () => {
      const refreshToken = 'someRefreshToken';
      const req = { cookies: { refreshToken } } as any;
      const res = { cookie: jest.fn() } as any;
      const result = { user: { id: '1', username: 'test', email: 'test@example.com' }, accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' };

      jest.spyOn(authService, 'getFreshTokens').mockResolvedValue(result as any);

      expect(await authController.getFreshTokens(req, res)).toEqual(result);
      expect(authService.getFreshTokens).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw UnauthorizedException if refresh token is not passed', async () => {
      const req = { cookies: {} } as any;
      const res = { cookie: jest.fn() } as any;

      await expect(authController.getFreshTokens(req, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const res = { cookie: jest.fn() } as any;

      expect(await authController.logout(res)).toBe(true);
      expect(authService.removeRefreshToken).toHaveBeenCalledWith(res);
    });
  });
});
