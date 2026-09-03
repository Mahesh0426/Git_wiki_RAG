import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  dimensions: 512,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

function getIndex() {
  return pc.Index(process.env.PINECONE_INDEX || "git-wiki-rag");
}

export async function saveChunks(repo, documents) {
  if (!documents || documents.length === 0) {
    console.warn(`No documents found to save in Pinecone for repo: ${repo}`);
    return { saved: false, count: 0 };
  }

  const namespace = repo.replace("/", "-");
  const index = getIndex();

  // Generate embeddings for all document chunks
  const texts = documents.map((doc) => doc.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // Format records for Pinecone v8 SDK ({ records: [...] })
  const records = documents.map((doc, i) => ({
    id: `${namespace}-chunk-${i}`,
    values: vectors[i],
    metadata: {
      text: doc.pageContent,
      path: doc.metadata?.path || "",
      repo: doc.metadata?.repo || repo,
    },
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await index.namespace(namespace).upsert({ records: batch });
  }

  return { saved: true, count: documents.length };
}


