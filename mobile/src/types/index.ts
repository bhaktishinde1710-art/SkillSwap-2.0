export type UserRole = 'student' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'suspended' | 'rejected';
export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SkillPriority = 'Low' | 'Medium' | 'High';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type SessionMode = 'Online' | 'Offline';
export type SessionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Scheduled' | 'Completed' | 'Cancelled';

export interface User {
  id: number;
  college_email: string;
  first_name: string;
  last_name: string;
  college: string;
  department: string;
  year: string;
  profile_photo?: string | null;
  bio?: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
  learning_preferences?: string | null;
  onboarding_completed: boolean;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  created_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  proficiency_level: SkillProficiency;
  years_of_experience: number;
  verification_status: 'unverified' | 'verified' | 'certified';
  skill: Skill;
}

export interface LearningInterest {
  id: number;
  user_id: number;
  skill_id: number;
  desired_level: SkillProficiency;
  priority: SkillPriority;
  skill: Skill;
}

export interface Availability {
  id: number;
  user_id: number;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface TrustScore {
  id: number;
  user_id: number;
  score: number;
  reliability_score: number;
  teaching_score: number;
  review_score: number;
  completion_score: number;
  calculated_at: string;
}

export interface UserDetail extends User {
  teaching_skills: UserSkill[];
  learning_interests: LearningInterest[];
  availabilities: Availability[];
  trust_score?: TrustScore | null;
  completed_sessions_count: number;
  average_rating: number;
  total_reviews_count: number;
}

export interface SessionItem {
  id: number;
  learner_id: number;
  mentor_id: number;
  skill_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  mode: SessionMode;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
  status: SessionStatus;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
  learner: User;
  mentor: User;
  skill: Skill;
}

export interface ReviewItem {
  id: number;
  session_id: number;
  reviewer_id: number;
  reviewed_user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: User;
  reviewed_user?: User;
}

export interface MentorRecommendation {
  mentor: User;
  matched_skill: Skill;
  match_score: number;
  explanation: string;
  proficiency_level: string;
  years_of_experience: number;
  trust_score: number;
  average_rating: number;
  completed_sessions: number;
  available_days: string[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}

export interface ReportItem {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  reporter: User;
  reported_user: User;
}

export interface AdminOverview {
  total_students: number;
  verified_students: number;
  suspended_users: number;
  active_mentors: number;
  total_sessions: number;
  completed_sessions: number;
  pending_sessions: number;
  cancelled_sessions: number;
  completion_rate: number;
  pending_reports: number;
  average_rating: number;
}

export interface AdminAnalytics {
  departments: { department: string; count: number }[];
  popular_skills: { skill: string; mentors: number }[];
  sessions_breakdown: { status: string; count: number }[];
  rating_distribution: { stars: string; count: number }[];
  year_distribution: { year: string; students: number }[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
