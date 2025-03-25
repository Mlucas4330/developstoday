import env from '../utils/env'
import { Index, Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import openaiService from './openai'

class PineconeService {
    private pc: Pinecone
    private indexName: string
    private index?: Index

    constructor(indexName: string) {
        this.pc = new Pinecone({ apiKey: env.pinecone_api_key })
        this.indexName = indexName
    }

    public async createIndex(): Promise<void> {
        await this.pc.createIndex({
            name: this.indexName,
            dimension: 1536,
            metric: 'cosine',
            suppressConflicts: true,
            waitUntilReady: true,
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                }
            }
        })
        
        await this.initializeIndex()
    }

    private async initializeIndex(): Promise<void> {
        this.index = this.pc.Index(this.indexName)
    }

    public async searchRecords(text: string) {
        if (!this.index) {
            throw new Error('Index is not initialized. Call `createIndex()` first.')
        }

        const values = await openaiService.embedContent(text)

        const response = await this.index.searchRecords({
            query: {
                vector: {
                    values
                },
                topK: 1
            },
            fields: ['url', 'title', 'date', 'content']
        })

        return response
    }

    public async upsert(record: PineconeRecord): Promise<void> {
        if (!this.index) {
            throw new Error('Index is not initialized. Call `createIndex()` first.')
        }

        await this.index.upsert([record])
    }
}

const pineconeService = new PineconeService('developstoday')

export default pineconeService