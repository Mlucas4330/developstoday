import { EachMessagePayload, Kafka, Consumer } from 'kafkajs'
import env from '../utils/env'
import axios from 'axios'
import cleanHTML from '../utils/cleanHTML'
import pineconeService from './pinecone'
import openaiService from './openai'

class KafkaService {
    private kafka: Kafka
    private consumer: Consumer

    constructor() {
        this.kafka = new Kafka({
            clientId: 'developstoday',
            brokers: [env.kafka_broker],
            ssl: true,
            sasl: { mechanism: 'plain', username: env.kafka_username, password: env.kafka_password }
        })
        this.consumer = this.kafka.consumer({ groupId: env.kafka_group_id_prefix + Date.now() })
    }

    private async subscribeToConsumer(): Promise<void> {
        await this.consumer.subscribe({ topic: env.kafka_topic_name, fromBeginning: true })

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                try {
                    const messageContent = message.value?.toString()
                    if (!messageContent) return

                    const { value } = JSON.parse(messageContent)

                    const { data: html } = await axios.get(value.url)

                    const cleanedHTML = cleanHTML(html)

                    const formattedContent = await openaiService.formatContent(cleanedHTML)

                    const embededContent = await openaiService.embedContent(JSON.stringify({ ...formattedContent, url: value.url }))

                    pineconeService.upsert({ id: value.url, metadata: { ...formattedContent, url: value.url }, values: embededContent })
                } catch (error) {
                    console.error(error)
                }
            }
        })
    }

    private async startConsumer(): Promise<void> {
        await this.consumer.connect()
    }

    public async initialize(): Promise<void> {
        await this.startConsumer()
        await this.subscribeToConsumer()
    }
}

const kafkaService = new KafkaService()

export default kafkaService