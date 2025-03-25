import appService from './services/app'
import kafkaService from './services/kafka'
import pineconeService from './services/pinecone'

const main = async () => {
    try {
        appService.listen(3000)

        await kafkaService.initialize()

        await pineconeService.createIndex()
    } catch (error) {
        console.error('Error: ', error)
    }
}

main()