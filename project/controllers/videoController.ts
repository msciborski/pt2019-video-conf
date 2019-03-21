import * as fs from "fs";
import * as path from "path";
import { Request, Response } from "express";

export class VideoController {
  private filePath: 'video/video.mp4';
  private stats;
  private fileSize;

  constructor() {
    this.stats = fs.statSync(this.filePath);
    this.fileSize = this.stats.size;
  }

  public getVideoChunk = (req: Request, res: Response) => {
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : this.fileSize - 1;

      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(this.filePath, { start, end });

      const heads = {
        'Content-Range': `bytes ${start}-${end}/${this.fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video-mp4',
      };

      res.writeHead(206, heads)
      file.pipe(res);
    } else {
      const heads = {
        'Content-Length': this.fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, heads);
      fs.createReadStream(this.filePath).pipe(res);
    }
  }
}