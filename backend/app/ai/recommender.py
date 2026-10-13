from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.availability import Availability
from app.models.review import Review
from app.models.session import Session as LearningSession
from app.models.trust_score import TrustScore
from app.config import settings

PROFICIENCY_WEIGHTS = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3,
    "expert": 4
}

class AIMatchingEngine:
    """
    Modular Campus Peer-Learning AI Matching Engine.
    Uses multi-criteria weighted scoring across skill relevance, proficiency compatibility,
    schedule overlap, Trust Score, peer review ratings, and campus preferences.
    """

    @staticmethod
    def evaluate_mentor(
        db: Session,
        mentor: User,
        target_skill: Skill,
        user_skill_record: UserSkill,
        current_level: str = "Beginner",
        desired_level: str = "Intermediate",
        preferred_mode: str = "Any",
        preferred_days: List[str] = None,
        preferred_time: Optional[str] = None
    ) -> Dict[str, Any]:
        preferred_days = preferred_days or []
        
        # 1. Skill Match Score (Weight: 35%)
        # Base 85 for exact skill match; +15 if verified by campus or certified
        skill_score = 85.0
        if user_skill_record.verification_status.lower() in ["verified", "certified"]:
            skill_score = 100.0

        # 2. Proficiency Compatibility (Weight: 20%)
        m_level_val = PROFICIENCY_WEIGHTS.get(user_skill_record.proficiency_level.lower(), 2)
        d_level_val = PROFICIENCY_WEIGHTS.get(desired_level.lower(), 2)
        c_level_val = PROFICIENCY_WEIGHTS.get(current_level.lower(), 1)

        if m_level_val > d_level_val:
            prof_score = 100.0
        elif m_level_val == d_level_val:
            prof_score = 90.0
        elif m_level_val > c_level_val:
            prof_score = 75.0
        else:
            prof_score = 45.0
            
        # Add slight bonus for years of experience
        prof_score = min(100.0, prof_score + min(10.0, user_skill_record.years_of_experience * 2.5))

        # 3. Availability Overlap (Weight: 15%)
        mentor_availabilities = db.query(Availability).filter(
            Availability.user_id == mentor.id,
            Availability.available == True
        ).all()
        mentor_days = [a.day for a in mentor_availabilities]

        if not preferred_days:
            # If learner didn't specify day constraints, any mentor with open slots scores high
            avail_score = 85.0 if mentor_days else 60.0
            matched_days_str = ", ".join(set(mentor_days[:3])) if mentor_days else "Flexible schedule"
        else:
            overlapping_days = [d for d in preferred_days if d in mentor_days]
            if overlapping_days:
                ratio = len(overlapping_days) / len(preferred_days)
                avail_score = min(100.0, 70.0 + (ratio * 30.0))
                matched_days_str = ", ".join(overlapping_days)
            else:
                avail_score = 40.0
                matched_days_str = ", ".join(mentor_days[:2]) if mentor_days else "Flexible schedule"

        # 4. Trust Score (Weight: 10%)
        ts_record = db.query(TrustScore).filter(TrustScore.user_id == mentor.id).first()
        trust_score_val = ts_record.score if ts_record else 75.0
        trust_score_component = trust_score_val

        # 5. Rating Score (Weight: 10%)
        reviews = db.query(Review).filter(Review.reviewed_user_id == mentor.id).all()
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            rating_score = (avg_rating / 5.0) * 100.0
        else:
            avg_rating = 4.5  # Campus default for active peer mentors
            rating_score = 80.0

        # 6. Preferences & Campus Synergy (Weight: 10%)
        pref_score = 85.0
        # Mode check
        if preferred_mode and preferred_mode != "Any":
            if preferred_mode.lower() in (mentor.learning_preferences or "").lower():
                pref_score += 15.0
        # Academic year synergy: senior students mentoring juniors get bonus
        if mentor.year in ["Third Year", "Fourth Year"]:
            pref_score = min(100.0, pref_score + 5.0)

        # Weighted calculation
        total_score = (
            (skill_score * settings.WEIGHT_SKILL_MATCH) +
            (prof_score * settings.WEIGHT_PROFICIENCY) +
            (avail_score * settings.WEIGHT_AVAILABILITY) +
            (trust_score_component * settings.WEIGHT_TRUST_SCORE) +
            (rating_score * settings.WEIGHT_RATING) +
            (pref_score * settings.WEIGHT_PREFERENCES)
        )
        total_score = round(max(10.0, min(99.0, total_score)), 1)

        # Completed sessions count
        completed_sessions = db.query(LearningSession).filter(
            LearningSession.mentor_id == mentor.id,
            LearningSession.status.ilike("completed")
        ).count()

        # Build dynamic explanation
        exp_parts = [
            f"Recommended because {mentor.first_name} has {user_skill_record.proficiency_level} {target_skill.name} skills with {user_skill_record.years_of_experience:.1f} yr(s) practical experience"
        ]
        if matched_days_str and matched_days_str != "Flexible schedule":
            exp_parts.append(f"has availability matching your schedule ({matched_days_str})")
        else:
            exp_parts.append("maintains flexible weekly peer-learning availability")
            
        if completed_sessions > 0:
            exp_parts.append(f"has successfully completed {completed_sessions} peer session(s) with a {trust_score_val:.0f}% Trust Score ({avg_rating:.1f}★ rating)")
        else:
            exp_parts.append(f"has a verified {trust_score_val:.0f}% Trust Score as a peer mentor in {mentor.department}")

        explanation = ", ".join(exp_parts) + "."

        return {
            "match_score": total_score,
            "explanation": explanation,
            "proficiency_level": user_skill_record.proficiency_level,
            "years_of_experience": user_skill_record.years_of_experience,
            "trust_score": trust_score_val,
            "average_rating": round(avg_rating, 1),
            "completed_sessions": completed_sessions,
            "available_days": list(set(mentor_days))
        }

recommender = AIMatchingEngine()
