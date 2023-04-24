// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins
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
        name: 'controlport_api_strategy',
        displayName: 'ControlPort API authentication',
        description: 'Either signs a Bearer token in the Authorization header or injects our half_api_key authentication payload into the request body.',
        args: [
            {
                displayName: 'Strategy',
                deaultValue: 'HEADER',
                type: 'enum',
                options: [
                    { 
                        displayName: 'Authorization Header', 
                        value: 'HEADER', 
                        description: 'Generate a base64 encoded string representing the half_api_key strategy' 
                    },
                    { 
                        displayName: 'Request Body', 
                        value: 'BODY', 
                        description: 'Inject our half_api_key_strategy into the request body' 
                    },
                ]
            },
        ],

        async run (context, strategy) {
            return strategy
        },
    },
]

module.exports.requestHooks = [
  async context => {
        const apiKey = context.request.getEnvironmentVariable('controlport_api_key')
        const authMethod = context.request.getEnvironmentVariable('controlport_auth_method')
        console.log('method is', authMethod)

        if (authMethod === 'BODY') {
            const body = context.request.getBody();
            let authPayload = JSON.parse(halfApiKeyGenerator(apiKey))
            if (body.text) {
                const text = JSON.parse(body.text)
                authPayload = { ...text, ...authPayload }
            }

            context.request.setBody({ ...body, text: JSON.stringify(authPayload) })
        } else if (authMethod === 'HEADER') {
            context.request.setHeader('Authorization', `Bearer ${Buffer.from(halfApiKeyGenerator(apiKey)).toString('base64')}`)
        }

  }
];