# WatchProxy

WatchProxy is a Docker-based M3U8 playlist generator and stream grabber for the [Watch AFL](https://www.watchafl.com.au) and [Watch NRL](https://www.watchnrl.com) streaming services. It allows you to watch the FOX League and FOX Footy channels in the IPTV or PVR client of your choice.

> A paid subscription to one or both of these services is required. You **cannot** be resident in Australia, New Zealand or the Pacific Islands to use these services.

## Setup

Setting up WatchProxy should only take a couple of minutes.

### Creating a config file

Create a `config.json` file in a folder that you will volume-map to the running container. Use the following template:

```json
{
    "footy": null,
    "league": null
}
```

### Grab authentication details

For each "Watch" service that you've subscribed to, go to the service in your web browser and ensure that you are logged in. 

Assuming you're using a Chrome-based browser, and without leaving your browser's Watch NRL/AFL tab, use one of the following keyboard shortcuts to display the Developer Tools Console Window:

* **Mac**: Command + Option + J
* **Windows / Linux**: Control + Shift + J

Then copy and paste the following command and press enter:

```js
JSON.stringify({ header: JSON.parse(localStorage.auth).value, deviceId: JSON.parse(localStorage.hawkBrowserViewerId).value.uuid, deviceLabel: JSON.parse(localStorage.hawkDeviceLabel).value })
```

Copy the output JSON (from `{` to `}` inclusive) into the config file for the appropriate service, replacing the templated `null` value. For example:

```json
{
    "footy": null,
    "league": {
        "header": "Bearer 1e56fee5-6d66-43a1-a872-eddc4b3e1488",
        "deviceId": "25733d76-d048-4dfc-a678-d2963902f92d",
        "deviceLabel": "Chrome Mac OS 10.15.7"
    }
}
```

Formatting and indentation isn't essential.

### EPG Channel IDs

By default, the playlist generator assumes you're using Matt Huisman's [Kayo Sports EPG](https://i.mjh.nz/Kayo/) and therefore uses the ID `53212` for FOX Footy and `53210` for FOX League.

If you'd prefer to use a different EPG containing Foxtel programming and need to customise the IDs, you can optionally add a `channelId` value to the config object for the `footy` or `league` settings, for example:

```json
{
    "footy": null,
    "league": {
        "channelId": "my-custom-id",
        "header": "Bearer 1e56fee5-6d66-43a1-a872-eddc4b3e1488",
        "deviceId": "25733d76-d048-4dfc-a678-d2963902f92d",
        "deviceLabel": "Chrome Mac OS 10.15.7"
    }
}
```

### Configuration issues

If WatchProxy isn't behaving as you expect, it could be down to faulty configuration. Any errors or issues identified will be output to the console.

### Running the container

The following example Docker Compose file will allow you to run the container:

```yaml
version: '3.3'
services:
  watchproxy:
    image: cpwood/watchproxy:latest
    container_name: watchproxy
    network_mode: bridge
    ports:
      - '8080:8080'
    restart: unless-stopped
    volumes:
      - ./config:/config
```

Alternatively, use the following example `docker` command:

```
docker run -p 8080:8080 -v ./config:/config cpwood/watchproxy:latest
```

## Using the running container

You can use the following URLs in your preferred IPTV or PVR client:

* **Playlist**: `http://<ip>:8080/index.m3u8`
* **FOX Footy stream**: `http://<ip>:8080/fox-footy/master.m3u8`
* **FOX League stream**: `http://<ip>:8080/fox-league/master.m3u8`

The playlist will only include the channels for which you've provided authentication details. If you try to access a live stream directly without having provided authentication details, you'll receive a 401 error.