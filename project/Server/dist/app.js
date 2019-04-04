"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
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