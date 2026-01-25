import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  addHours,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";

interface WeekCalendarProps {
  reservations: any[];
  espaces: any[];
  onSlotClick?: (date: Date, espaceId: string) => void;
}

export default function WeekCalendar({
  reservations,
  espaces,
  onSlotClick,
}: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getReservationForSlot = (day: Date, hour: number, espaceId: string) => {
    const slotStart = addHours(startOfDay(day), hour);

    return reservations.find((res) => {
      if (res.espace_id !== espaceId) return false;
      const resStart = new Date(res.date_debut);
      const resEnd = new Date(res.date_fin);
      return slotStart >= resStart && slotStart < resEnd;
    });
  };

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold">
          Semaine du {format(weekStart, "d MMM", { locale: fr })} au{" "}
          {format(weekEnd, "d MMM yyyy", { locale: fr })}
        </h2>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div
            className="grid"
            style={{
              gridTemplateColumns: "120px repeat(7, minmax(100px, 1fr))",
            }}
          >
            <div className="border-r border-gray-200 p-2"></div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`text-center py-3 border-r border-gray-200 ${
                  isToday(day) ? "bg-blue-50" : ""
                }`}
              >
                <div className="font-semibold capitalize">
                  {format(day, "EEE", { locale: fr })}
                </div>
                <div
                  className={`text-2xl ${isToday(day) ? "text-blue-600" : ""}`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}

            {hours.map((hour) => (
              <>
                <div
                  key={`hour-${hour}`}
                  className="border-t border-r border-gray-200 p-2 text-sm text-gray-600 font-medium"
                >
                  {hour}:00
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border-t border-r border-gray-200 p-1 min-h-[80px]"
                  >
                    <div className="space-y-1">
                      {espaces.slice(0, 3).map((espace) => {
                        const reservation = getReservationForSlot(
                          day,
                          hour,
                          espace.id,
                        );
                        const isAvailable = !reservation;

                        return (
                          <button
                            key={espace.id}
                            onClick={() =>
                              onSlotClick?.(
                                addHours(startOfDay(day), hour),
                                espace.id,
                              )
                            }
                            className={`
                              w-full text-xs px-2 py-1 rounded transition-colors text-left
                              ${
                                reservation
                                  ? reservation.statut === "confirmee"
                                    ? "bg-green-100 text-green-800 cursor-default"
                                    : "bg-yellow-100 text-yellow-800 cursor-default"
                                  : "bg-gray-50 hover:bg-blue-50 text-gray-600"
                              }
                            `}
                            disabled={Boolean(reservation)}
                            title={
                              reservation
                                ? `${espace.nom} - Réservé`
                                : `${espace.nom} - Disponible`
                            }
                          >
                            <div className="truncate text-[10px]">
                              {espace.nom.substring(0, 10)}
                            </div>
                            {reservation && (
                              <div className="text-[9px] truncate">
                                {reservation.user_nom}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Confirmée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span>En attente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
