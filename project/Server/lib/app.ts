import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as morgan from "morgan";
import { join } from 'path';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.configMorgan();
  }

  private config() : void {
    // parsing body of request
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));

    //CORS
    this.app.use(cors());

    this.servingReactFile();

  }
  private servingReactFile() {
    const reactBuildFilesPath = join(__dirname, '../..', 'Client/build');
    console.log(reactBuildFilesPath);
    this.app.use(express.static(reactBuildFilesPath));
    this.app.get('*', (request, response) => {
      response.sendFile(join(reactBuildFilesPath, 'index.html'));
    })
  }
  private configMorgan(): void {
    // Logg error
    this.app.use(morgan('dev', {
      skip: (req: Request, res: Response) => res.status < 400,
      stream: process.stderr,
    }));

    // Logg success
    this.app.use(morgan('dev', {
      skip: (req: Request, res: Response) => res.status >= 400,
      stream: process.stdout,
    }));

  }
}

export default new App().app;
