import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import { GetUserRequestDto, GetUserResponseDto } from './dto/get.user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private userRepository: UserRepository,
  ) {}

  async getUserById(request: GetUserRequestDto): Promise<GetUserResponseDto> {
    this.logger.debug('Fetching user by Id', request);
    const getRequest: GetUserRequestDto = this.validationService.validate(
      UserValidation.USER_ID,
      request,
    );

    // Get user
    const user = await this.userRepository.findById(getRequest.userId);
    if (!user) {
      this.logger.error(`User with Id ${getRequest.userId} not found`);
      throw new HttpException('User not found', 404);
    }

    return {
      id: user.id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      noTelp: user.no_telp,
      npwp: user.npwp,
      tmptLahir: user.tmpt_lahir,
      tglLahir: user.tgl_lahir,
      jnsKelamin: user.jns_kelamin,
      agama: user.agama,
      alamat: user.alamat,
      idProv: user.id_prov,
      idKab: user.id_kab,
      idKec: user.id_kec,
      idKel: user.id_kel,
      rt: user.rt,
      rw: user.rw,
      kodePos: user.kode_pos,
      nip: user.nip,
    };
  }
}
