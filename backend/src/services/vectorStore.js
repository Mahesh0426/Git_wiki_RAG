import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

function getIndex() {
  return pc.Index(process.env.PINECONE_INDEX || "git-wiki-rag");
}

export async function saveChunks(repo, documents) {
  const namespace = repo.replace("/", "-");

  await PineconeVectorStore.fromDocuments(documents, embeddings, {
    pineconeIndex: getIndex(),
    namespace,
  });
}
