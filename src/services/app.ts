import express, { Application, json, Request, Response, urlencoded } from 'express'
import pineconeService from './pinecone'
import openaiService from './openai'
import { SearchRecordsResponse } from '@pinecone-database/pinecone'

class AppService {
    public app: Application

    constructor() {
        this.app = express()
        this.middlewares()
        this.routes()
    }

    private middlewares(): void {
        this.app.use(json())
        this.app.use(urlencoded({ extended: true }))
    }

    private routes(): void {
        this.app.post('/agent', async (req: Request, res: Response) => {
            try {
                const { query } = req.body

                const sources = await pineconeService.searchRecords(query)

                const extractedContext = sources.result.hits.map((hit: any) => hit.fields?.content).join("\n")

                const answer = await openaiService.extractContent(extractedContext, query)

                res.json({
                    answer,
                    sources: sources.result.hits.map((hit: any) => ({
                        title: hit.fields?.title,
                        url: hit.fields?.url,
                        date: hit.fields?.date
                    }))
                })
            } catch (error) {
                console.error(error)
            }
        })
    }

    public listen(port: number): void {
        this.app.listen(port)
    }
}

const appService = new AppService()

export default appService