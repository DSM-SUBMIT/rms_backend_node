import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwtPayload';
import { LoginDto } from './dto/request/login.dto';
import { ChangePwDto } from './dto/request/changePw.dto';
import { AccessTokenDto } from './dto/response/accessToken.dto';
import { AdminRepository } from 'src/shared/entities/admin/admin.repository';
import { iif, Observable, of, tap, throwError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login({
    id,
    password,
  }: LoginDto): Promise<Observable<AccessTokenDto | never>> {
    const isValid = await this.validateUser(id, password);
    return iif(
      () => isValid,
      of(this.signJwt({ sub: id, role: 'admin' })).pipe(
        tap((tokens) => {
          this.cacheManager.set(id, tokens.refresh_token);
        }),
      ),
      throwError(() => new UnauthorizedException()),
    );
  }

  async changePw(id: string, { oldPassword, newPassword }: ChangePwDto) {
    const res = await this.validateUser(id, oldPassword);
    if (res) {
      if (res && oldPassword !== newPassword) {
        await this.adminRepository.changePassword({
          id,
          encrypted: await this.encrypt(newPassword),
        });
        return;
      }
      throw new ConflictException();
    }
    throw new UnauthorizedException();
  }

  async refresh(token: string): Promise<AccessTokenDto> {
    interface Payload {
      sub: string;
      role: string;
      iat: number;
      exp: number;
    }

    const payload: Payload = await (async (): Promise<Payload> => {
      try {
        return await this.jwtService.verifyAsync(token);
      } catch (e) {
        throw new UnauthorizedException();
      }
    })();
    const cache = await this.cacheManager.get<string>(payload.sub);
    if (cache !== token) throw new UnauthorizedException();
    const isValid = Boolean(
      await this.adminRepository.findOne({ id: payload.sub }),
    );
    if (isValid) {
      const tokens = this.signJwt({ sub: payload.sub, role: 'admin' });
      await this.cacheManager.set(payload.sub, tokens.refresh_token);
      return tokens;
    }
    throw new UnauthorizedException();
  }

  signJwt(payload: JwtPayload): AccessTokenDto {
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async encrypt(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async validateUser(id: string, password: string): Promise<boolean> {
    const res = await this.adminRepository.findOne({
      id,
      includePassword: true,
    });
    if (!res) return false;
    return await bcrypt.compare(password, res.password);
  }
}
