# Web Editor

Web-based code editor with GitHub repository support, integrated terminal, and live preview.

## 🚀 Features

- **GitHub Integration** - Direct repo editing from GitHub
- **Monaco Editor** - Full-featured code editor
- **WebContainers** - Browser-based runtime for executing Node.js
- **Integrated Terminal** - Full command execution
- **Live Preview** - Instant results
- **File Manager** - Project navigation

## 🛠 Tech Stack

- Next.js 14 with App Router
- TypeScript
- Effector for state management
- Monaco Editor
- WebContainer API
- Tailwind CSS
- Radix UI components
- XTerm.js terminal

## 📁 Architecture

Uses Feature-Sliced Design:

```
├── app/                    # Next.js App Router
│   ├── (routes)/gh/       # GitHub integration routes
│   └── layout.tsx         # Root layout
├── features/              # Business logic features
│   ├── delete-file/       # File deletion functionality
│   └── dock-manager/      # Panel docking system
├── widgets/               # Complex composite components
│   └── workspace/         # Main workspace with editor & explorer
└── shared/                # Reusable components and utilities
    ├── ui/                # UI components (editor, terminal, explorer)
    ├── lib/               # Shared utilities
    └── webcontainer/      # WebContainer integration
```

**Core Components:**
- **Workspace Widget** - Main editor interface with file explorer and panels
- **Monaco Editor** - Code editing with TypeScript support and syntax highlighting
- **WebContainer** - Browser-based Node.js runtime for code execution
- **Terminal** - Integrated command-line interface using XTerm.js
- **Dock Manager** - Resizable panel system for flexible layout

**Key Principles:**
- Feature-Sliced Design for clear separation of concerns
- Effector for predictable reactive state management
- TypeScript for comprehensive type safety
- Component composition with Radix UI primitives

## 🚀 Quick Start

### Quick Start

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development server:
   ```bash
   yarn dev
   ```

## 📖 Usage

- To change the default repository path, edit the `.env` variable:
  ```
  NEXT_PUBLIC__DEFAULT_GITHUB_REPO=/gh/owner/repo
  ```

- To open a different repository, replace the path with `/gh/{owner}/{repo}`.

1. Edit files using Monaco Editor
2. Run commands in integrated terminal
3. View results in live preview
4. Manage files through file manager
