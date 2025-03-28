import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import env from '../utils/env'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import Article from '../interfaces/article'
import Singleton from '../utils/Singleton'

class OpenAIService extends Singleton<OpenAIService> {
    private openaiEmb: OpenAIEmbeddings
    private openaiChat: ChatOpenAI

    constructor() {
        super()
        this.openaiEmb = new OpenAIEmbeddings({ openAIApiKey: env.openai_api_key, model: 'text-embedding-3-small' })
        this.openaiChat = new ChatOpenAI({ apiKey: env.openai_api_key, model: 'gpt-3.5-turbo-0125', temperature: 0 })
    }

    public embedContent = async (query: string) => {
        return await this.openaiEmb.embedQuery(query)
    }

    public extractContent = async (context: string, query: string) => {
        const prompt = ChatPromptTemplate.fromMessages([
            [
                'system',
                "You are a helpful assistant that can only use the following context to answer the user's question. Do not use any information outside of this context: {context}."
            ],
            ['user', '{query}']
        ])

        const response = await prompt.pipe(this.openaiChat).invoke({ context, query })

        return response.content
    }

    public formatContent = async (context: string) => {
        const prompt = PromptTemplate.fromTemplate('Respond with a valid JSON object. Extract only the title, content, and date (in YYYY-MM-DD format) from the text. Do not use any information outside of the given context: {context}')

        const parser = new JsonOutputParser<Article>()

        const chain = RunnableSequence.from([
            prompt,
            this.openaiChat,
            parser
        ])

        return await chain.invoke({ context })
    }
}

export default OpenAIService.getInstance()