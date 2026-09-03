import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkFiles(files, repo) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  //   Initializes an empty array to collect all chunked Document objects across all files.
  const documents = [];

  //  Loops through each file downloaded from GitHub.
  for (const file of files) {
    //Splits the file content into LangChain Document objects and attaches metadata:
    const chunks = await splitter.createDocuments(
      [file.content],
      [{ path: file.path, repo }],
    );
    documents.push(...chunks);
  }
  return documents;
}
