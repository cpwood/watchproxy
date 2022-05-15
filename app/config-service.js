import fs from 'fs/promises';
import { validate as uuidValidate } from 'uuid';

export class ConfigService { 
    configFile;

    constructor(file) {
        this.configFile = file;
    }
    
    load = async (name) => {
        try {
            return JSON.parse(await fs.readFile(this.configFile));
        }
        catch(err) {
            console.error(err);
            return {
                footy: null,
                league: null
            };
        }
    };

    validate = async(config, name) => {
        try {
            const service = config[name];
            let valid = true;
            
            if (!service) {
                console.log(`No configuration for ${name}.`);
                return false;
            }

            if (!service.header) {
                valid = false;
                console.error(`No header value has been provided for ${name}.`);
            }
            else {
                let parts = service.header.split(' ');

                if (parts.length != 2) {
                    valid = false;
                    console.error(`The header value provided for ${name} is invalid. It should be in the format "Bearer UUID".`);
                }

                if (parts[0] != "Bearer") {
                    valid = false;
                    console.error(`The header value provided for ${name} is invalid. It should be in the format "Bearer UUID".`);
                }

                if (!uuidValidate(parts[1])) {
                    valid = false;
                    console.error(`The header value provided for ${name} is invalid. It should be in the format "Bearer UUID".`);
                }
            }

            if (!service.deviceId) {
                valid = false;
                console.error(`No deviceId value has been provided for ${name}.`);
            }
            else if (!uuidValidate(service.deviceId)) {
                valid = false;
                console.error(`The deviceId value provided for ${name} is invalid. It should be a UUID.`);
            }

            if (!service.deviceLabel) {
                valid = false;
                console.error(`No deviceLabel value has been provided for ${name}.`);
            }

            return valid;
        }
        catch(err) {
            console.error(err);
            return false;
        }
    };
}