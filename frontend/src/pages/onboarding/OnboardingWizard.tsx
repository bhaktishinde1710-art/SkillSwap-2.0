import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  Plus, 
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { skillService } from '../../services/skillService';
import { userService } from '../../services/userService';
import { Skill } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [bio, setBio] = useState(user?.bio || 'Engineering student eager to learn and share practical coding skills.');
  const [learningPreferences, setLearningPreferences] = useState('Online & VIT Library Discussion Rooms');
  const [department, setDepartment] = useState(user?.department || 'Computer Science Engineering (CSE)');
  const [year, setYear] = useState(user?.year || 'Third Year');
  
  // Selected Skills to teach
  const [teachingSkills, setTeachingSkills] = useState<Array<{ skill_id: number; proficiency_level: string; years_of_experience: number }>>([]);
  // Selected Skills to learn
  const [learningInterests, setLearningInterests] = useState<Array<{ skill_id: number; desired_level: string; priority: string }>>([]);
  // Weekly availability
  const [availabilities, setAvailabilities] = useState<Array<{ day: string; start_time: string; end_time: string; available: boolean }>>([
    { day: 'Tuesday', start_time: '16:00', end_time: '18:00', available: true },
    { day: 'Thursday', start_time: '18:30', end_time: '20:30', available: true }
  ]);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const skills = await skillService.getSkills();
        setAvailableSkills(skills);
        // Pre-select 1 or 2 as starter recommendations
        if (skills.length > 0 && teachingSkills.length === 0) {
          const dsa = skills.find(s => s.name.includes('DSA')) || skills[0];
          setTeachingSkills([{ skill_id: dsa.id, proficiency_level: 'Advanced', years_of_experience: 2.0 }]);
        }
        if (skills.length > 1 && learningInterests.length === 0) {
          const ml = skills.find(s => s.name.includes('Machine Learning')) || skills[1];
          setLearningInterests([{ skill_id: ml.id, desired_level: 'Intermediate', priority: 'High' }]);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const totalSteps = 8;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await userService.completeOnboarding({
        department,
        year,
        bio,
        learning_preferences: learningPreferences,
        teaching_skills: teachingSkills,
        learning_interests: learningInterests,
        availabilities: availabilities
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      alert('Could not save onboarding profile. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTeachingSkill = (skillId: number) => {
    if (teachingSkills.some(s => s.skill_id === skillId)) {
      setTeachingSkills(prev => prev.filter(s => s.skill_id !== skillId));
    } else {
      setTeachingSkills(prev => [...prev, { skill_id: skillId, proficiency_level: 'Intermediate', years_of_experience: 1.0 }]);
    }
  };

  const toggleLearningInterest = (skillId: number) => {
    if (learningInterests.some(s => s.skill_id === skillId)) {
      setLearningInterests(prev => prev.filter(s => s.skill_id !== skillId));
    } else {
      setLearningInterests(prev => [...prev, { skill_id: skillId, desired_level: 'Intermediate', priority: 'High' }]);
    }
  };

  const addAvailabilitySlot = (day: string) => {
    if (!availabilities.some(a => a.day === day)) {
      setAvailabilities(prev => [...prev, { day, start_time: '16:00', end_time: '18:00', available: true }]);
    }
  };

  const removeAvailabilitySlot = (day: string) => {
    setAvailabilities(prev => prev.filter(a => a.day !== day));
  };

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      
      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-indigo-600 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-slate-700 font-extrabold">{progressPercent}% Profile Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-sm min-h-[420px] flex flex-col justify-between">
        
        {/* Step 1: Basic Profile */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 1: Basic Campus Profile</h2>
              <p className="text-xs text-slate-500">Introduce yourself to peers and future mentees at VIT Pune.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About You & Mentoring Motto
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell peers what you love building, your contest handle, or topics you enjoy explaining..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs text-indigo-900">
                  Registered as <strong className="font-semibold">{user?.first_name} {user?.last_name}</strong> ({user?.college_email})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Department and Academic Year */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 2: Department & Academic Year</h2>
              <p className="text-xs text-slate-500">Ensures accurate branch and senior-junior mentoring synergy.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  VIT Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Computer Science Engineering (CSE)">Computer Science Engineering (CSE)</option>
                  <option value="CSE (Artificial Intelligence)">CSE (Artificial Intelligence)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Artificial Intelligence & Data Science (AI&DS)">Artificial Intelligence & Data Science (AI&DS)</option>
                  <option value="Electronics & Telecommunication (E&TC)">Electronics & Telecommunication (E&TC)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Instrumentation & Control Engineering">Instrumentation & Control Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="First Year">First Year (FY)</option>
                  <option value="Second Year">Second Year (SY)</option>
                  <option value="Third Year">Third Year (TY)</option>
                  <option value="Fourth Year">Fourth Year (Final Year)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Skills you can teach */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 3: Skills You Can Teach</h2>
              <p className="text-xs text-slate-500">Select skills you feel comfortable mentoring peers in.</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {availableSkills.map((sk) => {
                const isSelected = teachingSkills.some(s => s.skill_id === sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleTeachingSkill(sk.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{sk.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Skills you want to learn */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 4: Skills You Want to Learn</h2>
              <p className="text-xs text-slate-500">Pick technologies you want to master this semester.</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {availableSkills.map((sk) => {
                const isSelected = learningInterests.some(s => s.skill_id === sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleLearningInterest(sk.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{sk.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Skill Proficiency Configuration */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 5: Skill Proficiency Level</h2>
              <p className="text-xs text-slate-500">Specify your proficiency for the skills you selected to teach.</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {teachingSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No teaching skills selected in Step 3. (You can still learn!)</p>
              ) : (
                teachingSkills.map((ts, idx) => {
                  const skillObj = availableSkills.find(s => s.id === ts.skill_id);
                  return (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <span className="font-bold text-xs text-slate-800">{skillObj?.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={ts.proficiency_level}
                          onChange={(e) => {
                            const newLevel = e.target.value;
                            setTeachingSkills(prev => prev.map((s, i) => i === idx ? { ...s, proficiency_level: newLevel } : s));
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>

                        <div className="flex items-center gap-1 text-xs">
                          <input
                            type="number"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={ts.years_of_experience}
                            onChange={(e) => {
                              const exp = parseFloat(e.target.value) || 1.0;
                              setTeachingSkills(prev => prev.map((s, i) => i === idx ? { ...s, years_of_experience: exp } : s));
                            }}
                            className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                          />
                          <span className="text-slate-400 text-[10px]">yrs</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Step 6: Learning Preferences */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 6: Learning Preferences</h2>
              <p className="text-xs text-slate-500">How do you prefer to conduct or attend peer-learning sessions?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Session Mode & Venue
                </label>
                <select
                  value={learningPreferences}
                  onChange={(e) => setLearningPreferences(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Online (Google Meet)">Online (Google Meet)</option>
                  <option value="In-Person on VIT Campus (Central Library Pods)">In-Person on VIT Campus (Central Library Pods)</option>
                  <option value="Hybrid (Both Online & VIT Pune Discussion Rooms)">Hybrid (Both Online & VIT Pune Discussion Rooms)</option>
                </select>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Campus safety note:</strong> In-person sessions take place in designated campus learning spaces (VIT Pune Library Discussion Pods or Department Study Centers).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Availability */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Step 7: Weekly Free Slots</h2>
              <p className="text-xs text-slate-500">Choose days when you are typically free for 1-on-1 peer sessions.</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {daysList.map((day) => {
                  const active = availabilities.some(a => a.day === day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => active ? removeAvailabilitySlot(day) : addAvailabilitySlot(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {day} {active && '✓'}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                {availabilities.map((av, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-800">{av.day}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={av.start_time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAvailabilities(prev => prev.map((item, i) => i === idx ? { ...item, start_time: val } : item));
                        }}
                        className="p-1 bg-white border border-slate-200 rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={av.end_time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAvailabilities(prev => prev.map((item, i) => i === idx ? { ...item, end_time: val } : item));
                        }}
                        className="p-1 bg-white border border-slate-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(av.day)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Profile Completion Summary */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">You're All Set!</h2>
              <p className="text-xs text-slate-500">Here is a quick summary of your peer-learning profile.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Department & Year</span>
                <span className="font-bold text-slate-800">{department} • {year}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Teaching Skills</span>
                <span className="font-bold text-emerald-700">{teachingSkills.length} selected</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Learning Goals</span>
                <span className="font-bold text-indigo-700">{learningInterests.length} selected</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Weekly Free Slots</span>
                <span className="font-bold text-slate-800">{availabilities.length} active slots</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Initial Trust Score</span>
                <span className="font-extrabold text-indigo-600">80/100 (Neutral Verified Baseline)</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              {submitting ? 'Setting up Dashboard...' : 'Launch SkillSwap 2.0'}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
