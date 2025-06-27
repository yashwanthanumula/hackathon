# How to Write Instructions in CLAUDE.md

## Key Sections to Include

### 1. Project Overview
```markdown
## Project Overview
**Project Name:** Your Project Name
**Purpose:** Clear description of what the project does
**Tech Stack:** List all technologies used
**Architecture:** Brief description of system design
```

### 2. Development Guidelines
```markdown
## Development Guidelines
- Always use TypeScript for new files
- Follow ESLint rules without disabling them
- Use async/await instead of callbacks
- Prefer functional components over class components
- Write tests for all new features
```

### 3. Code Style Preferences
```markdown
## Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at end of statements
- Use descriptive variable names (no abbreviations)
- Keep functions under 20 lines
```

### 4. Important Commands
```markdown
## Commands to Run
- Before committing: `npm run lint && npm test`
- To check types: `npm run typecheck`
- To run dev server: `npm run dev`
- To build: `npm run build`
```

### 5. Project-Specific Rules
```markdown
## Project Rules
- Never modify files in /generated directory
- Always update API docs when changing endpoints
- Use the custom logger at src/utils/logger.ts
- Follow the error handling pattern in src/errors/
```

### 6. Common Patterns
```markdown
## Patterns to Follow
- API endpoints: `/api/v1/[resource]/[action]`
- Component files: `ComponentName.tsx` + `ComponentName.test.tsx`
- Use custom hooks in src/hooks/ for shared logic
- State management: Use Context API, not Redux
```

### 7. What NOT to Do
```markdown
## Avoid These
- Don't use any or unknown types
- Don't commit console.log statements
- Don't use inline styles
- Don't create files outside src/
- Don't install new packages without asking
```

## Tips for Effective Instructions

1. **Be Specific**: Instead of "write clean code", say "use descriptive function names over 3 words"

2. **Provide Examples**:
```markdown
## Naming Conventions
Good: `getUserProfileData()`
Bad: `getData()`
```

3. **Explain Context**:
```markdown
## Database Notes
We use PostgreSQL with Prisma ORM. Always use migrations, never modify the database directly.
```

4. **Include Gotchas**:
```markdown
## Known Issues
- The test suite requires NODE_ENV=test
- Port 3000 must be free for dev server
- API keys must be in .env.local, not .env
```

5. **Update Regularly**: Keep CLAUDE.md current as your project evolves

## Example Template

```markdown
# Project Context for Claude

## Quick Start
Tell Claude exactly how to get started with the project.

## Architecture
Describe the overall structure and how components interact.

## Key Decisions
- Why we chose Framework X over Y
- Why we structure files this way
- Why we use certain patterns

## Development Workflow
1. Create feature branch
2. Write tests first
3. Implement feature
4. Run linters and tests
5. Create PR with description

## Where to Find Things
- API logic: /src/api/
- UI components: /src/components/
- Business logic: /src/services/
- Types: /src/types/

## Current Focus
What you're currently working on and priorities.
```