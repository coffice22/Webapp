import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  FileText,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  Briefcase,
  Info,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  Loader2,
  CreditCard,
  ChevronRight,
  Award,
  Globe,
  FileCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, title: "Entreprise", icon: Building },
  { id: 2, title: "Representant", icon: User },
  { id: 3, title: "Confirmation", icon: FileCheck },
];

const benefits = [
  {
    icon: MapPin,
    title: "Adresse prestigieuse",
    description: "Mohammadia Mall, 4eme etage, Bureau 1178, Alger",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: FileText,
    title: "Services inclus",
    description: "Reception courrier, salle de reunion, assistance",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: CheckCircle,
    title: "Validation rapide",
    description: "Traitement sous 48h ouvrees",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const Domiciliation = () => {
  const { user } = useAuthStore();
  const {
    getUserDemandeDomiciliation,
    createDemandeDomiciliation,
    loadDemandesDomiciliation,
  } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadDemandesDomiciliation();
    }
  }, [user, loadDemandesDomiciliation]);

  const demande = user ? getUserDemandeDomiciliation(user.id) : null;
  const hasCompanyInfo = user?.raisonSociale && user?.nif;

  const [formData, setFormData] = useState({
    raisonSociale: "",
    formeJuridique: "",
    nif: "",
    nis: "",
    registreCommerce: "",
    articleImposition: "",
    coordonneesFiscales: "",
    coordonneesAdministratives: "",
    representantLegal: {
      nom: "",
      prenom: "",
      fonction: "",
      telephone: "",
      email: "",
    },
    domaineActivite: "",
    adresseSiegeSocial: "",
    capital: 0,
    dateCreationEntreprise: "",
  });

  useEffect(() => {
    if (user && hasCompanyInfo) {
      setFormData({
        raisonSociale: user.raisonSociale || "",
        formeJuridique: user.formeJuridique || "",
        nif: user.nif || "",
        nis: user.nis || "",
        registreCommerce: user.registreCommerce || "",
        articleImposition: user.articleImposition || "",
        coordonneesFiscales: "",
        coordonneesAdministratives: "",
        representantLegal: {
          nom: user.nom || "",
          prenom: user.prenom || "",
          fonction: "",
          telephone: user.telephone || "",
          email: user.email || "",
        },
        domaineActivite: user.activitePrincipale || "",
        adresseSiegeSocial: user.siegeSocial || "",
        capital: parseFloat(user.capital || "0"),
        dateCreationEntreprise: user.dateCreationEntreprise || "",
      });
    }
  }, [user, hasCompanyInfo]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.raisonSociale.trim()) {
      newErrors.raisonSociale = "La raison sociale est requise";
    }
    if (!formData.formeJuridique) {
      newErrors.formeJuridique = "La forme juridique est requise";
    }
    if (!formData.nif.trim()) {
      newErrors.nif = "Le NIF est requis";
    } else if (formData.nif.length < 10) {
      newErrors.nif = "Le NIF doit contenir au moins 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.representantLegal.nom.trim()) {
      newErrors["representantLegal.nom"] = "Le nom est requis";
    }
    if (!formData.representantLegal.prenom.trim()) {
      newErrors["representantLegal.prenom"] = "Le prenom est requis";
    }
    if (!formData.representantLegal.email.trim()) {
      newErrors["representantLegal.email"] = "L'email est requis";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.representantLegal.email)
    ) {
      newErrors["representantLegal.email"] = "Email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await createDemandeDomiciliation({
        userId: user.id,
        ...formData,
      });
      if (result.success) {
        toast.success("Demande de domiciliation envoyee avec succes!");
        setShowModal(false);
        setCurrentStep(1);
        setErrors({});
      } else {
        toast.error(result.error || "Erreur lors de l'envoi de la demande");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return {
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-gradient-to-br from-amber-50 to-orange-50",
          border: "border-amber-200",
          gradient: "from-amber-500 to-orange-500",
          label: "En attente de validation",
          description:
            "Votre demande est en cours d'examen par notre equipe. Vous serez notifie des que le traitement sera termine.",
        };
      case "validee":
        return {
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
          border: "border-emerald-200",
          gradient: "from-emerald-500 to-teal-500",
          label: "Demande validee",
          description:
            "Votre demande a ete approuvee. Vous recevrez prochainement votre attestation de domiciliation.",
        };
      case "rejetee":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-gradient-to-br from-red-50 to-rose-50",
          border: "border-red-200",
          gradient: "from-red-500 to-rose-500",
          label: "Demande rejetee",
          description:
            "Votre demande n'a pas ete acceptee. Consultez le commentaire ci-dessous pour plus de details.",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          gradient: "from-gray-500 to-gray-600",
          label: "Statut inconnu",
          description: "",
        };
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const canProceedStep1 = useMemo(() => {
    return (
      formData.raisonSociale.trim() &&
      formData.formeJuridique &&
      formData.nif.trim()
    );
  }, [formData.raisonSociale, formData.formeJuridique, formData.nif]);

  const canProceedStep2 = useMemo(() => {
    return (
      formData.representantLegal.nom.trim() &&
      formData.representantLegal.prenom.trim() &&
      formData.representantLegal.email.trim()
    );
  }, [
    formData.representantLegal.nom,
    formData.representantLegal.prenom,
    formData.representantLegal.email,
  ]);

  const handleOpenModal = () => {
    setShowModal(true);
    setCurrentStep(1);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Domiciliation d'Entreprise
          </h1>
          <p className="text-gray-500 mt-1">
            Domiciliez votre entreprise au Mohammadia Mall
          </p>
        </div>
        {!demande && hasCompanyInfo && (
          <Button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
          >
            <Plus className="w-5 h-5 mr-2" />
            Faire une demande
          </Button>
        )}
      </div>

      {demande ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card
            className={`p-0 overflow-hidden border-2 ${getStatusInfo(demande.statut).border}`}
          >
            <div className={`p-6 md:p-8 ${getStatusInfo(demande.statut).bg}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStatusInfo(demande.statut).gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                >
                  {React.createElement(getStatusInfo(demande.statut).icon, {
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {getStatusInfo(demande.statut).label}
                    </h3>
                    <Badge
                      variant={
                        demande.statut === "validee"
                          ? "success"
                          : demande.statut === "rejetee"
                            ? "danger"
                            : "warning"
                      }
                      className="text-sm px-4 py-2"
                    >
                      {demande.statut === "en_attente"
                        ? "En attente"
                        : demande.statut === "validee"
                          ? "Validee"
                          : "Rejetee"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {getStatusInfo(demande.statut).description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Demande creee le{" "}
                      {format(
                        new Date(demande.dateCreation),
                        "dd MMMM yyyy 'a' HH:mm",
                        { locale: fr },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Informations Entreprise
                  </h2>
                  <p className="text-sm text-gray-500">
                    Details de votre demande
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      Raison Sociale
                    </p>
                    <p className="font-semibold text-gray-900">
                      {demande.raisonSociale}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      Forme Juridique
                    </p>
                    <p className="font-semibold text-gray-900">
                      {demande.formeJuridique}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      NIF
                    </p>
                    <p className="font-semibold text-gray-900">
                      {demande.nif || "Non renseigne"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      NIS
                    </p>
                    <p className="font-semibold text-gray-900">
                      {demande.nis || "Non renseigne"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Domaine d'Activite
                  </p>
                  <p className="font-semibold text-gray-900">
                    {demande.domaineActivite || "Non renseigne"}
                  </p>
                </div>
              </div>
            </Card>

            {demande.representantLegal && (
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Representant Legal
                    </h2>
                    <p className="text-sm text-gray-500">Contact principal</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {demande.representantLegal.prenom}{" "}
                          {demande.representantLegal.nom}
                        </p>
                        {demande.representantLegal.fonction && (
                          <p className="text-sm text-gray-500">
                            {demande.representantLegal.fonction}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-blue-100">
                      {demande.representantLegal.email && (
                        <a
                          href={`mailto:${demande.representantLegal.email}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">
                            {demande.representantLegal.email}
                          </span>
                        </a>
                      )}
                      {demande.representantLegal.telephone && (
                        <a
                          href={`tel:${demande.representantLegal.telephone}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">
                            {demande.representantLegal.telephone}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {demande.statut === "rejetee" && demande.commentaireAdmin && (
            <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900 mb-2 text-lg">
                    Raison du rejet
                  </h3>
                  <p className="text-red-700">{demande.commentaireAdmin}</p>
                </div>
              </div>
            </Card>
          )}

          {demande.statut === "validee" && demande.montantMensuel && (
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 mb-2 text-lg">
                    Tarif mensuel
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {Number(demande.montantMensuel).toLocaleString()} DA
                    <span className="text-base font-normal text-emerald-700">
                      {" "}
                      / mois
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {demande.statut === "rejetee" && (
            <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Soumettre une nouvelle demande
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Vous pouvez corriger les informations et soumettre une nouvelle
                demande de domiciliation.
              </p>
              <Button
                onClick={handleOpenModal}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle demande
              </Button>
            </Card>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!hasCompanyInfo ? (
            <Card className="p-12 text-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/25">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Completez d'abord vos informations
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Avant de faire une demande de domiciliation, vous devez
                renseigner les informations de votre entreprise dans la section
                "Mon Entreprise".
              </p>
              <Link to="/app/mon-entreprise">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                >
                  <Building className="w-5 h-5 mr-2" />
                  Completer mes informations
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 md:p-12 text-white relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIG9wYWNpdHk9Ii4xIiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
                  <div className="relative max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-8 h-8" />
                      <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        Mohammadia Mall, Alger
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Domiciliez votre entreprise
                    </h2>
                    <p className="text-lg text-white/90 mb-6">
                      Beneficiez d'une adresse prestigieuse au coeur d'Alger et
                      profitez de tous nos services professionnels.
                    </p>
                    <Button
                      onClick={handleOpenModal}
                      size="lg"
                      className="bg-white text-amber-600 hover:bg-gray-100 shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Faire une demande
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 ${benefit.bg} border-0 hover:shadow-lg transition-shadow`}
                    >
                      <div
                        className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="p-8">
                <div className="text-center mb-8">
                  <Award className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Notre offre
                  </h3>
                  <p className="text-gray-600">
                    Tout ce dont vous avez besoin pour votre entreprise
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-sm text-amber-600 font-medium mb-2">
                        Tarif mensuel
                      </p>
                      <p className="text-4xl font-bold text-gray-900">
                        12 000{" "}
                        <span className="text-xl text-gray-600">DA/mois</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">HT</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {[
                        "Adresse commerciale officielle",
                        "Reception du courrier",
                        "Salle de reunion (2h/mois)",
                        "Assistance administrative",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentStep(1);
          setErrors({});
        }}
        title="Demande de Domiciliation"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.id
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-3 rounded-full ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-500" />
                  Informations de l'Entreprise
                </h3>

                <div>
                  <Input
                    label="Raison Sociale"
                    icon={<Building className="w-5 h-5" />}
                    value={formData.raisonSociale}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        raisonSociale: e.target.value,
                      });
                      if (errors.raisonSociale)
                        setErrors({ ...errors, raisonSociale: "" });
                    }}
                    placeholder="Ex: SARL Innovation Tech"
                    className={errors.raisonSociale ? "border-red-500" : ""}
                  />
                  {errors.raisonSociale && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.raisonSociale}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forme Juridique <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.formeJuridique}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          formeJuridique: e.target.value,
                        });
                        if (errors.formeJuridique)
                          setErrors({ ...errors, formeJuridique: "" });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                        errors.formeJuridique
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">Selectionnez</option>
                      <option value="SARL">SARL</option>
                      <option value="EURL">EURL</option>
                      <option value="SPA">SPA</option>
                      <option value="SNC">SNC</option>
                      <option value="EI">Entreprise Individuelle</option>
                      <option value="AUTO">Auto-Entrepreneur</option>
                    </select>
                    {errors.formeJuridique && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.formeJuridique}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Domaine d'Activite"
                      icon={<Briefcase className="w-5 h-5" />}
                      value={formData.domaineActivite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          domaineActivite: e.target.value,
                        })
                      }
                      placeholder="Ex: Services informatiques"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="NIF"
                      icon={<Hash className="w-5 h-5" />}
                      value={formData.nif}
                      onChange={(e) => {
                        setFormData({ ...formData, nif: e.target.value });
                        if (errors.nif) setErrors({ ...errors, nif: "" });
                      }}
                      placeholder="099012345678901"
                      className={errors.nif ? "border-red-500" : ""}
                    />
                    {errors.nif && (
                      <p className="text-red-500 text-sm mt-1">{errors.nif}</p>
                    )}
                  </div>

                  <Input
                    label="NIS"
                    icon={<Hash className="w-5 h-5" />}
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    placeholder="123456789012345"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Registre de Commerce"
                    icon={<FileText className="w-5 h-5" />}
                    value={formData.registreCommerce}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registreCommerce: e.target.value,
                      })
                    }
                    placeholder="16/00-1234567A23"
                  />

                  <Input
                    label="Article d'Imposition"
                    icon={<FileText className="w-5 h-5" />}
                    value={formData.articleImposition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        articleImposition: e.target.value,
                      })
                    }
                    placeholder="16123456789"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Representant Legal
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Nom"
                      icon={<User className="w-5 h-5" />}
                      value={formData.representantLegal.nom}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          representantLegal: {
                            ...formData.representantLegal,
                            nom: e.target.value,
                          },
                        });
                        if (errors["representantLegal.nom"]) {
                          const newErrors = { ...errors };
                          delete newErrors["representantLegal.nom"];
                          setErrors(newErrors);
                        }
                      }}
                      className={
                        errors["representantLegal.nom"] ? "border-red-500" : ""
                      }
                    />
                    {errors["representantLegal.nom"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["representantLegal.nom"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Prenom"
                      icon={<User className="w-5 h-5" />}
                      value={formData.representantLegal.prenom}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          representantLegal: {
                            ...formData.representantLegal,
                            prenom: e.target.value,
                          },
                        });
                        if (errors["representantLegal.prenom"]) {
                          const newErrors = { ...errors };
                          delete newErrors["representantLegal.prenom"];
                          setErrors(newErrors);
                        }
                      }}
                      className={
                        errors["representantLegal.prenom"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors["representantLegal.prenom"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["representantLegal.prenom"]}
                      </p>
                    )}
                  </div>
                </div>

                <Input
                  label="Fonction"
                  value={formData.representantLegal.fonction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      representantLegal: {
                        ...formData.representantLegal,
                        fonction: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Gerant"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Telephone"
                    icon={<Phone className="w-5 h-5" />}
                    value={formData.representantLegal.telephone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        representantLegal: {
                          ...formData.representantLegal,
                          telephone: e.target.value,
                        },
                      })
                    }
                    placeholder="+213 XXX XX XX XX"
                  />

                  <div>
                    <Input
                      label="Email"
                      type="email"
                      icon={<Mail className="w-5 h-5" />}
                      value={formData.representantLegal.email}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          representantLegal: {
                            ...formData.representantLegal,
                            email: e.target.value,
                          },
                        });
                        if (errors["representantLegal.email"]) {
                          const newErrors = { ...errors };
                          delete newErrors["representantLegal.email"];
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="email@exemple.com"
                      className={
                        errors["representantLegal.email"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors["representantLegal.email"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["representantLegal.email"]}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  Confirmation
                </h3>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-2">
                        Pret a soumettre
                      </h4>
                      <p className="text-sm text-emerald-700">
                        Verifiez les informations ci-dessous avant de soumettre
                        votre demande. Notre equipe traitera votre demande sous
                        48h ouvrees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-amber-500" />
                      Entreprise
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Raison sociale:</span>
                        <p className="font-medium text-gray-900">
                          {formData.raisonSociale}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Forme juridique:</span>
                        <p className="font-medium text-gray-900">
                          {formData.formeJuridique}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">NIF:</span>
                        <p className="font-medium text-gray-900">
                          {formData.nif}
                        </p>
                      </div>
                      {formData.domaineActivite && (
                        <div>
                          <span className="text-gray-500">Domaine:</span>
                          <p className="font-medium text-gray-900">
                            {formData.domaineActivite}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Representant
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Nom complet:</span>
                        <p className="font-medium text-gray-900">
                          {formData.representantLegal.prenom}{" "}
                          {formData.representantLegal.nom}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium text-gray-900">
                          {formData.representantLegal.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium mb-1">Avant de soumettre:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>
                          Verifiez que toutes les informations sont exactes
                        </li>
                        <li>
                          Assurez-vous d'avoir vos documents officiels a
                          disposition
                        </li>
                        <li>
                          Un traitement sous 48h ouvrees vous sera propose
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between gap-3 pt-4 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Precedent
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Envoyer la demande
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Domiciliation;
