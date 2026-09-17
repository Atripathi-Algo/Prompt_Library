import { Nav } from "@/components/nav";
import { PromptAssistant } from "@/components/prompt-assistant";

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Prompt Assistant
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Draft an idea, see if something similar already exists in the library, and
          optionally have Claude, ChatGPT, Gemini, or Groq sharpen it before you submit.
        </p>

        <PromptAssistant />
      </main>
    </div>
  );
}
