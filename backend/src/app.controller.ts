import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Default route
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ✅ IMAGE UPLOAD API
  @Post('upload-image')
  uploadImage(@Req() req: any) {
    const chunks: any[] = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);

      const filename = `image-${Date.now()}.jpg`;

      // make sure uploads folder exists
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
      }

      fs.writeFileSync(`uploads/${filename}`, buffer);

      console.log('✅ Image saved:', filename);
    });

    return { message: 'Image received successfully' };
  }
}