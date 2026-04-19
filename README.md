# HistoriArt

HistoriArt is a sophisticated multimedia eBook platform dedicated to the preservation and exploration of Vietnamese history. By integrating advanced Web technologies with immersive storytelling and Artificial Intelligence, HistoriArt transforms traditional reading into a multi-sensory educational experience.

## Core Features

### 1. Multimedia Reader Engine
The platform's flagship feature provides a high-fidelity reading interface where historical text is supplemented by:
- **Visual Immersion**: High-resolution imagery and historical archival photos.
- **Documentary Integration**: Embedded documentary footage and video annotations.
- **Atmospheric Audio**: Curated historical music and ambient soundscapes that adjust to the content.

### 2. Fable: The AI Book Buddy
Fable is a RAG-based (Retrieval-Augmented Generation) AI companion designed to act as a co-reader. 
- **Peer-to-Peer Interaction**: Eschewing a formal teacher persona, Fable discusses the text as an enthusiastic student.
- **Context Awareness**: leverages current page content, highlights, and user notes to provide insightful reflections.
- **Calibration**: Adapts tone and complexity based on user profile settings, including age and reading goals.

### 3. Adaptive Assessment System
To reinforce learning, HistoriArt utilizes a dynamic quiz system:
- **AI-Generated Content**: Quizzes are generated on-the-fly based on specific chapter content.
- **Diverse Formats**: Supports multiple choice, true/false, and short answer questions.
- **Supportive Feedback**: Results are reviewed by Fable, providing constructive and friendly feedback rather than academic grading.

### 4. Admin & Content Management
A robust administrative suite allows for complete control over the platform's library:
- **Page Editor**: Real-time content editing with specialized versioning.
- **Media Annotation**: Drag-and-drop tools for pinning media to specific text passages.
- **Security**: Multi-factor authentication via PIN verification for administrative actions and account lockout policies.

## Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/) (via Neon/Serverless)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **AI Integration**: [OpenAI GPT-4o](https://openai.com/), [Google Gemini Pro](https://ai.google.dev/)
- **State Management**: [React Query](https://tanstack.com/query/latest)

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database instance

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/LucaasPhan/HistoriArt.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (refer to `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Initialize the database:
   ```bash
   npm run db:generate
   ```
5. Apply migrations:
   ```bash
   npm run db:migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```bash
src/
├── app/          # Next.js App Router and API routes
├── components/   # Shared UI components (Radix, ShadUI)
├── dal/          # Data Access Layer & Session logic
├── drizzle/      # Database schema and migrations
├── features/     # Domain-driven feature modules (Read, Quiz, Admin)
├── hooks/        # Custom React hooks
├── lib/          # Utilities (i18n, prompts, helpers)
└── types/        # TypeScript interfaces and types
```

## Security & Reliability

HistoriArt implements several layers of protection to ensure a safe learning environment:
- **Rate Limiting**: AI interactions are throttled to prevent abuse.
- **PIN Lockout**: Security mechanisms prevent brute-force attempts on administrative panels.
- **Session Verification**: Secure server-side session checks for all protected routes.

---
Developed with passion for Vietnamese History.
