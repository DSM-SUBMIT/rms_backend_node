import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { JwtPayload } from './interfaces/jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

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
