const Bacon = require('baconjs')
const RawSdcpClient = require('./raw-client')
const {commands, actions, aspectRatio, powerStatus} = require('./commands')

function SdcpClient(config = {}) {
	const rawClient = RawSdcpClient(config)

	const api = {
		setPower: (powerOn) => {
			return rawClient.setAction(commands.SET_POWER, powerOn ? powerStatus.START_UP : powerStatus.STANDBY)
				.flatMap(() => {
					return rawClient.getAction(commands.GET_STATUS_POWER)
						.flatMap(result => Bacon.once(convertPowerStatusToString(result)))
				})
				.firstToPromise()
		},
		getPower: () => {
			return rawClient.getAction(commands.GET_STATUS_POWER)
				.flatMap(result => Bacon.once(convertPowerStatusToString(result)))
				.firstToPromise()
		},
		setAspectRatio: (ratio) => {
			return rawClient.setAction(commands.ASPECT_RATIO, ratio)
				.flatMap(() => {
					return rawClient.getAction(commands.ASPECT_RATIO)
						.flatMap(result => Bacon.once(convertAspectRatioToString(result)))
				})
				.firstToPromise()
		},
		getAspectRatio: () => {
			return rawClient.getAction(commands.ASPECT_RATIO)
				.flatMap(result => Bacon.once(convertAspectRatioToString(result)))
				.firstToPromise()
		},
		getAction: (command, data) => {
			return rawClient.getAction(command, data).firstToPromise()
		},
		setAction: (command, data) => {
			return rawClient.setAction(command, data).firstToPromise()
		}
	}
	return api
}

function convertPowerStatusToString(result) {
	switch (result.data) {
		case powerStatus.STANDBY:
			return 'OFF'
		case powerStatus.START_UP:
		case powerStatus.START_UP_LAMP:
			return 'WARMING'
		case powerStatus.POWER_ON:
			return 'ON'
		case powerStatus.COOLING:
		case powerStatus.COOLING2:
			return 'COOLING'
		default:
			return new Bacon.Error(`Unknown power status ${result.data} (${result.raw.toString('hex').toUpperCase()})`)
	}
}

function convertAspectRatioToString(result) {
	const keys = Object.keys(aspectRatio)
	for (let i=0; i<keys.length; i++) {
		if (aspectRatio[keys[i]] === result.data) {
			return keys[i]
		}
	}
	return new Bacon.Error(`Unknown aspect ratio ${result.data} (${result.raw.toString('hex').toUpperCase()})`)
}

module.exports = {
	SdcpClient,
	commands,
	actions,
	aspectRatio,
	powerStatus
}
