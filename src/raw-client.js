const net = require('net')
const Bacon = require('baconjs')
const {commands, actions, aspectRatio, powerStatus} = require('./commands')

function RawSdcpClient(config = {}) {
	debug('Connecting to ', {port: config.port, address: config.address})
	let msgId = 0 // Mutable message id, nasty.
	const actionQueue = new Bacon.Bus()
	const responses = actionQueue.flatMapConcat(processActionQueue)

	return {
		getAction: (command, data) => {
			return addActionToQueue(actions.GET, command, data)
		},
		setAction: (command, data) => {
			return addActionToQueue(actions.SET, command, data)
		},
		responses
	}

	function processActionQueue({msg, id}) {
		debug('Process queue, next msg', msg)
		const client = new net.Socket()
		const disconnected = Bacon.fromEvent(client, 'close').take(1)
		const connected = Bacon.fromNodeCallback(client, 'connect', config.port, config.address).take(1)
		const response = Bacon.fromEvent(client, 'data')
			.flatMap(parseResponse)
			.take(1)
			.takeUntil(disconnected)

		connected.onValue(_ => {
			client.write(msg)
		})
		response.flatMapError(() => true).onValue(() => {
			client.destroy()
		})
		return response.map(value => {
			value.id = id
			return value
		})
	}

	function addActionToQueue(action, command, data) {
		const msg = createMessageAsHex(action, command, data)
		// What follows is nasty mutate!
		msgId += 1
		const currentId = msgId
		setTimeout(() => {
			debug(`Add message id ${currentId} to queue`, {action, command, data})
			actionQueue.push({msg, id: currentId})
		}, 1)
		return responses.filter(response => response.id === currentId).take(1)
	}

	function parseResponse(dataBuffer) {
		const str = dataBuffer.toString('hex').toUpperCase()
		if (str.length < 20) {
			throw new Error(`Unknown response ${str} (${data})`)
		}
		const version = str.substring(0, 2)
		const category = str.substring(2, 4)
		const community = str.substring(4, 12)
		const success = str.substring(12, 14)
		const command = str.substring(14, 18)
		const dataLength = str.substring(18, 20)
		const data = str.substring(20, 20 + parseInt(dataLength, 16) * 2)
		const result = {
			version,
			category,
			community,
			command,
			dataLength,
			data,
			error: success !== '01',
			raw: dataBuffer
		}
		if (!result.error) {
			return Bacon.once(result)
		} else {
			return Bacon.once(new Bacon.Error(result))
		}
	}

	function createMessageAsHex(action, command, data) {
		const VERSION = '02'
		const CATEGORY = '0A'
		const COMMUNITY = config.community || '534F4E59' // Default to 'SONY'
		if (typeof command !== 'string') {
			throw new Error(`Accepts command only as String (HEX) for now, was ${typeof command}`)
		}
		if (command.length !== 4) {
			throw new Error('Command must be 4 bytes long')
		}
		if (data && typeof data !== 'string') {
			throw new Error(`Accepts data only as String (HEX) for now, was ${typeof data}`)
		}
		const dataLength = ('00' + (data || '').length).substr(-2)

		return hexStringToBuffer([VERSION, CATEGORY, COMMUNITY, action, command, dataLength, data || ''].join(''))
	}

	function debug(msg, param) {
		if (config.debug) {
			console.log(`** DEBUG: ${msg}`, param)
		}
	}
}

function hexStringToBuffer(value) {
	return Buffer.from(value, 'hex')
}

module.exports = RawSdcpClient
