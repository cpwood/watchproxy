import axios from 'axios';

export class WatchClient {
    getUrl = async (url, config) => {        
        const response = await axios.get(url);
        const html = response.data;

        // e.g. https://vmndmdl.foxsports.com.au/api/web/asset/7099/play
        let assetUrl = /https\:\/\/[^\/]+\/api\/web\/asset\/[0-9]+\/play/gm.exec(html)[0];

        const streamInfo = await axios.post(assetUrl, {
            playRequest: {
                authorize: {
                    device: {
                        udid: config.deviceId,
                        label: config.deviceLabel
                    }
                }
            }
        },
        {
            headers: {
                'Authorization': config.header
            }
        });

        return streamInfo.data.playback.items.item.url;
    };
}