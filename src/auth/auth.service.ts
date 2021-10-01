import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { JwtPayload } from './interfaces/jwtPayload';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/request/login.dto';
import { ChangePwDto } from './dto/request/changePw.dto';
import { AccessTokenDto } from './dto/response/accessToken.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ id, password }: LoginDto): Promise<AccessTokenDto> {
    const res = await this.validateUser(id, password);
    if (res) {
      const tokens = this.signJwt({ sub: id, role: 'admin' });
      await this.cacheManager.set(id, tokens.refresh_token);
      return tokens;
    }
    throw new UnauthorizedException();
  }

  async changePw(id: string, { oldPassword, newPassword }: ChangePwDto) {
    const res = await this.validateUser(id, oldPassword);
    if (res) {
      if (res && oldPassword !== newPassword) {
        await this.adminsRepository.update(id, {
          password: await this.encrypt(newPassword),
        });
        return;
      }
      throw new ConflictException();
    }
    throw new UnauthorizedException();
  }

  async refresh(token: string): Promise<AccessTokenDto> {
    const payload: {
      sub: string;
      role: string;
      iat: number;
      exp: number;
    } = await this.jwtService.verifyAsync(token);
    console.log(payload);
    const cache = await this.cacheManager.get<string>(payload.sub);
    if (cache !== token) throw new UnauthorizedException();
    const isValid = Boolean(await this.adminsRepository.findOne(payload.sub));
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
    const res = await this.adminsRepository.findOne(id);
    if (!res) return false;
    return await bcrypt.compare(password, res.password);
  }
}
