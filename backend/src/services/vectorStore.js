import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

//Initializes the OpenAI embedding model.
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  dimensions: 512,
});

//Initializes the Pinecone client.
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

function getIndex() {
  return pc.Index(process.env.PINECONE_INDEX || "git-wiki-rag");
}

//Saves the chunks into Pinecone
export async function saveChunks(repo, chunks) {
  if (!chunks || chunks.length === 0) {
    console.warn(`No chunks found to save in Pinecone for repo: ${repo}`);
    return { saved: false, count: 0 };
  }

  const namespace = repo.replace("/", "-");
  const index = getIndex();

  // Generate embeddings for all chunks
  const texts = chunks.map((chunk) => chunk.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // Format each chunk into a record for Pinecone v8 SDK ({ records: [...] })
  const records = chunks.map((chunk, i) => ({
    id: `${namespace}-chunk-${i}`,
    values: vectors[i],
    metadata: {
      text: chunk.pageContent,
      path: chunk.metadata?.path || "",
      repo: chunk.metadata?.repo || repo,
    },
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    //Save (upsert) these vectors along with metadata  into a dedicated namespace in Pinecone.
    const batch = records.slice(i, i + batchSize);
    await index.namespace(namespace).upsert({ records: batch });
  }

  return { saved: true, count: chunks.length };
}

// search from pinecone
export async function search(repo, question, topK = 5) {
  const namespace = repo.replace("/", "-");
  const index = getIndex();

  // Generate embedding for the question
  const [vector] = await embeddings.embedDocuments([question]);

  // Query Pinecone
  const response = await index.namespace(namespace).query({
    vector,
    topK,
    includeMetadata: true,
  });

  // Format and filter results
  return (response.matches || [])
    .map((match) => ({
      pageContent: match.metadata?.text || "",
      metadata: {
        path: match.metadata?.path || "",
        repo: match.metadata?.repo || repo,
      },
      score: match.score,
    }))
    .filter((doc) => doc.pageContent.trim().length > 0);
}
