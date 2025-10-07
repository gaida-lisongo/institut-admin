"use client";
import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { Annee, EvenementCalendrier } from "@/types/annee";
import { useAnneeStore } from "@/stores/anneeStore";

interface CalendarEvent extends EventInput {
  extendedProps: {
    type: 'rentree' | 'examen' | 'vacances' | 'evenement' | 'autre';
    description: string;
    photo?: string;
  };
}

interface AnneeCalendarProps {
  annee: Annee;
}

const AnneeCalendar: React.FC<AnneeCalendarProps> = ({ annee }) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(-1);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventType, setEventType] = useState<EvenementCalendrier['type']>('evenement');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Utilisation du store pour les modifications
  const { 
    addEvenementToAnnee, 
    updateEvenementInAnnee, 
    deleteEvenementFromAnnee,
    loading 
  } = useAnneeStore();

  const eventTypeConfigs = {
    rentree: {
      color: "success",
      label: "Rentrée",
      bgColor: "#10b981"
    },
    examen: {
      color: "danger",
      label: "Examen",
      bgColor: "#ef4444"
    },
    vacances: {
      color: "warning",
      label: "Vacances",
      bgColor: "#f59e0b"
    },
    evenement: {
      color: "primary",
      label: "Événement",
      bgColor: "#3b82f6"
    },
    autre: {
      color: "secondary",
      label: "Autre",
      bgColor: "#6b7280"
    }
  };

  useEffect(() => {
    // Convertir les événements de l'année en événements du calendrier
    if (annee.calendrier) {
      const calendarEvents: CalendarEvent[] = annee.calendrier.map((event, index) => ({
        id: `event-${index}`,
        title: event.evenement,
        start: new Date(event.date).toISOString().split("T")[0],
        allDay: true,
        backgroundColor: eventTypeConfigs[event.type].bgColor,
        borderColor: eventTypeConfigs[event.type].bgColor,
        extendedProps: {
          type: event.type,
          description: event.description,
          photo: event.photo
        },
      }));
      setEvents(calendarEvents);
    }
  }, [annee]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const eventIndex = parseInt(event.id.replace('event-', ''));
    
    setSelectedEvent(event as unknown as CalendarEvent);
    setSelectedEventIndex(eventIndex);
    setEventTitle(event.title);
    setEventDescription(event.extendedProps.description || "");
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventType(event.extendedProps.type || 'evenement');
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) return;

    try {
      if (selectedEvent && selectedEventIndex >= 0) {
        // Update existing event
        const success = await updateEvenementInAnnee(annee._id, selectedEventIndex, {
          evenement: eventTitle,
          description: eventDescription,
          date: new Date(eventStartDate),
          type: eventType
        });
        
        if (success) {
          // L'événement sera mis à jour automatiquement via le store
          closeModal();
          resetModalFields();
        }
      } else {
        // Add new event
        const success = await addEvenementToAnnee(annee._id, {
          evenement: eventTitle,
          description: eventDescription,
          date: eventStartDate,
          type: eventType
        });
        
        if (success) {
          // L'événement sera ajouté automatiquement via le store
          closeModal();
          resetModalFields();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent && selectedEventIndex >= 0) {
      try {
        const success = await deleteEvenementFromAnnee(annee._id, selectedEventIndex);
        
        if (success) {
          // L'événement sera supprimé automatiquement via le store
          closeModal();
          resetModalFields();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
      }
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventDescription("");
    setEventStartDate("");
    setEventEndDate("");
    setEventType('evenement');
    setSelectedEvent(null);
    setSelectedEventIndex(-1);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Ajouter Événement +",
              click: openModal,
            },
          }}
          locale="fr"
          firstDay={1}
          height="auto"
        />
      </div>
      
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Modifier l'Événement" : "Ajouter un Événement"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Planifiez les événements académiques importants pour l'année {annee.debut}-{annee.fin}
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            {/* Titre de l'événement */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Titre de l'événement
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ex: Rentrée académique, Examens finaux..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Description
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Description détaillée de l'événement..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            {/* Type d'événement */}
            <div>
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Type d'événement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(eventTypeConfigs).map(([key, config]) => (
                  <label
                    key={key}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <input
                      type="radio"
                      name="event-type"
                      value={key}
                      checked={eventType === key}
                      onChange={() => setEventType(key as EvenementCalendrier['type'])}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      eventType === key ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`} style={{ backgroundColor: config.bgColor }}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {config.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date de début */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date de début
              </label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-8 modal-footer">
            {selectedEvent && (
              <button
                onClick={handleDeleteEvent}
                type="button"
                className="flex justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Supprimer
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={closeModal}
              type="button"
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Annuler
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              disabled={!eventTitle.trim() || loading}
              className="flex justify-center items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {selectedEvent ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const typeConfig = {
    rentree: "success",
    examen: "danger", 
    vacances: "warning",
    evenement: "primary",
    autre: "secondary"
  };
  
  const eventType = eventInfo.event.extendedProps.type || 'evenement';
  const colorClass = `fc-bg-${typeConfig[eventType as keyof typeof typeConfig]}`;
  
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title truncate">{eventInfo.event.title}</div>
    </div>
  );
};

export default AnneeCalendar;
