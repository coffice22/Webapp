import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Star,
  Calendar,
  Users,
  Clock,
  Info,
  Zap,
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { logger } from "../../utils/logger";

interface Abonnement {
  id: string;
  nom: string;
  description: string;
  prix: number;
  duree: number;
  typeAbonnement: string;
  avantages: string[];
  actif: boolean;
  populaire: boolean;
  ordre: number;
}

const Abonnements = () => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAbonnement, setSelectedAbonnement] =
    useState<Abonnement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadAbonnements();
  }, []);

  const loadAbonnements = async () => {
    try {
      const response = await apiClient.getAbonnements();
      if (response.success && response.data) {
        const abonnementsData = Array.isArray(response.data)
          ? response.data
          : [];
        const formatted = abonnementsData.map((a: any) => ({
          id: a.id,
          nom: a.nom,
          description: a.description || "",
          prix: parseFloat(a.prix) || 0,
          duree: parseInt(a.duree) || 30,
          typeAbonnement: a.type_abonnement || "standard",
          avantages: Array.isArray(a.avantages) ? a.avantages : [],
          actif: a.actif === 1 || a.actif === true,
          populaire: a.populaire === 1 || a.populaire === true,
          ordre: parseInt(a.ordre) || 0,
        }));
        setAbonnements(formatted.filter((a) => a.actif));
      }
    } catch (error) {
      logger.error("Erreur chargement abonnements:", error);
      toast.error("Erreur lors du chargement des abonnements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (abonnement: Abonnement) => {
    setSelectedAbonnement(abonnement);
    setShowModal(true);
  };

  const confirmSubscription = async () => {
    if (!selectedAbonnement) return;

    setSubscribing(true);
    try {
      toast.success(
        "Abonnement en cours de traitement. Contactez l'administration pour finaliser.",
      );
      setShowModal(false);
      setSelectedAbonnement(null);
    } catch (error) {
      toast.error("Erreur lors de la souscription");
    } finally {
      setSubscribing(false);
    }
  };

  const getDureeText = (duree: number) => {
    if (duree >= 365) return `${Math.floor(duree / 365)} an${Math.floor(duree / 365) > 1 ? "s" : ""}`;
    if (duree >= 30) return `${Math.floor(duree / 30)} mois`;
    return `${duree} jours`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-600 mt-1">
          Choisissez l'abonnement qui vous convient
        </p>
      </div>

      {abonnements.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aucun abonnement disponible
          </h3>
          <p className="text-gray-600">
            Les abonnements seront bientôt disponibles
          </p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {abonnements.map((abonnement, index) => (
            <motion.div
              key={abonnement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative p-6 h-full flex flex-col ${
                  abonnement.populaire
                    ? "border-2 border-accent shadow-lg"
                    : "border border-gray-200"
                }`}
              >
                {abonnement.populaire && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="success" className="px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {abonnement.nom}
                  </h3>
                  {abonnement.description && (
                    <p className="text-sm text-gray-600">
                      {abonnement.description}
                    </p>
                  )}
                </div>

                <div className="text-center mb-6 pb-6 border-b">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {abonnement.prix.toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-lg">DA</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{getDureeText(abonnement.duree)}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-6">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-accent mt-0.5" />
                    <span>Durée: {getDureeText(abonnement.duree)}</span>
                  </div>

                  {abonnement.avantages.length > 0 && (
                    <div className="space-y-3">
                      {abonnement.avantages.map((avantage, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{avantage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSubscribe(abonnement)}
                  className={`w-full ${
                    abonnement.populaire
                      ? "bg-accent hover:bg-accent/90"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Souscrire
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-2">
              Informations importantes
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Les abonnements sont renouvelés automatiquement
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Vous pouvez annuler votre abonnement à tout moment
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Contactez l'administration pour toute question
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!subscribing) {
            setShowModal(false);
            setSelectedAbonnement(null);
          }
        }}
        title="Confirmer votre abonnement"
      >
        {selectedAbonnement && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                {selectedAbonnement.nom}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {selectedAbonnement.prix.toLocaleString()}
                </span>
                <span className="text-gray-600">DA</span>
                <span className="text-sm text-gray-500">
                  / {getDureeText(selectedAbonnement.duree)}
                </span>
              </div>
              {selectedAbonnement.description && (
                <p className="text-sm text-gray-600">
                  {selectedAbonnement.description}
                </p>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Prochaines étapes:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Votre demande sera envoyée à l'administration</li>
                    <li>
                      Vous recevrez un email avec les modalités de paiement
                    </li>
                    <li>Votre abonnement sera activé après confirmation</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedAbonnement(null);
                }}
                disabled={subscribing}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={confirmSubscription}
                disabled={subscribing}
                className="flex-1"
              >
                {subscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Abonnements;
