import dotenv from 'dotenv'

dotenv.config()

const env = {
    openai_api_key: process.env.OPENAI_API_KEY || '',
    kafka_broker: process.env.KAFKA_BROKER || '',
    kafka_username: process.env.KAFKA_USERNAME || '',
    kafka_password: process.env.KAFKA_PASSWORD || '',
    kafka_topic_name: process.env.KAFKA_TOPIC_NAME || '',
    kafka_group_id_prefix: process.env.KAFKA_GROUP_ID_PREFIX || '',
    pinecone_api_key: process.env.PINECONE_API_KEY || ''
}

export default env