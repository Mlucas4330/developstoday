Docker Image Instructions

Prerequisites

Make sure you have Docker installed on your machine.

Build the Docker Image bu running the following command:

docker build -t your-image-name .

Running the Docker Container

Once the Docker image is built, you can run the Docker container with the following command:

docker run -d -p 3000:3000 your-image-name

-d: Runs the container in detached mode (in the background).

-p 3000:3000: Maps port 3000 on your machine to port 3000 in the container (change the port if needed).

your-image-name: Replace with the name you used when building the Docker image.

Design Choices

Object-Oriented Design

I chose Object-Oriented Design (OOD) for this project to keep the code modular, readable, and easy to maintain. By separating different functionalities into distinct classes, I was able to isolate the concerns of different parts of the system, making the codebase more manageable.

Separation of Concerns: Each class has a single responsibility, whether it’s handling communication with Pinecone, interacting with OpenAI through LangChain, or dealing with the logic for message generation.

Code Reusability: The classes are designed in a way that they can be reused or extended in the future with minimal changes to existing code.

Testing and Maintenance: With this structure, I can test individual components independently and make changes or add features without affecting other parts of the system.

The classes are separated into different files, which makes the project easier to extend and debug. For example:

The class responsible for communicating with Pinecone handles all aspects of querying and upserting data.

The OpenAI service class is responsible for integrating with LangChain to generate responses, which is easier to swap or modify in the future if needed.

Why LangChain?

I chose LangChain to handle the integration with OpenAI due to its rich set of features designed to simplify the process of building and managing chains of prompts and responses.

Message Templates: LangChain provides an easy way to build dynamic prompt templates. This reduces the complexity of working with OpenAI's models directly, allowing me to create complex prompts with variables like user input.

Integration: LangChain simplifies the integration between different services like OpenAI, making it easier to structure interactions and manage responses.

Flexibility: LangChain offers built-in capabilities to handle multiple types of chains, allowing me to scale or modify my prompt strategy with minimal changes to the codebase.

Why Pinecone?

Pinecone was chosen for vector database search due to its simplicity and powerful features for working with large datasets.

Easy to Use: Pinecone’s API is straightforward, making it quick to implement and easy to understand.

Debugging: Pinecone’s user-friendly interface and easy-to-use API enable quick debugging and help in tracking the performance of queries.

Scalability: Pinecone is designed for scalability, allowing you to handle growing amounts of data efficiently as the project grows.

Integration with AI Models: Pinecone’s ability to store and search vector embeddings works well when combined with language models like OpenAI, making it a great fit for projects that require semantic search.

