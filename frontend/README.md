# SkillGap AI — Frontend

A React-based frontend for an AI-powered skill gap analyzer platform for students.

## Features

- **Auth flow** — Login & signup with form validation
- **Profile Wizard** — 4-step onboarding:
  1. Personal info + resume upload (simulates AI parsing)
  2. Academic details
  3. GitHub / LeetCode / LinkedIn links
  4. Skills & target role
- **Dashboard** with 5 tabs:
  - Overview — metrics, skill bars, top gaps, linked profiles
  - LeetCode — problem distribution, rank, streak, weakness detection
  - GitHub — commits, repos, stars, language breakdown, contribution insights
  - LinkedIn — connections, endorsements, profile views
  - Skill Gaps — animated ring charts with color-coded status & resource recommendations
- **Edit profile** — accessible from sidebar, pre-fills existing data

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Demo Login

- Email: `demo@skillgap.ai`
- Password: `demo123`

## Tech Stack

- React 18
- Vite
- Pure CSS (no UI library)

## Project Structure

```
src/
  App.jsx                  # Root + routing state
  main.jsx                 # Entry point
  index.css                # Global styles & CSS variables
  data/
    mockData.js            # Mock API data (replace with real APIs)
  components/
    AuthPage.jsx           # Login / signup screen
    ProfileWizard.jsx      # 4-step profile setup
    Dashboard.jsx          # Sidebar layout + tab switching
    tabs.jsx               # Tab content: Overview, LeetCode, GitHub, LinkedIn, Gaps
    ui.jsx                 # Shared: Ring, MiniBar, MetricCard
```

## Connecting Real APIs

Replace mock data in `src/data/mockData.js` with real API calls:

| Source   | API                                      |
|----------|------------------------------------------|
| LeetCode | `https://leetcode.com/graphql`           |
| GitHub   | `https://api.github.com/users/{username}`|
| LinkedIn | LinkedIn Official API (OAuth required)   |
| Resume   | OpenAI / Anthropic API for PDF parsing   |
