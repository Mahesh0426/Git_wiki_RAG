import { inngest } from "../client.js";
import { fetchRepoFiles, parseRepo } from "../../services/github.js";
import { chunkFiles } from "../../services/chunking.js";
import { saveChunks } from "../../services/vectorStore.js";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repo/index.requested" }],
  },

  async ({ event, step }) => {
    const rawToken = event.data.githubToken || process.env.GITHUB_TOKEN;
    const rawRepo = event.data.repo || "";
    let owner = event.data.owner;
    let repoName = rawRepo;

    // Auto-parse if owner is missing or full URL / repoKey is passed in repo
    if (!owner && rawRepo) {
      const parsed = parseRepo(rawRepo);
      owner = parsed.owner;
      repoName = parsed.repo;
    } else {
      repoName = repoName.replace(/\.git$/, "");
    }

    const repoKey = `${owner}/${repoName}`;

    // Step 1: Fetch files from GitHub
    const files = await step.run("fetch-github-files", async () => {
      return fetchRepoFiles(rawToken, owner, repoName);
    });

    // Step 2: Chunk the files
    const documents = await step.run("chunk-files", async () => {
      return chunkFiles(files, repoKey);
    });

    // Step 3: Save the chunks to Pinecone
    const saveResult = await step.run("save-to-pinecone", async () => {
      return saveChunks(repoKey, documents);
    });

    // Return the summary result
    return {
      repo: repoKey,
      fileCount: files.length,
      chunkCount: documents.length,
      saved: saveResult.saved,
    };
  },
);

