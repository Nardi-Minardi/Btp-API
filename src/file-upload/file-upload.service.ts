import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import { S3Service } from 'src/common/s3.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private s3Service: S3Service,
  ) {}

  private async compressPdf(inputPath: string, outputPath: string) {
    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen \
        -dColorImageDownsampleType=/Bicubic \
        -dColorImageResolution=72 -dGrayImageResolution=72 -dMonoImageResolution=72 \
        -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

    const execAsync = promisify(exec);
    await execAsync(cmd);
  }

  async handleUpload(
    file: Express.Multer.File,
    folder: string,
    idTransaksiCv: number,
    namaLayanan: string,
    idLayanan: number,
    fileType: string,
  ) {
    // compress jika > 2 MB
    let fileBuffer: Buffer = file.buffer;
    if (file.size > 2 * 1024 * 1024) {
      const tmpInput = `/tmp/${Date.now()}-${file.originalname}`;
      const tmpOutput = `/tmp/compressed-${Date.now()}-${file.originalname}`;
      fs.writeFileSync(tmpInput, file.buffer);
      await this.compressPdf(tmpInput, tmpOutput);
      fileBuffer = fs.readFileSync(tmpOutput);
      fs.unlinkSync(tmpInput);
      fs.unlinkSync(tmpOutput);
    }

    const optKey = `${folder}/${idTransaksiCv}/`;
    const fileName = `${namaLayanan}-${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    const objectKey = await this.s3Service.uploadBuffer(
      fileBuffer,
      fileName,
      file?.mimetype,
      optKey,
    );

    return {
      id_layanan: idLayanan,
      id_jenis_bu: idTransaksiCv,
      id_transaksi: idTransaksiCv,
      original_name: file.originalname,
      file_type: fileType,
      file_size: file.size,
      mime_type: file.mimetype,
      s3_key: objectKey,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
