import fs from 'fs/promises';

export class ConfigService {
    _config = null;
    _configFile = './config/config.json';
    
    get = async (name) => {
        if (!this._config) {
            this._config = JSON.parse(await fs.readFile(this._configFile));
        }

        return this._config[name];
    };

    set = async (name, value) => {
        this._config[name] = value;
        await fs.writeFile(this._configFile, JSON.stringify(this._config));
    };
}