export type DiffLine =
  | { type: "hunk"; content: string }
  | { type: "context"; oldLine: number; newLine: number; content: string }
  | { type: "addition"; newLine: number; content: string }
  | { type: "deletion"; oldLine: number; content: string };

export type DiffFile = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  lines: DiffLine[];
};

export type PullRequest = {
  number: number;
  title: string;
  description: string;
  author: string;
  branch: string;
  baseBranch: string;
  files: DiffFile[];
};

export type Comment = {
  id: string;
  filePath: string;
  lineNumber: number;
  body: string;
  createdAt: string;
};

export type Session = {
  id: string;
  token: string;
  candidateName: string;
  createdAt: string;
  submittedAt?: string;
  summary?: string;
  comments: Comment[];
};

export type CandidateSessionView = Omit<Session, "id">;
