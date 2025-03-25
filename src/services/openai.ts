import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import env from '../utils/env'
import { JsonOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"

class OpenAIService {
    private openaiEmb: OpenAIEmbeddings
    private openaiChat: ChatOpenAI

    constructor() {
        this.openaiEmb = new OpenAIEmbeddings({
            openAIApiKey: env.openai_api_key,
            model: 'text-embedding-3-small'
        })

        this.openaiChat = new ChatOpenAI({
            apiKey: env.openai_api_key,
            model: 'gpt-3.5-turbo-0125',
        })
    }
    public embedContent = async (query: string) => {
        const embedding = await this.openaiEmb.embedQuery(query)

        return embedding
    }

    public extractContent = async (context: string, query: string) => {
        const prompt = PromptTemplate.fromTemplate(`
            You are an AI assistant with access to relevant information.
            Use the provided context to answer the question.
            
            Context:
            {context}
            
            Question: {query}
            Answer:
        `)

        const formattedPrompt = await prompt.format({
            context,
            query
        })

        const response = await this.openaiChat.invoke(formattedPrompt)

        return response.content
    }

    public formatContent = async (message: string) => {
        interface Article {
            title: string
            content: string
            date: string
        }

        const formatInstructions = `
                You are an AI that extracts key information from an article and returns it in JSON format. Given an article text, extract and structure the following details:

                {
                    "title": "Article Title",
                    "content": "Cleaned article content without unnecessary text, ads, or unrelated information.",
                    "date": "Publication date in YYYY-MM-DD format, if available."
                }

                Ensure the JSON output is properly formatted. If any field is unavailable, do not return.    
          `

        const parser = new JsonOutputParser<Article>()

        const prompt = ChatPromptTemplate.fromTemplate(
            "Answer the user query.\n{format_instructions}\n{query}\n"
        )

        const partialedPrompt = await prompt.partial({
            format_instructions: formatInstructions,
        })

        const chain = partialedPrompt.pipe(this.openaiChat).pipe(parser)

        return await chain.invoke({ query: message })
    }
}

const openaiService = new OpenAIService()

export default openaiService