# MFC Exam Studio — Mathematics for Computing

An interactive, 100% static study & exam-practice web app built for **Mathematics for Computing** (covering Chapters 1, 4, 9, 10, 11, 12 and Assignments 1–4).

## Features
- **Interactive Practice Labs**:
  - **Ch. 1 Logic**: Truth-table builder, tautology/equivalence verifier, English ↔ Logic & Quantifier drills.
  - **Ch. 4 Number Theory & Crypto**: Binary Modular Exponentiation step table, Extended Euclidean Algorithm & Bézout coefficients, Linear Congruences, Chinese Remainder Theorem, ISBN-10, Affine Cipher, and RSA.
  - **Ch. 9 Relations & Posets**: Interactive 0–1 matrices with live SVG digraph, Boolean products (`M_R²`), Warshall's algorithm (`W₀..Wₙ`), Hasse diagrams, bounds/lattices, and Topological Sort checker.
  - **Ch. 10–11 Graphs & Trees**: Havel–Hakimi degree sequences, Dijkstra's algorithm label table, interactive Prim & Kruskal MST edge-picker, Expression Trees (prefix/infix/postfix), and full *m*-ary tree calculator.
  - **Ch. 12 Boolean Algebra**: Truth table → Sum-of-Products builder and interactive 3-variable Gray-code Karnaugh Map grouper.
- **Proof & Inference Trainer**: Scrambled Parsons proofs with rule/theorem pickers, free-form proof editor with math symbol bar, offline teacher rubric self-check, and optional **Gemini AI Proof Grader** (using each student's own browser-stored Gemini API key).
- **Assignments 1–4 Reference**: Progressive hints and mathematically verified step-by-step derivations.
- **Knowledge Base & EN–VI Glossary**: Concise exam cheat sheets, common traps, and bilingual English/Vietnamese toggle.
- **Group Mock Final Exam (`#/exam?seed=...`)**: Deterministic seed links so everyone in your study group gets the exact same randomized exam!

## Local Development
```bash
npm install
npm test
npm run dev
```

## Sharing With Your Study Group (100% Free Static Hosting)
Because `vite.config.ts` uses `base: './'` and hash routing (`#/exam?seed=...`), `dist/` works on any static host:

1. **Fastest (30 seconds — No Git required): Netlify Drop**
   - Run `npm run build` to generate `dist/`.
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag-and-drop the `dist/` folder to get an instant public URL for your friends.
2. **GitHub Pages (Auto-deploys via included workflow)**
   - Push this folder to a GitHub repo (`main` branch).
   - Go to **Settings → Pages → Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and publishes automatically.
3. **Vercel / Cloudflare Pages**
   - Connect the repository (Build command: `npm run build`, Output directory: `dist`).

### Privacy Note on Gemini AI Grading
The optional **Grade with Gemini AI** feature runs directly from the student's browser to Google's Gemini API (`store: false`). API keys stay solely in each user's local `localStorage` and are never bundled into the site.
