import { Request, Response } from "express";
import { VideoController } from "../controllers/videoController";

export class VideoRoutes {
  private videoController: VideoController = new VideoController();

  public routes(app) : void {
    app.route('/video')
      .get(this.videoController.getVideoChunk);
  }
}