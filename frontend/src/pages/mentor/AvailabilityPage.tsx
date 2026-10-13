import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Availability } from '../../types';

export const AvailabilityPage: React.FC = () => {
  const [slots, setSlots] = useState<Array<{ day: string; start_time: string; end_time: string; available: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await userService.getMyAvailability();
        if (data.length > 0) {
          setSlots(data.map(d => ({ day: d.day, start_time: d.start_time, end_time: d.end_time, available: d.available })));
        } else {
          setSlots([
            { day: 'Tuesday', start_time: '16:00', end_time: '18:00', available: true },
            { day: 'Thursday', start_time: '18:30', end_time: '20:30', available: true }
          ]);
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const addSlot = () => {
    setSlots(prev => [...prev, { day: 'Monday', start_time: '16:00', end_time: '18:00', available: true }]);
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateSlot = (index: number, field: string, val: any) => {
    setSlots(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: val } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await userService.setMyAvailability(slots);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save availability:', err);
      alert('Could not update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/mentor" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mentor Hub
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Weekly Availability Schedule
          </h1>
          <p className="text-xs text-slate-500">
            Define recurring hours when peer learners can request sessions with you.
          </p>
        </div>

        <button
          onClick={addSlot}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Time Slot
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your weekly availability schedule has been updated!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading schedule...</div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No availability slots set. Click 'Add Time Slot' to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <select
                    value={slot.day}
                    onChange={(e) => updateSlot(idx, 'day', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => updateSlot(idx, 'start_time', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  <span className="text-slate-400 font-bold">to</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => updateSlot(idx, 'end_time', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => removeSlot(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
