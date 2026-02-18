import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, selectIsAdmin } from '../store';
import type { TripDay } from '../types';
import { Lock as LockIcon, Unlock, Edit2, Save, MapPin, GripVertical, Plus, Trash2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export function AdminProgramView() {
  const isAdmin = useStore(selectIsAdmin);
  const {
    days,
    updateDay,
    updateScheduleItem,
    addScheduleItem,
    removeScheduleItem,
    addDay,
    removeDay,
    reorderDays,
    reorderScheduleItems,
    adminToggleDayLock,
  } = useStore();

  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dayDropTargetId, setDayDropTargetId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<{ dayId: string; idx: number } | null>(null);
  const [itemDropTarget, setItemDropTarget] = useState<{ dayId: string; idx: number } | null>(null);

  const EditableDay = ({ day, index }: { day: TripDay; index: number }) => {
    const isEditing = editingDayId === day.id;
    if (!isEditing) {
      return (
        <div
          className={clsx(
            'bg-white border border-royal/10 rounded-xl p-6 group relative transition-all duration-200 ease-out',
            'hover:-translate-y-0.5 hover:border-royal/25 hover:bg-white/95',
            draggedDayId === day.id ? 'opacity-50 scale-[0.99]' : 'opacity-100',
            dayDropTargetId === day.id && draggedDayId !== day.id ? 'border-royal/40 bg-royal/[0.03]' : ''
          )}
          draggable
          onDragStart={(e) => {
            setDraggedDayId(day.id);
            setDayDropTargetId(null);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedDayId && draggedDayId !== day.id) {
              setDayDropTargetId(day.id);
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!draggedDayId || draggedDayId === day.id) return;
            const fromIndex = days.findIndex((d) => d.id === draggedDayId);
            if (fromIndex < 0) return;
            reorderDays(fromIndex, index);
            setDraggedDayId(null);
            setDayDropTargetId(null);
          }}
          onDragLeave={() => {
            if (dayDropTargetId === day.id) setDayDropTargetId(null);
          }}
          onDragEnd={() => {
            setDraggedDayId(null);
            setDayDropTargetId(null);
          }}
        >
          <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-royal/[0.03] flex items-center justify-center cursor-grab active:cursor-grabbing text-royal/25 group-hover:text-royal/60 transition-colors">
            <GripVertical size={16} />
          </div>
          <div className="flex justify-between items-start gap-4 mb-4 pl-8">
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-royal uppercase leading-none">{day.title}</h3>
              <p className="font-mono text-xs text-royal/60">{day.date} • {day.isChoiceDay ? 'Valgfri Dag' : 'Felles Dag'}</p>
              <p className="text-sm text-royal/80 text-readable mt-2 font-content">{day.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => adminToggleDayLock(day.id)}
                className={clsx(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/30',
                  day.isLocked
                    ? 'border-red-200 text-red-500 hover:bg-red-50'
                    : 'border-royal/10 text-royal/40 hover:text-royal hover:bg-royal/5'
                )}
                title={day.isLocked ? 'Lås opp' : 'Lås'}
              >
                {day.isLocked ? <LockIcon size={16} /> : <Unlock size={16} />}
              </button>
              <button
                onClick={() => setEditingDayId(day.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-royal/10 text-royal/40 hover:text-royal hover:bg-royal/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/30"
                title="Rediger dag"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-1.5 border-l border-royal/10 pl-4">
            {day.scheduleItems.map((item, i) => (
              <div
                key={item.id || `${day.id}-${i}`}
                className="flex gap-3 rounded-lg px-2 py-1.5 text-sm text-readable transition-colors duration-150 hover:bg-royal/[0.03]"
              >
                <span className="font-mono font-bold text-royal/60 w-12 shrink-0 tabular-nums">{item.time || '--:--'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-royal leading-tight">{item.activity || 'Uten aktivitet'}</p>
                  {item.location && (
                    <span className="inline-flex items-center gap-1 text-royal/50 mt-0.5 font-mono text-[10px] uppercase">
                      <MapPin size={10} />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white border border-royal/30 rounded-xl p-6 ring-1 ring-royal/10 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setEditingDayId(null)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono uppercase border border-green-200 text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200"
          >
            <Save size={14} />
            Lukk
          </button>
        </div>
        <div className="space-y-4 mb-6 pr-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-royal/40 text-readable-micro">Tittel</label>
              <input
                className="w-full border border-royal/20 focus:border-royal bg-white px-3 py-2 font-display font-bold text-lg text-royal rounded-md transition-colors duration-150"
                defaultValue={day.title}
                onBlur={(e) => updateDay(day.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-royal/40 text-readable-micro">Dato</label>
              <input
                type="date"
                className="w-full border border-royal/20 focus:border-royal bg-white px-3 py-2 font-mono text-sm rounded-md transition-colors duration-150"
                defaultValue={day.date}
                onBlur={(e) => updateDay(day.id, { date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-royal/40 text-readable-micro">Beskrivelse</label>
            <textarea
              className="w-full border border-royal/20 focus:border-royal bg-white text-sm p-3 rounded-md transition-colors duration-150"
              rows={2}
              defaultValue={day.description}
              onBlur={(e) => updateDay(day.id, { description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-royal/10 bg-royal/[0.02] px-3 py-2">
            <input type="checkbox" id={`choice-${day.id}`} checked={day.isChoiceDay} onChange={(e) => updateDay(day.id, { isChoiceDay: e.target.checked })} className="accent-royal" />
            <label htmlFor={`choice-${day.id}`} className="text-xs font-mono uppercase text-royal/80">Er dette en valgfri aktivitetsdag?</label>
          </div>
        </div>
        <div className="space-y-2.5">
          <label className="text-[10px] font-mono uppercase text-royal/40 text-readable-micro block mb-2">Tidsplan (Dra for å endre rekkefølge)</label>
          {day.scheduleItems.map((item, idx) => (
            <div
              key={item.id || `${day.id}-${idx}`}
              className={clsx(
                'group relative rounded-lg border border-royal/10 bg-white/80 px-2.5 py-2.5 pl-8 transition-all duration-150',
                'hover:border-royal/25 hover:bg-royal/[0.02]',
                draggedItemId?.dayId === day.id && draggedItemId.idx === idx ? 'opacity-50' : 'opacity-100',
                itemDropTarget?.dayId === day.id && itemDropTarget.idx === idx && draggedItemId?.idx !== idx
                  ? 'border-royal/40 bg-royal/[0.05]'
                  : ''
              )}
              draggable
              onDragStart={(e) => {
                setDraggedItemId({ dayId: day.id, idx });
                setItemDropTarget(null);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!draggedItemId || draggedItemId.dayId !== day.id || draggedItemId.idx === idx) return;
                setItemDropTarget({ dayId: day.id, idx });
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (!draggedItemId || draggedItemId.dayId !== day.id || draggedItemId.idx === idx) return;
                reorderScheduleItems(day.id, draggedItemId.idx, idx);
                setDraggedItemId(null);
                setItemDropTarget(null);
              }}
              onDragEnd={() => {
                setDraggedItemId(null);
                setItemDropTarget(null);
              }}
            >
              <div className="absolute left-2 top-3 cursor-grab active:cursor-grabbing text-royal/25 hover:text-royal/60 transition-colors">
                <GripVertical size={14} />
              </div>
              <input
                className="w-16 border-b border-royal/10 focus:border-royal bg-transparent font-mono text-xs py-1 transition-colors duration-150"
                defaultValue={item.time}
                onBlur={(e) => updateScheduleItem(day.id, idx, { time: e.target.value })}
                placeholder="00:00"
              />
              <div className="flex-1 space-y-1">
                <input
                  className="w-full border-b border-royal/10 focus:border-royal bg-transparent font-bold text-sm py-1 transition-colors duration-150"
                  defaultValue={item.activity}
                  onBlur={(e) => updateScheduleItem(day.id, idx, { activity: e.target.value })}
                  placeholder="Aktivitet..."
                />
                <input
                  className="w-full border-b border-royal/10 focus:border-royal bg-transparent font-mono text-[10px] text-royal/60 py-1 transition-colors duration-150"
                  defaultValue={item.location || ''}
                  onBlur={(e) => updateScheduleItem(day.id, idx, { location: e.target.value })}
                  placeholder="Sted (valgfritt)"
                />
              </div>
              <button
                onClick={() => removeScheduleItem(day.id, idx)}
                className="text-red-300 hover:text-red-500 p-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded"
                title="Fjern programpunkt"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => addScheduleItem(day.id)}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono uppercase border border-royal/15 text-royal/50 hover:text-royal hover:border-royal/30 px-2.5 py-1.5 rounded-md transition-colors duration-150"
          >
            <Plus size={12} /> Legg til punkt
          </button>
        </div>
      </div>
    );
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:p-6 md:p-12 py-8 md:py-12 space-y-6">
      <div>
        <Link to="/admin" className="text-royal/60 hover:text-royal flex items-center gap-2 font-mono text-xs uppercase">
          <ArrowLeft size={16} /> Tilbake til dashboard
        </Link>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-2 gap-3">
          <h2 className="font-display font-bold text-2xl text-royal uppercase">Rediger Program</h2>
          <button
            onClick={addDay}
            className="flex items-center gap-2 bg-royal text-white px-4 py-2 text-xs font-mono uppercase font-bold hover:bg-royal-dark rounded-md transition-colors duration-200"
          >
            <Plus size={14} /> Ny Dag
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger">
          {days.map((day, index) => (
            <div key={day.id} className="relative group">
              <EditableDay day={day} index={index} />
              {!editingDayId && (
                <button
                  onClick={() => { if (confirm('Sikker på at du vil slette denne dagen?')) removeDay(day.id); }}
                  className="absolute -top-2.5 -right-2.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 hover:scale-105 z-10"
                  title="Slett dag"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
