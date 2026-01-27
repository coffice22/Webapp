import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Calendar, Clock, Users, Check, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import DateTimePicker from "../ui/DateTimePicker";
import { apiClient } from "../../lib/api-client";
import { differenceInHours } from "date-fns";

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
  return espace.disponible !== false && espace.disponible !== 0;
};

const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  selectedEspace,
}) => {
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
      date_debut: new Date(),
      date_fin: new Date(Date.now() + 2 * 60 * 60 * 1000),
      participants: 1,
      notes: "",
    },
  });

  const watchEspaceId = watch("espace_id");
  const watchDateDebut = watch("date_debut");
  const watchDateFin = watch("date_fin");

  useEffect(() => {
    if (isOpen) {
      loadEspaces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEspace && isOpen) {
      setValue("espace_id", selectedEspace.id);
      setCurrentEspace(selectedEspace);
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
    if (hours < 24) {
      amount = Math.ceil(hours) * prixH;
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
        setLoadError(response.error || "Erreur lors du chargement des espaces");
        setEspaces([]);
      }
    } catch (error: any) {
      console.error("Erreur chargement espaces:", error);
      setLoadError(error.message || "Erreur de connexion");
      setEspaces([]);
    } finally {
      setLoadingEspaces(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    if (!data.espace_id) {
      toast.error("Veuillez selectionner un espace");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.createReservation({
        espaceId: data.espace_id,
        dateDebut: data.date_debut.toISOString(),
        dateFin: data.date_fin.toISOString(),
        participants: data.participants || 1,
        notes: data.notes || "",
      });

      if (response.success) {
        toast.success("Reservation creee avec succes");
        reset();
        onClose();
      } else {
        toast.error(
          response.error || response.message || "Erreur lors de la creation",
        );
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(
        error.message || "Erreur lors de la creation de la reservation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset({
      espace_id: "",
      date_debut: new Date(),
      date_fin: new Date(Date.now() + 2 * 60 * 60 * 1000),
      participants: 1,
      notes: "",
    });
    setEstimatedAmount(0);
    setCurrentEspace(null);
    onClose();
  };

  const availableEspaces = espaces.filter(isDisponible);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle Reservation">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Espace
          </label>

          {loadingEspaces ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
              Chargement des espaces...
            </div>
          ) : loadError ? (
            <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {loadError}
              <button
                type="button"
                onClick={loadEspaces}
                className="ml-auto text-sm underline hover:no-underline"
              >
                Reessayer
              </button>
            </div>
          ) : availableEspaces.length === 0 ? (
            <div className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700">
              Aucun espace disponible pour le moment
            </div>
          ) : (
            <select
              {...register("espace_id", { required: "L'espace est requis" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Selectionner un espace</option>
              {availableEspaces.map((espace) => (
                <option key={espace.id} value={espace.id}>
                  {espace.nom} - {getPrixHeure(espace)} DA/h
                </option>
              ))}
            </select>
          )}

          {errors.espace_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.espace_id.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Date debut
            </label>
            <DateTimePicker
              value={watchDateDebut}
              onChange={(date) => setValue("date_debut", date)}
              minDate={new Date()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Date fin
            </label>
            <DateTimePicker
              value={watchDateFin}
              onChange={(date) => setValue("date_fin", date)}
              minDate={watchDateDebut}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-2" />
            Nombre de participants
          </label>
          <Input
            type="number"
            {...register("participants", {
              required: "Le nombre de participants est requis",
              min: { value: 1, message: "Minimum 1 participant" },
              valueAsNumber: true,
            })}
            placeholder="1"
            min={1}
          />
          {errors.participants && (
            <p className="text-red-500 text-sm mt-1">
              {errors.participants.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            placeholder="Notes optionnelles..."
          />
        </div>

        {currentEspace && estimatedAmount > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Montant estime:</span>
              <span className="text-2xl font-bold text-amber-600">
                {estimatedAmount.toLocaleString()} DA
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isSubmitting || loadingEspaces || availableEspaces.length === 0
            }
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creation...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Confirmer
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationForm;
