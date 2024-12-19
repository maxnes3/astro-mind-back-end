import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/auth.dto';
import { SignInDto } from './dto/auth.dto';
import { Response, Request } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 200, description: 'User successfully signed up.' })
  @ApiResponse({ status: 400, description: 'Invalid signup data.' })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...response } = await this.authService.signUp(dto);
    this.authService.injectRefreshToken(res, refreshToken);
    return response;
  }

  @HttpCode(200)
  @Post('signin')
  @ApiOperation({ summary: 'User signin' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'User successfully signed in.' })
  @ApiResponse({ status: 400, description: 'Invalid signin data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...response } = await this.authService.signIn(dto);
    this.authService.injectRefreshToken(res, refreshToken);
    return response;
  }

  @HttpCode(200)
  @Post('signin/access-token')
  @ApiOperation({ summary: 'Get new access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const cookieRefreshToken = req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!cookieRefreshToken) {
      this.authService.removeRefreshToken(res);
      throw new UnauthorizedException('Refresh token not passed');
    }

    const { refreshToken, ...response } =
      await this.authService.getFreshTokens(cookieRefreshToken);

    return response;
  }

  @HttpCode(200)
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshToken(res);
    return true;
  }
}
