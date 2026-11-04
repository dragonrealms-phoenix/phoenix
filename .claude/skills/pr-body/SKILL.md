---
name: pr-body
description: Creates or updates a GitHub pull request with a concise, reviewer-focused description - a short numbered list of changes, a Mermaid diagram, a before/after table, and before/after screenshots - instead of a file-by-file changelog. Use whenever the user asks to open, create, raise, or put up a PR for the current branch, or to write, rewrite, fill in, or update a PR body, description, title, or summary - including phrasings like "open a pr", "make a pr", "update the pr body", "describe this pr", or "write the pr description".
---

# Describe a Pull Request

Create or update the pull request for the current branch with a short description that tells a reviewer why the change exists and what it changes.

## Workflow

1. Read `references/pr_description_template.md` in this skill's base directory.

2. Identify the pull request, without changing anything on GitHub yet:

   - Check the current branch for a PR with `gh pr view --json url,number,title,state,baseRefName,headRefName 2>/dev/null`.
   - If no PR exists, inspect `git status --short --branch` and the commits on the current branch. Step 6 creates the PR once its body is written and checked, so the PR never exists without its body.
   - Ask the user to select a PR only when the current branch has no relevant work and there is no safe current-branch PR to create.
   - When the user asks only for the body, such as a draft saved to a file, write and check it in steps 3 to 5, save it where they ask, and stop there.

3. Gather only the context needed to explain the change:

   - Read the complete diff against the base branch, and enough surrounding code to understand the behavior.
   - Note any GitHub issue named by the user, the branch name or the commit messages.

4. Write the PR description using the template:

   - Write the title as a conventional-commit subject that names the outcome in plain words, like `fix(game-stream-text): highlights apply to room descriptions`. Commitlint enforces this format on commits.
   - Keep **Background** to one or two short sentences: the problem, then what is true once the PR ships.
   - Open **Changes** with a numbered list, one item per thing the PR does.
   - When the PR changes runtime behavior, follow the list with one Mermaid diagram and one before/after table, each under a one-line lead.
     - Leave both out for chore, build, docs and test-only PRs. A dependency bump has no behavior to draw.
     - The diagram shows the new behavior as data flow, a sequence or control flow. Use real names and values, and about 8 nodes at most.
     - Draw what happens with solid arrows, and what is refused, ignored or skipped with dotted arrows.
     - Don't start a node label with a number and a dot, such as `1. Check`. GitHub can render it as an unsupported list.
     - The table has one row per numbered change, in the same order: a concrete case, then its result before and after.
     - Don't merge changes, or their rows, to save words. A merged row mixes cases, and the reader has to guess which After belongs to which case.
   - Take every claim about how things were before from the base branch's code, never from notes or a summary. A reader can't tell when a Before is false.
   - For a security fix, describe the old behavior by what the app accepted, never by how it could be misused.
   - When the PR changes what a user sees, add before and after screenshots below the table, under a one-line lead, in a two-column `Before | After` table as the template shows.
     - Capture them by running the app on the base branch and on this branch, the way this project's instructions (CLAUDE.md and the docs it points to) describe.
     - If those instructions don't say how to run the app, or the capture fails, leave the screenshots out and say so in step 7.
     - Reference each image by a short local path, like `![Before: highlights ignored in the room description](./before.png)`. Step 6 uploads it.
     - Write alt text that says what the image shows, so a reader without the image still gets the point.
   - Open with **Dependencies** only when other PRs must merge first, listed in merge order.
   - End with `Closes #N` only when an issue is known.
   - Keep **Background** and the numbered changes to about 200 words together. Write how people speak.

5. Check the description with one blind read before publishing, unless the change is a line or two:

   - Give a fresh agent only the title and the body, and tell it to use no tools. Ask it what problem the PR solves, what it changes, who notices, and anything it had to reread or guess.
   - Fix what it got wrong, and any guess that would change a reviewer's decision. Reword or replace a sentence rather than add one.

6. Publish the description:

   - Write the body to a scratch file outside the repository. Use the session scratchpad directory when the harness provides one, otherwise `mktemp -d -t pr-description`. Never write it inside the working tree.
   - `gh` needs a file because the body contains backticks and code fences that shell quoting would mangle.
   - Copy each screenshot into the same scratch directory, under the name the body uses, so its `./name.png` path resolves from the body file.
   - If no PR exists, commit task-related changes when needed, push the branch with an upstream, and create the PR with `gh pr create --title {title} --body-file {scratch-path}`. Follow the repository's git safety protocol.
     - Add `--base {branch}` when the PR is stacked on another PR's branch, and `--draft` when the user asked for a draft.
   - If the PR exists, update it with `gh pr edit {number} --body-file {scratch-path}`, plus `--title {title}` when the title changed.
   - Add `--attach {scratch-dir}/{name}.png` to either command for each screenshot.
     - `gh` uploads each attached image and rewrites its local path in the body to the uploaded image.
     - Attach only images the body references. `gh` appends any other attached file to the end of the body.
   - Confirm the update succeeded, and that every image link now starts with `https://github.com/user-attachments/`. Then delete the scratch files.

7. Reply with the PR URL and title, plus anything left undone, such as screenshots that couldn't be captured.

Do not expand the PR body beyond the template.

Write as one human talking to another: avoid jargon and slang, and use simple, coherent, concise language.
