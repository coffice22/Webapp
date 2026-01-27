import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Calendar, Clock, Users, CreditCard, Check } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import DateTimePicker from "../ui/DateTimePicker";
import { Espace } from "../../types";
import { apiClient } from "../../lib/api-client";
import { format, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEspace?: Espace;
}

interface FormData {
  espace_id: string;
  date_debut: Date;
  date_fin: Date;
  participants: number;
  notes: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  selectedEspace,
}) => {
  const [espaces, setEspaces] = useState<Espace[]>([]);
  const [selectedEspace2, setSelectedEspace2] = useState<Espace | null>(selectedEspace || null);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    loadEspaces();
  }, []);

  useEffect(() => {
    if (selectedEspace) {
      setValue("espace_id", selectedEspace.id);
      setSelectedEspace2(selectedEspace);
    }
  }, [selectedEspace, setValue]);

  useEffect(() => {
    const espace = espaces.find((e) => e.id === watchEspaceId);
    setSelectedEspace2(espace || null);
  }, [watchEspaceId, espaces]);

  useEffect(() => {
    calculateAmount();
  }, [watchEspaceId, watchDateDebut, watchDateFin, selectedEspace2]);

  const loadEspaces = async () => {
    try {
      const response = await apiClient.getEspaces();
      if (response.success) {
        setEspaces(response.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement espaces:", error);
    }
  };

  const calculateAmount = () => {
    if (!selectedEspace2 || !watchDateDebut || !watchDateFin) {
      setEstimatedAmount(0);
      return;
    }

    const hours = differenceInHours(watchDateFin, watchDateDebut);

    if (hours <= 0) {
      setEstimatedAmount(0);
      return;
    }

    let amount = 0;

    if (hours < 24) {
      amount = Math.ceil(hours) * (selectedEspace2.prixHeure || 0);
    } else {
      const days = Math.ceil(hours / 24);
      amount = days * (selectedEspace2.prixJour || 0);
    }

    setEstimatedAmount(amount);
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

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
        toast.success("Réservation créée avec succès");
        reset();
        onClose();
        window.location.reload();
      } else {
        toast.error(response.message || "Erreur lors de la création");
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la création de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setEstimatedAmount(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle Réservation">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Espace
          </label>
          <select
            {...register("espace_id", { required: "L'espace est requis" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Sélectionner un espace</option>
            {espaces
              .filter((e) => e.disponible)
              .map((espace) => (
                <option key={espace.id} value={espace.id}>
                  {espace.nom} - {espace.prixHeure} DA/h
                </option>
              ))}
          </select>
          {errors.espace_id && (
            <p className="text-red-500 text-sm mt-1">{errors.espace_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Date début
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
            })}
            placeholder="1"
          />
          {errors.participants && (
            <p className="text-red-500 text-sm mt-1">
              {errors.participants.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Notes optionnelles..."
          />
        </div>

        {selectedEspace2 && estimatedAmount > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Montant estimé:</span>
              <span className="text-2xl font-bold text-amber-600">
                {estimatedAmount.toLocaleString()} DA
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
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
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
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
