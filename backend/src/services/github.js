import "dotenv/config";
import { Octokit } from "@octokit/rest";

const SKIP_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  "vendor",
  "target",
  "__pycache__",
  ".gradle",
];

const SKIP_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "webp",
  "bmp",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "mp3",
  "mp4",
  "mov",
  "wav",
  "webm",
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "wasm",
  "class",
  "jar",
  "war",
  "ear",
  "zip",
  "tar",
  "gz",
  "tgz",
  "7z",
  "rar",
  "pdf",
  "lock",
  "map",
]);

const SKIP_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "composer.lock",
  "go.sum",
]);

//skip file function
function shouldSkipFile(path, size) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];

  if (parts.some((part) => SKIP_DIRS.includes(part))) return true;
  if (SKIP_FILES.has(fileName)) return true;
  if (typeof size === "number" && size > 200_000) return true;

  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase()
    : "";

  if (SKIP_EXTENSIONS.has(ext)) return true;
  if (fileName.endsWith(".min.js")) return true;

  return false;
}

//parse repo function
export function parseRepo(input) {
  const clean = input
    .replace("https://github.com/", "")
    .replace("http://github.com/", "")
    .replace(/\.git$/, "");

  const [owner, repo] = clean.split("/");
  return { owner, repo, repoKey: `${owner}/${repo}` };
}

//fetch repo files function
export async function fetchRepoFiles(token, owner, repo) {
  // create octokit instance to access the GitHub API
  const octokit = new Octokit({ auth: token });

  //api call to query the repo's metadata(eg: id,name,private,default_branch,)
  const { data: repoInfo } = await octokit.rest.repos
    .get({ owner, repo })
    .catch((err) => {
      if (err.status === 404) {
        throw new Error(
          `GitHub could not find ${owner}/${repo}. Fine-grained tokens (github_pat_) must include this repo.`,
        );
      }
      throw err;
    });

  //api call to fetch the full directory tree
  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: repoInfo.default_branch,
    recursive: "true", // return the entire directory tree nested across all subfolders in a single API call
  });

  //Initializes an empty array to store final downloaded file paths and decoded contents
  const files = [];

  for (const item of tree.tree) {
    //skips non-file items in the tree (like directories, symlinks, etc.)
    if (item.type !== "blob") continue;

    //skip files that match the defined criteria
    if (shouldSkipFile(item.path, item.size)) continue;

    //api call to fetches raw content of the file from github
    const { data: blob } = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: item.sha,
    });

    //pushes the file path and decoded content into the files array
    files.push({
      path: item.path,
      //The content from GitHub is Base64 encoded and must be decoded to UTF-8.
      content: Buffer.from(blob.content, "base64").toString("utf8"),
    });

    if (files.length >= 200) break;
  }

  return files;
}

// ==========================================
// Test execution: Call fetchRepoFiles
// ==========================================
const token = process.env.GITHUB_TOKEN;
const owner = "Mahesh0426"; // replace with desired owner
const repo = "Git_wiki_RAG"; // replace with desired repository name

async function runTest() {
  try {
    console.log(`⏳ Fetching files for ${owner}/${repo}...`);
    const files = await fetchRepoFiles(token, owner, repo);
    console.log(`✅ Successfully fetched ${files.length} file(s):\n`);

    files.forEach((file, index) => {
      console.log(`========================================`);
      console.log(`📄 [File ${index + 1}] Path: ${file.path}`);
      console.log(`---------------- Content Preview ----------------`);
      console.log(
        file.content.slice(0, 300) +
          (file.content.length > 300 ? "\n... [truncated]" : ""),
      );
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error("❌ Error fetching repo files:", error.message);
  }
}

// runTest();
//node src/services/github.js
