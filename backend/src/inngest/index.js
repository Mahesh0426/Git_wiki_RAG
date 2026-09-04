import { inngest } from "./client.js";
import { hello } from "./functions/hello.js";
import { indexRepo } from "./functions/indexRepo.js";
import { askQuestionFn } from "./functions/askQuestions.js";

export { inngest };

export const functions = [hello, indexRepo, askQuestionFn];
