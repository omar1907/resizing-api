import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import { multerOptions } from 'src/config/multer.confi';

@Controller('/api/v1')
export class ImageController {
  @Post('image/resize')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
    @Body() body,
    @Res() response,
  ) {
    console.log('image', image);
    let { width, height } = body;
    // console.log(typeof parseInt(width));
    width = parseInt(width);
    height = parseInt(height);
    // const base64 = fs.readFileSync(image.path);

    try {
      const buffer = await fs.promises.readFile(image.path);
      console.log(buffer);

      await sharp(buffer)
        .resize({
          width: width,
          height: height,
        })
        .toFormat('jpeg')
        .toFile(`public/resizedImages/${image.filename}`);
      const link = `${process.env.HOST_URL}public/resizedImages/${image.filename}`;
      response.json({ link });
    } catch (error) {
      console.log(error);
    }
  }

  @Post('video/resize')
  @UseInterceptors(FileInterceptor('video', multerOptions))
  async resizeVide(
    @UploadedFile() video: Express.Multer.File,
    @Body() body,
    @Res() response,
  ) {
    console.log("video", video);
    
    const { width, height } = body;
    const inputPath = `public/${video.filename}`;
    console.log(inputPath);
    const outputPath = `public/resizedVideos/${video.filename}`; // Example output path
    console.log(outputPath);
    ffmpeg.setFfmpegPath(ffmpegStatic);

    await new Promise<void>((resolve, reject) => {
      ffmpeg.setFfmpegPath(ffmpegStatic);
      ffmpeg()
        .input(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .size(`${width}x${height}`)
        .on('error', (err) => {
          console.log('Error:', err.message);
          reject(err);
        })
        .on('progress', (progress) => {
          console.log('Progress:', progress.frames);
        })
        .on('end', () => {
          console.log('Video compression complete!');
          resolve();
        })
        .run();
    });
    const link = `${process.env.HOST_URL}${outputPath}`;
    console.log(link);
    response.json({ link });
  }

  @Get('test')
  sayHello(@Res() res){
    res.json({Message:" Hello From Resizing-Api"})
  }
  
}
