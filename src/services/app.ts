import express, { Application, json, Request, Response, urlencoded } from 'express'
import Singleton from '../utils/Singleton'
import pineconeService from './pinecone'
import openaiService from './openai'

class AppService extends Singleton<AppService> {
    public app: Application

    constructor() {
        super()
        this.app = express()
        this.middlewares()
        this.routes()
    }

    private middlewares() {
        this.app.use(json())
        this.app.use(urlencoded({ extended: true }))
    }

    private routes() {
        this.app.post('/agent', async (req: Request, res: Response) => {
            try {
                const { query } = req.body

                const response = await pineconeService.searchRecords(query)

                if (!response) return

                const extractedContext = response.matches
                    .map(match => match.metadata?.content)
                    .join('\n')

                const answer = await openaiService.extractContent(extractedContext, query)

                res.json({
                    answer,
                    sources: response.matches.map(match => ({
                        title: match.metadata?.title,
                        url: match.metadata?.url,
                        date: match.metadata?.date
                    }))
                })
            } catch (error) {
                console.error(error)
            }
        })
    }

    public listen(port: number) {
        this.app.listen(port)
    }
}

export default AppService.getInstance()