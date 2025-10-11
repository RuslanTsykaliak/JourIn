# JourIn: AI-Powered Journaling and Professional Networking

**Live Demo: [https://jour-in.vercel.app/](https://jour-in.vercel.app/)**

JourIn is a comprehensive, AI-powered application designed for personal and professional growth. It seamlessly integrates daily journaling and professional content creation to help you reflect, improve, and build your personal brand. Built with a modern tech stack including Next.js, TypeScript, Prisma, and the Groq API, JourIn transforms your private reflections into engaging, shareable posts for platforms like LinkedIn.

## Features

*   **Smart Journaling:** A simple and clean interface to jot down your thoughts. The journaling form includes default prompts and allows for the creation of custom, user-defined fields.
*   **AI-Powered Content Creation:** With the click of a button, generate professional LinkedIn posts based on your journal entries. The AI follows a proven "Hook → Re-hook → Body/Value → CTA" structure to maximize engagement.
*   **Streak Counter & Gamification:** Stay motivated with a streak counter that tracks your daily journaling. Receive rewards for reaching significant milestones.
*   **Dual Storage System:** A seamless experience for both guest and authenticated users. Guests' data is stored in `localStorage`, while authenticated users' data is persisted in a database.
*   **User Authentication:** Secure user authentication with NextAuth.js, supporting email and password login.
*   **Customizable Prompts:** Tailor the AI's content generation by customizing the prompt template to fit your style and goals.
*   **Dark Mode:** A beautiful dark mode for comfortable journaling at any time of day.
*   **Responsive Design:** Fully responsive design that works on all devices.

## Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (React), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction), [Prisma](https://www.prisma.io/)
*   **Database:** MongoDB managed with Prisma
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **AI Integration:** [Groq API](https://groq.com/)
*   **Testing:** [Jest](https://jestjs.io/) & [Testing Library](https://testing-library.com/)

## Architecture

JourIn is built on a modern web architecture that separates the frontend and backend concerns while leveraging the power of Next.js.

*   **Client-Side:** The frontend is built with React and Next.js, providing a fast and interactive user experience. It uses React Hooks and the Context API for state management. For guest users, all data is persisted in the browser's `localStorage`.
*   **Server-Side:** The backend is powered by Next.js API Routes, which provide a serverless environment for handling API requests. This is where the application interacts with the database via Prisma and communicates with the Groq API for AI-powered content generation.

For a more detailed breakdown of the architecture, please refer to the architecture documentation.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.x or later)
*   npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/RuslanTsykaliak/JourIn.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Running the Development Server

Run the following command to start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests

To run the test suite, use the following command:

```bash
npm test
```

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
