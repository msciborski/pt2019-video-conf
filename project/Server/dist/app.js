"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path_1 = require("path");
class App {
    constructor() {
        this.app = express();
        this.config();
        this.configMorgan();
    }
    config() {
        // parsing body of request
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        //CORS
        this.app.use(cors());
        this.servingReactFile();
    }
    servingReactFile() {
        const reactBuildFilesPath = path_1.join(__dirname, '../..', 'Client/build');
        console.log(reactBuildFilesPath);
        this.app.use(express.static(reactBuildFilesPath));
        this.app.get('*', (request, response) => {
            response.sendFile(path_1.join(reactBuildFilesPath, 'index.html'));
        });
    }
    configMorgan() {
        // Logg error
        this.app.use(morgan('dev', {
            skip: (req, res) => res.status < 400,
            stream: process.stderr,
        }));
        // Logg success
        this.app.use(morgan('dev', {
            skip: (req, res) => res.status >= 400,
            stream: process.stdout,
        }));
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map