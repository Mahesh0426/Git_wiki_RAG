import { inngest } from "../client.js";
import { fetchRepoFiles } from "../../services/github.js";
import { chunkFiles } from "../../services/chunking.js";
import { saveChunks } from "../../services/vectorStore.js";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repo/index.requested" }],
  },

  async ({ event, step }) => {
    const { githubToken, owner, repo } = event.data;

    const repoName = repo.replace(/\.git$/, "");
    const repoKey = `${owner}/${repoName}`;

    //step 1
    const files = await step.run("fetch-github-files", async () => {
      return fetchRepoFiles(githubToken, owner, repoName);
    });

    //step 2
    const documents = await step.run("chunk-files", async () => {
      return chunkFiles(files, repoKey);
    });

    //step 3
    const saveResult = await step.run("save-to-pinecone", async () => {
      return saveChunks(repoKey, documents);
    });

    return {
      repo: repoKey,
      fileCount: files.length,
      chunkCount: documents.length,
      saved: saveResult.saved,
    };
  },
);
