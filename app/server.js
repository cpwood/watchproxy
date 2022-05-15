'use strict';

import express from 'express';
import StringBuilder from 'node-stringbuilder';
import { ConfigService } from './config-service.js';
import { WatchClient } from './watch-client.js';

const configService = new ConfigService(process.env.CONFIG_FILE ?? './config/config.json');
const watchClient = new WatchClient();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.get('/index.m3u8', async (req, res) => {
    const config = await configService.load();
    const output = new StringBuilder();

    output.appendLine('#EXTM3U');
    output.appendLine();

    if (configService.validate(config, 'footy')) {
        output.appendLine(`#EXTINF:-1 tvg-id="${config.footy.channelId ?? '53212'}" tvg-logo="https://raw.githubusercontent.com/cpwood/watchproxy/main/logos/footy.png",FOX Footy`);
        output.appendLine('/fox-footy/master.m3u8');
        output.appendLine('');
    }

    if (configService.validate(config, 'league')) {
        output.appendLine(`#EXTINF:-1 tvg-id="${config.league.channelId ?? '53210'}" tvg-logo="https://raw.githubusercontent.com/cpwood/watchproxy/main/logos/league.png",FOX League`);
        output.appendLine('/fox-league/master.m3u8');
        output.appendLine('');
    }

    res.setHeader('Content-Type', 'application/x-mpegURL');
    res.setHeader('Content-Disposition', 'attachment; filename="index.m3u8"');
    res.send(output.toString());
});

app.get('/fox-footy/master.m3u8', async (req, res) => {
    const config = await configService.load();

    if (!configService.validate(config, 'footy'))
        res.status(401);

    const start = performance.now();
    const result = await watchClient.getUrl('https://www.watchafl.com.au/fox-footy', config.footy);
    const end = performance.now();

    console.log(`Stream loading for FOX Footy took ${end - start} milliseconds`);
    console.log();

    res.redirect(result);
});

app.get('/fox-league/master.m3u8', async (req, res) => {
    const config = await configService.load();

    if (!configService.validate(config, 'league'))
        res.status(401);

    const start = performance.now();
    const result = await watchClient.getUrl('https://www.watchnrl.com/fox-league', config.league);
    const end = performance.now();
    
    console.log(`Stream loading for FOX League took ${end - start} milliseconds`);
    console.log();

    res.redirect(result);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
