import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  Check,
  AlertCircle,
  MapPin,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { apiClient } from "../../lib/api-client";
import { differenceInHours, addHours, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface EspaceAPI {
  id: string;
  nom: string;
  type: string;
  capacite: number;
  prix_heure?: number;
  prix_jour?: number;
  prixHeure?: number;
  prixJour?: number;
  disponible: boolean | number;
  description?: string;
  image?: string;
}

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEspace?: EspaceAPI;
}

interface FormData {
  espace_id: string;
  date_debut: Date;
  date_fin: Date;
  participants: number;
  notes: string;
}

const getPrixHeure = (espace: EspaceAPI | null): number => {
  if (!espace) return 0;
  const prix = espace.prix_heure ?? espace.prixHeure ?? 0;
  return typeof prix === "string" ? parseFloat(prix) : prix;
};

const getPrixJour = (espace: EspaceAPI | null): number => {
  if (!espace) return 0;
  const prix = espace.prix_jour ?? espace.prixJour ?? 0;
  return typeof prix === "string" ? parseFloat(prix) : prix;
};

const isDisponible = (espace: EspaceAPI): boolean => {
  if (typeof espace.disponible === "boolean") return espace.disponible;
  if (typeof espace.disponible === "number") return espace.disponible === 1;
  return true;
};

const getDefaultStartDate = (): Date => {
  const now = new Date();
  return setMinutes(setHours(now, now.getHours() + 1), 0);
};

const getDefaultEndDate = (): Date => {
  return addHours(getDefaultStartDate(), 2);
};

const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  selectedEspace,
}) => {
  const [step, setStep] = useState(1);
  const [espaces, setEspaces] = useState<EspaceAPI[]>([]);
  const [currentEspace, setCurrentEspace] = useState<EspaceAPI | null>(null);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEspaces, setLoadingEspaces] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      espace_id: selectedEspace?.id || "",
      date_debut: getDefaultStartDate(),
      date_fin: getDefaultEndDate(),
      participants: 1,
      notes: "",
    },
  });

  const watchEspaceId = watch("espace_id");
  const watchDateDebut = watch("date_debut");
  const watchDateFin = watch("date_fin");
  const watchParticipants = watch("participants");

  useEffect(() => {
    if (isOpen) {
      loadEspaces();
      setStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEspace && isOpen) {
      setValue("espace_id", selectedEspace.id);
      setCurrentEspace(selectedEspace);
      setStep(2);
    }
  }, [selectedEspace, isOpen, setValue]);

  useEffect(() => {
    if (watchEspaceId && espaces.length > 0) {
      const found = espaces.find((e) => e.id === watchEspaceId);
      setCurrentEspace(found || null);
    } else {
      setCurrentEspace(null);
    }
  }, [watchEspaceId, espaces]);

  useEffect(() => {
    if (!currentEspace || !watchDateDebut || !watchDateFin) {
      setEstimatedAmount(0);
      return;
    }

    const hours = differenceInHours(watchDateFin, watchDateDebut);
    if (hours <= 0) {
      setEstimatedAmount(0);
      return;
    }

    const prixH = getPrixHeure(currentEspace);
    const prixJ = getPrixJour(currentEspace);

    let amount = 0;
    if (hours <= 4) {
      amount = Math.ceil(hours) * prixH;
    } else if (hours <= 8) {
      amount = prixJ / 2;
    } else if (hours < 24) {
      amount = prixJ;
    } else {
      const days = Math.ceil(hours / 24);
      amount = days * prixJ;
    }

    setEstimatedAmount(amount);
  }, [currentEspace, watchDateDebut, watchDateFin]);

  const loadEspaces = async () => {
    try {
      setLoadingEspaces(true);
      setLoadError(null);
      const response = await apiClient.getEspaces();

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setEspaces(data);
        if (data.length === 0) {
          setLoadError("Aucun espace disponible");
        }
      } else {
        setLoadError(response.error || "Erreur lors du chargement");
        setEspaces([]);
      }
    } catch (error: any) {
      setLoadError(error.message || "Erreur de connexion");
      setEspaces([]);
    } finally {
      setLoadingEspaces(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    setDebugInfo(null);

    if (!data.espace_id) {
      toast.error("Veuillez selectionner un espace");
      return;
    }

    const hours = differenceInHours(data.date_fin, data.date_debut);
    if (hours <= 0) {
      toast.error("La date de fin doit etre apres la date de debut");
      return;
    }

    const requestPayload = {
      espaceId: data.espace_id,
      dateDebut: data.date_debut.toISOString(),
      dateFin: data.date_fin.toISOString(),
      participants: data.participants || 1,
      notes: data.notes || "",
    };

    const debug = {
      timestamp: new Date().toISOString(),
      formData: {
        espace_id: data.espace_id,
        espace_nom: currentEspace?.nom,
        date_debut: data.date_debut.toISOString(),
        date_fin: data.date_fin.toISOString(),
        participants: data.participants,
        notes: data.notes,
      },
      requestPayload,
      calculatedAmount: estimatedAmount,
      hours,
    };

    try {
      setIsSubmitting(true);

      const response = await apiClient.createReservation(requestPayload);

      debug.response = {
        success: response.success,
        data: response.data,
        error: response.error,
        message: response.message,
      };

      setDebugInfo(debug);

      if (response.success) {
        toast.success("Reservation creee avec succes !");
        handleClose();
      } else {
        toast.error(
          response.error || response.message || "Erreur lors de la creation",
        );
        console.error("Erreur de reservation:", debug);
      }
    } catch (error: any) {
      debug.exception = {
        message: error.message,
        stack: error.stack,
      };
      setDebugInfo(debug);
      toast.error(error.message || "Erreur de connexion");
      console.error("Exception de reservation:", debug);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset({
      espace_id: "",
      date_debut: getDefaultStartDate(),
      date_fin: getDefaultEndDate(),
      participants: 1,
      notes: "",
    });
    setEstimatedAmount(0);
    setCurrentEspace(null);
    setStep(1);
    onClose();
  };

  const selectEspace = (espace: EspaceAPI) => {
    setValue("espace_id", espace.id);
    setCurrentEspace(espace);
    setStep(2);
  };

  const availableEspaces = espaces.filter(isDisponible);

  const getDurationText = (): string => {
    if (!watchDateDebut || !watchDateFin) return "";
    const hours = differenceInHours(watchDateFin, watchDateDebut);
    if (hours <= 0) return "";
    if (hours < 24) return `${hours}h`;
    const days = Math.ceil(hours / 24);
    return `${days} jour${days > 1 ? "s" : ""}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "Choisir un espace" : "Nouvelle Reservation"}
    >
      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-4">
            {loadingEspaces ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <p className="text-gray-500">Chargement des espaces...</p>
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Erreur de chargement
                </p>
                <p className="text-gray-500 text-sm mb-4">{loadError}</p>
                <Button onClick={loadEspaces} variant="secondary">
                  Reessayer
                </Button>
              </div>
            ) : availableEspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-gray-700 font-medium">
                  Aucun espace disponible
                </p>
                <p className="text-gray-500 text-sm">Revenez plus tard</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableEspaces.map((espace) => (
                  <button
                    key={espace.id}
                    type="button"
                    onClick={() => selectEspace(espace)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {espace.nom}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {espace.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {espace.capacite} places
                          </span>
                          <span className="font-semibold text-amber-600">
                            {getPrixHeure(espace).toLocaleString()} DA/h
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && currentEspace && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">
                    Espace selectionne
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {currentEspace.nom}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentEspace.capacite} places -{" "}
                    {getPrixHeure(currentEspace).toLocaleString()} DA/h
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1.5 text-gray-400" />
                  Date et heure de debut
                </label>
                <DatePicker
                  selected={watchDateDebut}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setValue("date_debut", date);
                      if (date >= watchDateFin) {
                        setValue("date_fin", addHours(date, 2));
                      }
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={new Date()}
                  locale={fr}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholderText="Selectionnez une date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1.5 text-gray-400" />
                  Date et heure de fin
                </label>
                <DatePicker
                  selected={watchDateFin}
                  onChange={(date: Date | null) =>
                    date && setValue("date_fin", date)
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={watchDateDebut}
                  locale={fr}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholderText="Selectionnez une date"
                />
              </div>
            </div>

            {getDurationText() && (
              <div className="text-center py-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Duree: {getDurationText()}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1.5 text-gray-400" />
                Nombre de participants
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "participants",
                      Math.max(1, (watchParticipants || 1) - 1),
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  {...register("participants", {
                    required: true,
                    min: 1,
                    max: currentEspace.capacite,
                    valueAsNumber: true,
                  })}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min={1}
                  max={currentEspace.capacite}
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "participants",
                      Math.min(
                        currentEspace.capacite,
                        (watchParticipants || 1) + 1,
                      ),
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  / {currentEspace.capacite} max
                </span>
              </div>
              {errors.participants && (
                <p className="text-red-500 text-sm mt-1">
                  Le nombre doit etre entre 1 et {currentEspace.capacite}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                placeholder="Besoins particuliers, equipements requis..."
              />
            </div>

            {estimatedAmount > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Montant estime</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getDurationText()} - {currentEspace.nom}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {estimatedAmount.toLocaleString()} DA
                  </p>
                </div>
              </div>
            )}

            {debugInfo && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-900 font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Debug Info
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(debugInfo, null, 2),
                        );
                        toast.success("Debug info copie");
                      }}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded transition-colors"
                    >
                      Copier
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebugInfo(null)}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-blue-900 bg-blue-100 p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || estimatedAmount === 0}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reservation...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Confirmer
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ReservationForm;
