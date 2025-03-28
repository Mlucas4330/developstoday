import { EachMessagePayload, Kafka, Consumer } from 'kafkajs'
import env from '../utils/env'
import cleanHTML from '../utils/cleanHTML'
import Singleton from '../utils/Singleton'
import openaiService from './openai'
import pineconeService from './pinecone'

class KafkaService extends Singleton<KafkaService> {
    private kafka: Kafka
    private consumer: Consumer

    constructor() {
        super()
        this.kafka = new Kafka({ clientId: 'developstoday', brokers: [env.kafka_broker], ssl: true, sasl: { mechanism: 'plain', username: env.kafka_username, password: env.kafka_password } })
        this.consumer = this.kafka.consumer({ groupId: env.kafka_group_id_prefix + Date.now() })
    }

    private async subscribeToConsumer() {
        await this.consumer.subscribe({ topic: env.kafka_topic_name, fromBeginning: true })

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                try {
                    const messageContent = message.value?.toString()

                    if (!messageContent) return

                    const { value } = JSON.parse(messageContent)

                    const response = await fetch(value.url)

                    const html = await response.text()

                    const cleanedHTML = cleanHTML(html)

                    const formattedContent = await openaiService.formatContent(cleanedHTML)

                    const metadata = { ...formattedContent, url: value.url }

                    const embededMetadata = await openaiService.embedContent(JSON.stringify(metadata))

                    pineconeService.upsert({ id: value.url, metadata, values: embededMetadata })
                } catch (error) {
                    console.error('Error: ', error)
                }
            }
        })
    }

    private async startConsumer() {
        await this.consumer.connect()
    }

    public async initialize() {
        await this.startConsumer()
        await this.subscribeToConsumer()
    }
}

export default KafkaService.getInstance()