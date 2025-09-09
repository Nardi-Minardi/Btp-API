import { Controller, Inject, NotFoundException, Param } from '@nestjs/common';
import { Get, Query, HttpCode } from '@nestjs/common';
import { WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  NotarisPenggantiDto,
  ResponseNotarisPenggantiDto,
} from './dto/notaris-pengganti.dto';
import { DataMasterService } from './data-master.service';
import { DataMasterRepository } from './data-master.repository';
import { KbliDto } from './dto/kbli.dto';

@Controller('/data-master')
export class DataMasterController {
  constructor(
    private dataMasterService: DataMasterService,
    private dataMasterRepository: DataMasterRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, // perbaikan
  ) {}

  @Get('/notaris-pengganti/search')
  @HttpCode(200)
  async getNotarisPengganti(
    @Query('nama') nama: string,
  ): Promise<WebResponse<ResponseNotarisPenggantiDto>> {
    const result = await this.dataMasterService.searchNotarisPengganti({
      nama: nama?.trim() || '',
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: result,
    };
  }

  @Get('/notaris-pengganti/:idNotarisPengganti')
  @HttpCode(200)
  async getNotarisPenggantiDetail(
    @Param('idNotarisPengganti') idNotarisPengganti: string,
  ): Promise<WebResponse<NotarisPenggantiDto>> {
    const result = await this.dataMasterRepository.findNotarisPenggantiById(
      Number(idNotarisPengganti),
    );

    if (!result) {
      throw new NotFoundException(
        `Notaris Pengganti with id ${idNotarisPengganti} not found`,
      );
    }

    const formattedResult: NotarisPenggantiDto = {
      id: result.id,
      nama: result.nama,
      provinsi: result.provinsi,
      idProvinsi: result.id_provinsi,
    };

    return {
      statusCode: 200,
      message: 'Success',
      data: formattedResult,
    };
  }

  @Get('/kbli/:idKbli')
  @HttpCode(200)
  async detailKbli(
    @Param('idKbli') idKbli: string,
  ): Promise<WebResponse<KbliDto>> {
    const rawResult = await this.dataMasterRepository.findKbliById(
      Number(idKbli),
    );

    if (!rawResult) {
      throw new NotFoundException(`KBLI with id ${idKbli} not found`);
    }

    const result: KbliDto = {
      idKbli: rawResult.id_kbli,
      kode: rawResult.kode,
      kategori: rawResult.kategori,
      judul: rawResult.judul,
      uraian: rawResult.uraian,
      tahun: rawResult.tahun,
      status: rawResult.status,
    };

    return {
      statusCode: 200,
      message: 'Success',
      data: result,
    };
  }
}
