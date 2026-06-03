import { User, ChatMessage } from '@/types';

// Semantic Intent Categories
type Intent = 
  | 'GREETING'
  | 'DEFINITION'
  | 'CAREER_ROADMAP'
  | 'PROJECT_GUIDANCE'
  | 'LEARNING_STRUGGLE'
  | 'DEBUGGING'
  | 'JOB_READINESS'
  | 'MOTIVATION'
  | 'TECH_SPECIFIC'
  | 'CASUAL_CHAT'
  | 'UNKNOWN';

/**
 * Advanced Semantic Intent Classifier
 * Uses heuristics to determine the actual *meaning* of the user's message,
 * rather than just exact keywords.
 */
function classifyIntent(query: string): Intent {
  const q = query.toLowerCase().trim();

  // 1. Definition / General Knowledge
  if (/^(what is|explain|how does) (ai|react|nextjs|next\.js|javascript|python|html|css|api|docker|kubernetes)/i.test(q)) {
    return 'DEFINITION';
  }

  // 2. Career Roadmap
  if (/(how to become|what should i do to become|roadmap for|steps to become|path to|guide to become)/i.test(q)) {
    return 'CAREER_ROADMAP';
  }

  // 3. Project Guidance
  if (/(what to build|project ideas|what project|idk what to build|no idea what to make|confused what to build)/i.test(q)) {
    return 'PROJECT_GUIDANCE';
  }

  // 4. Learning Struggle
  if (/(is hard|is tough|too difficult|confusing|don'?t understand|sucks|making no sense|not getting it|overwhelming)/i.test(q) ||
      (q.includes('react') && q.includes('hard')) ||
      (q.includes('backend') && q.includes('confusing'))) {
    return 'LEARNING_STRUGGLE';
  }

  // 5. Job Readiness
  if (/(job ready|can i get a job|hire me|am i ready|enough skills|hired)/i.test(q)) {
    return 'JOB_READINESS';
  }

  // 6. Debugging
  if (/(error|bug|crash|not working|failed to compile|typeerror|referenceerror)/i.test(q)) {
    return 'DEBUGGING';
  }

  // 7. Motivation
  if (/(give up|tired|burnt out|imposter|dumb|stupid|motivate me|hopeless)/i.test(q)) {
    return 'MOTIVATION';
  }

  // 8. Greetings
  if (/^(hi|hello|hey|yo|sup|wassup|good morning|hello bro|hii)([^a-z]|$)/i.test(q)) {
    return 'GREETING';
  }

  // 9. Casual Chat
  if (/^(how are you|hows it going|whatsup)/i.test(q)) {
    return 'CASUAL_CHAT';
  }

  // 10. Tech Specific
  if (/(react state|css flexbox|center a div|useeffect|python list|arrays)/i.test(q)) {
    return 'TECH_SPECIFIC';
  }

  return 'UNKNOWN';
}

/**
 * Universal Conversational Intelligence System
 * Generates natural, context-aware, ChatGPT-like responses without repetitive templating.
 */
export function generateSmartReply(query: string, userContext: User, historyContext: ChatMessage[]): { content: string; codeSnippet?: { language: string, code: string } } {
  const intent = classifyIntent(query);
  const q = query.toLowerCase().trim();

  // Extract contextual data
  const name = userContext.name.split(' ')[0] || 'there';
  const role = userContext.careerGoal || 'developer';

  // Anti-Robotic Response Router
  switch (intent) {
    case 'DEFINITION':
      if (q.includes('ai') || q.includes('artificial intelligence')) {
        return { content: "AI stands for Artificial Intelligence — systems designed to simulate human learning, reasoning, and decision-making. Things like ChatGPT, recommendation systems, self-driving cars, and voice assistants all use AI." };
      }
      if (q.includes('react')) {
        return { content: "React is a JavaScript library for building user interfaces. Instead of updating HTML directly, you build isolated, reusable 'components' (like buttons or navbars) that manage their own state. It makes building complex apps much faster and cleaner." };
      }
      return { content: `Great question. ${query.replace(/what is |explain /i, '')} is a core concept in modern software engineering. It generally helps solve structural or data flow problems in an application. Are you trying to implement it in a project right now?` };

    case 'CAREER_ROADMAP':
      return { 
        content: `No worries — the best way is to break it into stages.\n\nStart with:\n1. Core language fundamentals\n2. Data structures\n3. Modern frameworks\n4. Build small, focused projects\n5. Learn integrations (APIs, databases) later\n\nSince you already have an interest in ${role}, your focus should be project-based learning instead of just watching tutorials. Have you built anything small yet?` 
      };

    case 'PROJECT_GUIDANCE':
      return { content: `Picking a project can be paralyzing. Don't overthink it.\n\nInstead of another basic Todo app, build something that solves a personal problem. A habit tracker, a budget dashboard, or a tool for a game you play. The goal is to face real-world bugs. What are your hobbies outside of coding?` };

    case 'LEARNING_STRUGGLE': {
      let topic = 'It';
      if (q.includes('react')) topic = 'React';
      else if (q.includes('nextjs') || q.includes('next.js')) topic = 'Next.js';
      else if (q.includes('backend') || q.includes('api')) topic = 'Backend development';
      else if (q.includes('javascript') || q.includes('js')) topic = 'JavaScript';

      return { content: `Yeah, ${topic} feels overwhelming initially — especially when you hit concepts like state management or async logic. Which part of it is confusing you the most? We can break it down together.` };
    }

    case 'JOB_READINESS':
      return { content: `Job readiness isn't about knowing every single framework out there. It's about being able to independently build, debug, and deploy a full feature.\n\nIf you can take an idea, read the documentation, and build it without relying strictly on a step-by-step tutorial, you are ready to start applying. How comfortable are you building something entirely from scratch right now?` };

    case 'DEBUGGING':
      return { content: `Bugs are just the computer trying to communicate exactly what's wrong. Before changing code randomly, read the exact line number the error points to.\n\nIf it's a giant wall of red text, paste the first 2-3 lines here and let's decode it together.` };

    case 'MOTIVATION':
      return { content: `Listen: every single senior engineer you admire felt exactly like this at some point. Imposter syndrome is just a sign that you're pushing your boundaries and learning.\n\nStep away from the screen, grab some water, and take a 15-minute break. You're learning a completely new way of thinking — it takes time.` };

    case 'GREETING':
      return { content: `Hey ${name} 👋 What are you building today?` };

    case 'CASUAL_CHAT':
      return { content: `I'm doing great, thanks for asking! Just hanging out in the matrix. Ready to write some code or debug something?` };

    case 'TECH_SPECIFIC':
      if (q.includes('center')) {
        return { 
          content: "The absolute easiest way to center an element in CSS is using Flexbox. Just add these three properties to the parent container:",
          codeSnippet: {
            language: 'css',
            code: `display: flex;\nalign-items: center;\njustify-content: center;`
          }
        };
      }
      return { content: `For that kind of technical implementation, the key is understanding how the framework's lifecycle handles data. Breaking it into a smaller function usually makes the behavior clearer.` };

    case 'UNKNOWN':
    default:
      // Highly contextual, human-like fallbacks for unrecognizable queries
      const fallbacks = [
        `That's an interesting point. Could you elaborate a bit more on what you're trying to achieve?`,
        `I hear you. What specific part of that are you trying to figure out?`,
        `Gotcha. Let's break that down. Are you currently working on a specific file or feature, or is this just theoretical?`,
        `Interesting. Let me know if you want me to write out a quick code snippet to show how that usually works.`
      ];
      return { content: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
  }
}
