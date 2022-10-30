Sony SDCP / PJ Talk communication
=================================

Small NodeJS library for communicating with Sony video projectors over SDCP (also known as PJ Talk) via TCP.

Supported Sony projectors should include:
* VPL-VW515
* VPL-VW520
* VPL-VW528
* VPL-VW665
* VPL-VW315
* VPL-VW320
* VPL-VW328
* VPL-VW365
* VPL-VW260

Usage
=====

Install:
```
npm install --save sony-sdcp-com
```

Simple usage example:
```javascript
const {SdcpClient} = require('sony-sdcp-com')

const client = SdcpClient({address: '192.168.11.1', port: 53484})
client.setPower(true) // Returns Promise with power status after SET action
```

Performing custom `SET` command:
```javascript
const {SdcpClient} = require('sony-sdcp-com')

const client = SdcpClient({address: '192.168.11.1', port: 53484})
client.setAction(commands.INPUT, '0003') // Sets HDMI2 input
```

API
===

`SdcpClient(config)` Returns client object. Possible configuration options:
```javascript
{
  address,   // Projector IP address
  port,      // Projector port
  timeout,   // Timeout for waiting projector response, defaults to 5000ms
  community, // Set COMMUNITY field. Defaults to 'SONY' = 0x534F4E59
  debug      // Debug flag, set true to print debug information
}
```

`client.getPower()` Returns Promise containing power state [`ON`, `OFF`, `WARMING`, `COOLING`].

`client.setPower(<boolean> powerOn)` Turn power on or off. Returns Promise containing power state after action.

`client.getAspectRatio()` Returns Promise containing current aspect ratio setting [`NORMAL`, `V_STRETCH`, `ZOOM_1_85`, `ZOOM_2_35`, `STRETCH`, `SQUEEZE`].

`client.setAspectRatio(<string> ratio)` Set new aspect ratio from `aspectRatio`-enum. Returns Promise containing aspect ratio setting after action.

`client.getAction(<string> command, <string> data)` Perform a `GET` request with `command` and optional `data`. See [commands.js](src/commands.js) for reference.
Returns Promise of object containing raw response data as fields `version`, `category`, `community`, `command`, `dataLength`, `data`,
and boolean flag `error` as well as `raw` response in NodeJS Buffer.

`client.setAction(<string> command, <string> data)` Perform a `SET` action with `command` and optional `data`. See [commands.js](src/commands.js) for reference.
Returns Promise of object containing raw response data similar to `getAction` response.


Contribute
==========

Issues and pull requests welcome.


License
=======

MIT
