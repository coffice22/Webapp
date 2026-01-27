import React, { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  CreditCard,
  Timer,
  ArrowLeft,
  Wifi,
  Coffee,
  Monitor,
  Zap,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { apiClient } from "../../lib/api-client";
import { differenceInHours, addHours, setHours, setMinutes, format, isBefore, startOfDay } from "date-fns";
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
  equipements?: string[];
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

const getEquipmentIcon = (equip: string) => {
  const lower = equip.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return Wifi;
  if (lower.includes("cafe") || lower.includes("café") || lower.includes("boisson")) return Coffee;
  if (lower.includes("ecran") || lower.includes("écran") || lower.includes("projecteur")) return Monitor;
  return Zap;
};

const getSpaceTypeColor = (type: string): string => {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("reunion") || lower.includes("réunion")) return "from-blue-500 to-blue-600";
  if (lower.includes("box") || lower.includes("bureau")) return "from-amber-500 to-orange-500";
  if (lower.includes("open") || lower.includes("coworking")) return "from-emerald-500 to-teal-500";
  return "from-gray-500 to-gray-600";
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
      amount = Math.round(prixJ / 2);
    } else if (hours < 24) {
      amount = prixJ;
    } else {
      const days = Math.ceil(hours / 24);
      amount = days * prixJ;
    }

    setEstimatedAmount(Math.round(amount));
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
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Erreur de connexion");
      setEspaces([]);
    } finally {
      setLoadingEspaces(false);
    }
  };

  const validateDates = (): boolean => {
    if (!watchDateDebut || !watchDateFin) {
      toast.error("Veuillez selectionner les dates");
      return false;
    }

    const now = new Date();
    if (isBefore(watchDateDebut, startOfDay(now))) {
      toast.error("La date de debut ne peut pas etre dans le passe");
      return false;
    }

    const hours = differenceInHours(watchDateFin, watchDateDebut);
    if (hours <= 0) {
      toast.error("La date de fin doit etre apres la date de debut");
      return false;
    }

    if (hours < 1) {
      toast.error("La reservation doit etre d'au moins 1 heure");
      return false;
    }

    return true;
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    if (!data.espace_id) {
      toast.error("Veuillez selectionner un espace");
      return;
    }

    if (!validateDates()) return;

    const requestPayload = {
      espaceId: data.espace_id,
      dateDebut: data.date_debut.toISOString(),
      dateFin: data.date_fin.toISOString(),
      participants: data.participants || 1,
      notes: data.notes || "",
    };

    try {
      setIsSubmitting(true);

      const response = await apiClient.createReservation(requestPayload);

      if (response.success) {
        toast.success("Reservation creee avec succes !");
        handleClose();
      } else {
        toast.error(response.error || response.message || "Erreur lors de la creation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
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

  const availableEspaces = useMemo(() => espaces.filter(isDisponible), [espaces]);

  const durationInfo = useMemo(() => {
    if (!watchDateDebut || !watchDateFin) return null;
    const hours = differenceInHours(watchDateFin, watchDateDebut);
    if (hours <= 0) return null;

    const displayHours = hours % 24;
    const days = Math.floor(hours / 24);

    let text = "";
    if (days > 0) text += `${days} jour${days > 1 ? "s" : ""}`;
    if (displayHours > 0) {
      if (days > 0) text += " et ";
      text += `${displayHours}h`;
    }

    return { text, hours };
  }, [watchDateDebut, watchDateFin]);

  const pricingBreakdown = useMemo(() => {
    if (!currentEspace || !durationInfo) return null;

    const prixH = getPrixHeure(currentEspace);
    const prixJ = getPrixJour(currentEspace);
    const hours = durationInfo.hours;

    if (hours <= 4) {
      return { type: "hourly", rate: prixH, quantity: Math.ceil(hours), unit: "heure" };
    } else if (hours <= 8) {
      return { type: "halfday", rate: Math.round(prixJ / 2), quantity: 1, unit: "demi-journee" };
    } else if (hours < 24) {
      return { type: "fullday", rate: prixJ, quantity: 1, unit: "journee" };
    } else {
      const days = Math.ceil(hours / 24);
      return { type: "multiday", rate: prixJ, quantity: days, unit: "jour" };
    }
  }, [currentEspace, durationInfo]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "Choisir un espace" : "Nouvelle Reservation"}
    >
      <div className="min-h-[450px]">
        {step === 1 && (
          <div className="space-y-4">
            {loadingEspaces ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-amber-200 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-500 mt-4 font-medium">Chargement des espaces...</p>
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-900 font-semibold mb-2">Erreur de chargement</p>
                <p className="text-gray-500 text-sm mb-4 text-center">{loadError}</p>
                <Button onClick={loadEspaces} variant="secondary">
                  Reessayer
                </Button>
              </div>
            ) : availableEspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-gray-900 font-semibold">Aucun espace disponible</p>
                <p className="text-gray-500 text-sm mt-1">Revenez plus tard</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Selectionnez l'espace qui correspond a vos besoins
                </p>
                {availableEspaces.map((espace) => {
                  const typeColor = getSpaceTypeColor(espace.type);

                  return (
                    <button
                      key={espace.id}
                      type="button"
                      onClick={() => selectEspace(espace)}
                      className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-amber-200 hover:shadow-lg transition-all duration-300 text-left group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${typeColor}`} />
                      <div className="flex items-center justify-between pl-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition-colors">
                              {espace.nom}
                            </h3>
                            <span className={`px-2.5 py-1 bg-gradient-to-r ${typeColor} text-white rounded-full text-xs font-medium`}>
                              {espace.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <Users className="w-4 h-4" />
                              {espace.capacite} places
                            </span>
                            <span className="flex items-center gap-1.5 font-bold text-amber-600">
                              <CreditCard className="w-4 h-4" />
                              {getPrixHeure(espace).toLocaleString()} DA/h
                            </span>
                          </div>
                          {espace.equipements && espace.equipements.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              {espace.equipements.slice(0, 3).map((equip, i) => {
                                const Icon = getEquipmentIcon(equip);
                                return (
                                  <span key={i} className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                    <Icon className="w-3 h-3" />
                                    {equip}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && currentEspace && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${getSpaceTypeColor(currentEspace.type)} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center justify-between">
                <div className="text-white">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-80 mb-1">
                    Espace selectionne
                  </p>
                  <p className="font-bold text-xl">{currentEspace.nom}</p>
                  <p className="text-sm opacity-90 mt-1">
                    {currentEspace.capacite} places - {getPrixHeure(currentEspace).toLocaleString()} DA/h
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
                  title="Changer d'espace"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
                  placeholderText="Selectionnez"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Date et heure de fin
                </label>
                <DatePicker
                  selected={watchDateFin}
                  onChange={(date: Date | null) => date && setValue("date_fin", date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={watchDateDebut}
                  locale={fr}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
                  placeholderText="Selectionnez"
                />
              </div>
            </div>

            {durationInfo && (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                  <Timer className="w-4 h-4" />
                  Duree: {durationInfo.text}
                </span>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 text-amber-500" />
                Nombre de participants
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("participants", Math.max(1, (watchParticipants || 1) - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-amber-100 rounded-xl text-gray-700 font-bold text-xl transition-colors"
                >
                  -
                </button>
                <div className="relative flex-1 max-w-[100px]">
                  <input
                    type="number"
                    {...register("participants", {
                      required: true,
                      min: 1,
                      max: currentEspace.capacite,
                      valueAsNumber: true,
                    })}
                    className="w-full text-center px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-bold"
                    min={1}
                    max={currentEspace.capacite}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "participants",
                      Math.min(currentEspace.capacite, (watchParticipants || 1) + 1)
                    )
                  }
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-amber-100 rounded-xl text-gray-700 font-bold text-xl transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 font-medium">
                  / {currentEspace.capacite} max
                </span>
              </div>
              {errors.participants && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Le nombre doit etre entre 1 et {currentEspace.capacite}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm transition-all"
                placeholder="Besoins particuliers, equipements requis..."
              />
            </div>

            {estimatedAmount > 0 && pricingBreakdown && (
              <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <p className="font-semibold text-gray-900">Estimation du tarif</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {pricingBreakdown.quantity} {pricingBreakdown.unit}{pricingBreakdown.quantity > 1 && pricingBreakdown.type !== "halfday" ? "s" : ""} x {pricingBreakdown.rate.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentEspace.nom} - {durationInfo?.text}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-amber-600">
                      {estimatedAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">DA</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || estimatedAmount === 0}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creation...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Confirmer la reservation
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
