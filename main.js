// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

// TODO: Add plugin code here...
const md5 = require('md5')

module.exports.templateTags = [{
    name: 'security_hash',
    displayName: 'Deepwell Security Hash Generator',
    description: 'Create security hashes based off a clients API key',

    async run (context) {
        let apiKey  = context.context['api_key']

        let halfApiKey       = apiKey.substring(0, 16)
        let messageTimestamp = Math.floor((new Date().getTime()) / 1000)
        let securityHash     = md5(`${messageTimestamp}${apiKey}`)

        return JSON.stringify({
            half_api_key: halfApiKey,
            message_timestamp: messageTimestamp,
            security_hash: securityHash
        })
    },
}]