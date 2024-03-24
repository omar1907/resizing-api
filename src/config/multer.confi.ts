import { extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

// Multer upload options
export const multerOptions = {
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|amv|webm|mkv|flv|gif)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new BadRequestException(
          `Unsupported file type ${extname(file.originalname)}`,
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: diskStorage({
    destination: './public',
    filename: (req, file, cb) => {
      const ext = file.mimetype.split('/')[1];
      cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
    },
  }),
};
