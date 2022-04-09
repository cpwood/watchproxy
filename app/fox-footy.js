import { Key, until, By } from 'selenium-webdriver';
import axios from 'axios';

export class FoxFooty {
    getUrl = async (driver, configService) => {        
        let element = null;
        let html = null;
        const config = await configService.get('fox-footy');

        if (!config.authorizationHeader || !config.deviceId) {
            await driver.get('https://www.watchafl.com.au/login?return=/fox-footy');

            element = await driver.findElement(By.css('input[name=username]'));
            await element.sendKeys(config.username);

            element = await driver.findElement(By.css('input[name=password]'));
            await element.sendKeys(config.password, Key.ENTER);

            await driver.wait(until.titleContains("FOX FOOTY"), 4000);

            config.authorizationHeader = await driver.executeScript('return JSON.parse(localStorage.auth).value');        
            config.deviceId = await driver.executeScript('return JSON.parse(localStorage.hawkBrowserViewerId).value.uuid');
            html = await driver.executeScript('return JSON.stringify(window.fisoBoot[\'hawkwidgets-live-video\']);');

            await configService.set('fox-footy', config);
        }
        else {
            const response = await axios.get('https://www.watchafl.com.au/fox-footy');
            html = response.data;
        }

        // https://vmndmdl.foxsports.com.au/api/web/asset/7099/play
        let url = /https\:\/\/[^\/]+\/api\/web\/asset\/[0-9]+\/play/gm.exec(html)[0];
        //console.log(url);

        const streamInfo = await axios.post(url, {
            playRequest: {
                authorize: {
                    device: {
                        udid: config.deviceId,
                        label: 'Chrome Mac OS 10.15.7'
                    }
                }
            }
        },
        {
            headers: {
                'Authorization': config.authorizationHeader
            }
        });

        const streamUrl = streamInfo.data.playback.items.item.url;
        console.log(streamUrl);

        return streamUrl;
    };
}