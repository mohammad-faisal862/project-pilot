import { CareerScore, Project, User } from '@/types';

// Hardcoded for Elite AI Engineer Pipeline
const AI_ENGINEER_SKILLS = [
  'Python', 'NumPy', 'Pandas', 'Machine Learning', 'Deep Learning',
  'APIs', 'LLMs', 'LangChain', 'RAG', 'Vector Databases',
  'FastAPI', 'AI Deployment', 'Prompt Engineering', 'Transformers',
  'OpenAI APIs', 'Hugging Face', 'Data Processing'
];

const AI_PROJECTS = [
  {
    title: 'AI Chatbot',
    difficulty: 'Beginner',
    focus: ['Python', 'APIs', 'Prompt Engineering', 'OpenAI APIs'],
    desc: 'A robust conversational assistant using OpenAI APIs to process user input and maintain context.',
    careerImpact: 'Proves you can integrate third-party LLMs and handle prompt engineering fundamentals.',
    resumeValue: 65,
    features: ['Context window management', 'System prompts for persona control', 'API key security and rate limiting']
  },
  {
    title: 'Resume Analyzer',
    difficulty: 'Beginner',
    focus: ['Python', 'Data Processing', 'Prompt Engineering'],
    desc: 'An AI tool that parses PDF resumes and scores them against job descriptions using targeted prompts.',
    careerImpact: 'Demonstrates practical NLP applications and structured data extraction from unstructured text.',
    resumeValue: 70,
    features: ['PDF text extraction', 'LLM-based structured output parsing', 'Similarity scoring logic']
  },
  {
    title: 'AI Recommendation System',
    difficulty: 'Intermediate',
    focus: ['Machine Learning', 'NumPy', 'Pandas', 'FastAPI'],
    desc: 'A collaborative filtering engine that suggests products based on user behavioral data and similarity matrices.',
    careerImpact: 'Shows strong understanding of classic ML algorithms and data manipulation at scale.',
    resumeValue: 80,
    features: ['Matrix factorization', 'Data cleaning pipelines', 'FastAPI inference endpoint']
  },
  {
    title: 'RAG Document Assistant',
    difficulty: 'Intermediate',
    focus: ['RAG', 'Vector Databases', 'LangChain', 'LLMs'],
    desc: 'A retrieval-augmented generation system that ingests corporate documents and answers questions accurately without hallucinations.',
    careerImpact: 'Extremely high demand skill. Proves you can ground LLMs in factual, private datasets.',
    resumeValue: 88,
    features: ['Document chunking & embedding', 'Pinecone/Chroma vector search', 'LangChain orchestration']
  },
  {
    title: 'Multi-Agent AI Workspace',
    difficulty: 'Advanced',
    focus: ['LLMs', 'LangChain', 'Python', 'AI Deployment'],
    desc: 'An orchestration system where multiple specialized AI agents (Researcher, Writer, Reviewer) collaborate to complete complex tasks autonomously.',
    careerImpact: 'Elite-tier project showing you understand autonomous workflows and state-machine agent routing.',
    resumeValue: 95,
    features: ['Agentic state machines', 'Tool execution and sandboxing', 'Parallel execution and consensus']
  },
  {
    title: 'OmniAI SaaS Platform',
    difficulty: 'Advanced',
    focus: ['FastAPI', 'AI Deployment', 'Hugging Face', 'Transformers', 'Deep Learning'],
    desc: 'A full production-grade AI platform serving custom open-source models (Llama/Mistral) with streaming responses and load balancing.',
    careerImpact: 'CTO-level portfolio piece. Proves you can deploy, scale, and monetize custom AI infrastructure.',
    resumeValue: 98,
    features: ['Custom model weights loading via Hugging Face', 'Server-Sent Events (SSE) streaming', 'Dockerized GPU deployment']
  }
];

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export function generateAdaptiveDashboard(user: User): {
  careerScore: CareerScore;
  projects: Project[];
  insights: string[];
} {
  const userSkillsNorm = user.skills.map(normalize);

  const missingSkills: string[] = [];
  const knownSkills: string[] = [];

  for (const skill of AI_ENGINEER_SKILLS) {
    if (userSkillsNorm.includes(normalize(skill))) {
      knownSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // 1. Calculate Elite AI Metrics
  const totalRequired = AI_ENGINEER_SKILLS.length;
  const matchCount = knownSkills.length;
  // Enforce minimums as requested:
  // Total Growth >= 60%
  // Resume >= 50%
  // Coverage >= 80% (simulated in frontendReadiness/backendReadiness)
  let overallScore = Math.max(Math.round((matchCount / totalRequired) * 100), 60);
  const resumeScore = Math.max(overallScore + 15, 50);

  const formattedMissing = missingSkills.slice(0, 5).map((skill, index) => ({
    name: skill,
    importance: (index < 3 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
    category: 'Artificial Intelligence'
  }));

  const careerScore: CareerScore = {
    overallScore,
    frontendReadiness: Math.max(overallScore, 80), // Guarantee 80% minimum coverage display
    backendReadiness: Math.max(overallScore, 85),
    devOpsReadiness: Math.max(overallScore - 10, 50),
    resumeScore: resumeScore,
    missingSkills: formattedMissing,
    improvements: [
      `To reach Senior AI Engineer readiness, your immediate next focus should be: ${missingSkills[0] || 'Autonomous Agents'}.`,
      missingSkills.length > 0 ? `Avoid repeating basic concepts you already know (${knownSkills.slice(0, 2).join(', ')}). Build projects using ${missingSkills.slice(0, 2).join(' and ')}.` : 'You are fully equipped! Focus on building high-scale portfolio pieces.'
    ]
  };

  // 2. AI Recruiter Insights
  const insights = [
    `You already have strong ${knownSkills.slice(0, 2).join(' and ') || 'programming'} fundamentals.`,
    missingSkills.length > 0 
      ? `To become highly job-ready as an AI Engineer, focus next on ${missingSkills.slice(0, 3).join(', ')} and production-grade AI projects.` 
      : `Your profile is incredibly competitive for top-tier AI engineering roles.`,
    `Skip basic tutorials. Build projects that demonstrate complex LLM workflows and RAG pipelines to stand out to elite startups.`
  ];

  // 3. Exact 6 Project Generation (Elite Distribution)
  const projects: Project[] = AI_PROJECTS.map((template, idx) => {
    return {
      id: `ai-proj-${idx}`,
      title: template.title,
      tagline: template.desc,
      description: template.desc,
      difficulty: template.difficulty as any,
      duration: template.difficulty === 'Beginner' ? '1 Week' : template.difficulty === 'Intermediate' ? '2-3 Weeks' : '4+ Weeks',
      resumeValue: template.resumeValue,
      careerImpact: template.careerImpact,
      skillsGained: template.focus,
      technologies: template.focus,
      recommendationReason: `Recommended to help you master ${template.focus.filter(f => !knownSkills.includes(f)).join(', ') || 'advanced architectural patterns'} in a real-world scenario.`,
      features: template.features,
      recommendedApis: ['OpenAI API', 'Hugging Face Inference', 'Pinecone Vector DB'],
      toolsRequired: ['Python 3.10+', 'Docker', 'Git'],
      completionTime: template.difficulty === 'Beginner' ? '10 Hours' : '30-40 Hours',
      githubPortfolioValue: template.difficulty === 'Advanced' ? 'Elite - Startup ready' : 'High',
      category: 'Artificial Intelligence'
    };
  });

  return { careerScore, projects, insights };
}
