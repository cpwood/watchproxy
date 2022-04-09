'use strict';

import express from 'express';
import { Builder } from 'selenium-webdriver';
import { FoxFooty } from './fox-footy.js';
import { FoxLeague } from './fox-league.js';
import { Mutex } from 'async-mutex';
import { ConfigService } from './config-service.js';
import StringBuilder from 'node-stringbuilder';

const mutex = new Mutex();
const configService = new ConfigService();

let driver = null;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

const createDriver = async () => {
    if (!driver) {
        driver = await new Builder()
            .forBrowser('chrome')
            .usingServer(`http://${await configService.get('seleniumIp')}/wd/hub`)
            .build();
    }
};

const shutDown = async () => {
    const release = await mutex.acquire();

    if (driver) {
        console.log();
        console.log('Stopping Selenium driver..');
        
        await driver.quit();
        driver = null;
    }

    release();
    process.exit(0);
};

app.get('/index.m3u8', async (req, res) => {
    const output = new StringBuilder();

    output.appendLine('#EXTM3U');
    output.appendLine();

    output.appendLine('#EXTINF:-1 tvg-id="FAF" tvg-logo="https://www.foxtel.com.au/content/dam/foxtel/shared/channel/FAF/FAF_425x243.png",FOX Footy');
    output.appendLine('/fox-footy/master.m3u8');
    output.appendLine('');

    output.appendLine('#EXTINF:-1 tvg-id="SP2" tvg-logo="https://www.foxtel.com.au/content/dam/foxtel/shared/channel/SP2/SP2_425x243.png",FOX League');
    output.appendLine('/fox-league/master.m3u8');
    output.appendLine('');

    res.setHeader('Content-Type', 'application/x-mpegURL');
    res.setHeader('Content-Disposition', 'attachment; filename="index.m3u8"');
    res.send(output.toString());
});

app.get('/fox-footy/master.m3u8', async (req, res) => {
    await createDriver();

    const start = performance.now();
    const agent = new FoxFooty();
    const result = await agent.getUrl(driver, configService);

    const end = performance.now();
    console.log(`Stream loading took ${end - start} milliseconds`);
    console.log();

    res.redirect(result);
});

app.get('/fox-league/master.m3u8', async (req, res) => {
    await createDriver();

    const start = performance.now();
    const agent = new FoxLeague();
    const result = await agent.getUrl(driver, configService);

    const end = performance.now();
    console.log(`Stream loading took ${end - start} milliseconds`);
    console.log();

    res.redirect(result);
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
