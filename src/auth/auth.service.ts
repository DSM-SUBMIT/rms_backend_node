import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { JwtPayload } from './interfaces/jwtPayload';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/request/login.dto';
import { ChangePwDto } from './dto/request/changePw.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ id, password }: LoginDto) {
    const res = await this.validateUser(id, password);
    if (res) {
      return await this.signJwt({ sub: id, role: 'admin' });
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

  async signJwt({ sub, role }: JwtPayload) {
    const payload = { sub, role };
    return { access_token: this.jwtService.sign(payload) };
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
