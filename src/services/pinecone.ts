import env from '../utils/env'
import { Index, Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import Singleton from '../utils/Singleton'
import openaiService from './openai'

class PineconeService extends Singleton<PineconeService> {
    private pc: Pinecone
    private indexName: string
    private index?: Index

    constructor() {
        super()
        this.pc = new Pinecone({ apiKey: env.pinecone_api_key })
        this.indexName = 'developstoday'
    }

    private async createIndex() {
        await this.pc.createIndex({
            name: this.indexName,
            dimension: 1536,
            metric: 'cosine',
            waitUntilReady: true,
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                }
            }
        })
    }

    public async initializeIndex() {
        const response = await this.pc.listIndexes()

        const index = response.indexes?.find(item => item.name === this.indexName)

        if (!index) {
            await this.createIndex()
        }

        this.index = this.pc.index(this.indexName)
    }

    public async searchRecords(text: string) {
        const vector = await openaiService.embedContent(text)
        return await this.index?.query({ vector, topK: 3, includeMetadata: true })
    }

    public async upsert(record: PineconeRecord) {
        await this.index?.upsert([record])
    }
}

export default PineconeService.getInstance()