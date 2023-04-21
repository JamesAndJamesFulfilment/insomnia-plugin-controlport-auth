// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

// TODO: Add plugin code here...
const md5 = require('md5')

const halfApiKeyGenerator = (apiKey) => {
    const halfApiKey       = apiKey.substring(0, 16)
    const messageTimestamp = Math.floor((new Date().getTime()) / 1000)
    const securityHash     = md5(`${messageTimestamp}${apiKey}`)

    return JSON.stringify({
        half_api_key: halfApiKey,
        message_timestamp: messageTimestamp,
        security_hash: securityHash
    })
}

module.exports.templateTags = [
    {
        name: 'security_hash_base64',
        displayName: 'Deepwell Bearer token using half_api_key',
        description: 'Generate a base64 encoded string represneting our half_api_key auth strategy',

        async run (context) {
            const apiKey = context.context['api_key']
            const authMethod = context.context['auth_method']

            if (authMethod.toUpperCase() !== 'HEADER') {
                return ''
            }

            return Buffer.from(halfApiKeyGenerator(apiKey)).toString('base64')
        },
    },
]

module.exports.requestHooks = [
  async context => {
        const apiKey = context.request.getEnvironmentVariable('api_key')
        const authMethod = context.request.getEnvironmentVariable('auth_method')

        if (authMethod.toUpperCase() !== 'BODY') {
            return
        }

        const body = context.request.getBody();
        let authPayload = JSON.parse(halfApiKeyGenerator(apiKey))
        if (body.text) {
            const text = JSON.parse(body.text)
            authPayload = { ...text, ...authPayload }
        }

        context.request.setBody({ ...body, text: JSON.stringify(authPayload) })
  }
];