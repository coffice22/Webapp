import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarProps {
  reservations: any[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ reservations, onDateClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getReservationsForDay = (date: Date) => {
    return reservations.filter(res => {
      const resDate = new Date(res.date_debut);
      return isSameDay(resDate, date);
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const hasReservations = dayReservations.length > 0;

            return (
              <button
                key={index}
                onClick={() => onDateClick && onDateClick(day)}
                className={`
                  relative aspect-square p-2 rounded-lg text-sm transition-all
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${isCurrentDay && !isSelected ? 'bg-blue-50 border-2 border-blue-600' : ''}
                  ${!isSelected && !isCurrentDay ? 'hover:bg-gray-100' : ''}
                  ${hasReservations && !isSelected ? 'font-semibold' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{format(day, 'd')}</span>
                  {hasReservations && (
                    <div className="flex gap-1 mt-1">
                      {dayReservations.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border-2 border-blue-600 rounded"></div>
            <span>Aujourd'hui</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Réservations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
