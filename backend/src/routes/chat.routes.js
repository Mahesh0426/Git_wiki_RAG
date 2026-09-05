import { Router } from "express";
import { inngest } from "../inngest/client.js";
import { parseRepo } from "../services/github.js";
import { askQuestion } from "../services/rag.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { repo, question } = req.body ?? {};

    if (!repo || !question) {
      return res.status(400).json({ error: "repo and question are required" });
    }

    const { repoKey } = parseRepo(repo);

    // Record the event in Inngest in background
    inngest
      .send({
        name: "chat/question.requested",
        data: { repo: repoKey, question },
      })
      .catch((err) =>
        console.warn("Failed to record chat event in Inngest:", err.message),
      );

    // Retrieve relevant code chunks and generate answer
    const result = await askQuestion(repoKey, question);

    return res.json({
      answer: result.answer,
      sources: result.sources || [],
    });
  } catch (err) {
    console.error("Error answering question:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate answer from repository.",
    });
  }
});

export default router;
