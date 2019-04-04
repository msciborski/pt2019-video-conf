import { createLogger, format, transports } from "winston";
import * as fs from "fs";
import * as path from "path";

class WinstonLogger {
  public logDir = 'log';
  public env: string;
  public filePath;

  constructor(env: string, fileName: string) {
    this.createDirForLog();
    this.filePath = path.join(this.logDir, fileName);
    this.env = env;
  }

  private createDirForLog(): void {
    fs.exists(this.logDir, (result) => {
      if (!result) {
        console.log(`File exist ${result}`)
        fs.mkdir(this.logDir, (err) => {
          console.log(err);
        })
      }
    })
  }

  public logger = (caller) => {
      return createLogger({
      level: this.env === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.label({ label: path.basename(caller) }),
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(
              info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
            ),
          ),
        }),
        new transports.File({
          filename: this.filePath,
          format: format.combine(
            format.printf(
              info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
            ),
          ),
        }),
      ],
    });
  }
}
export default new WinstonLogger(process.env.NODE_ENV || 'development', 'logResult.log').logger;