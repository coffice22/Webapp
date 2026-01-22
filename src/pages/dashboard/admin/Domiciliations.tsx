import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  TrendingUp,
  DollarSign,
  Ban,
  PlayCircle,
  RefreshCw,
  CheckCheck,
  XOctagon,
} from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { useAppStore } from "../../../store/store";
import { formatDate, formatCurrency } from "../../../utils/formatters";
import toast from "react-hot-toast";
import type { DemandeDomiciliation } from "../../../types";
import { apiClient } from "../../../lib/api-client";

const AdminDomiciliations = () => {
  const { demandesDomiciliation, loadDemandesDomiciliation } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [selectedDemande, setSelectedDemande] =
    useState<DemandeDomiciliation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionType, setActionType] = useState<
    "valider" | "rejeter" | "activer"
  >("valider");
  const [commentaire, setCommentaire] = useState("");
  const [montantMensuel, setMontantMensuel] = useState(15000);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [modePaiement, setModePaiement] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [createFormData, setCreateFormData] = useState<any>({
    user_id: "",
    raison_sociale: "",
    forme_juridique: "SARL",
    nif: "",
    nis: "",
    registre_commerce: "",
    article_imposition: "",
    numero_auto_entrepreneur: "",
    capital: "",
    activite_principale: "",
    domaine_activite: "",
    wilaya: "",
    commune: "",
    adresse_actuelle: "",
    adresse_siege_social: "",
    representant_nom: "",
    representant_prenom: "",
    representant_fonction: "",
    representant_telephone: "",
    representant_email: "",
    coordonnees_fiscales: "",
    coordonnees_administratives: "",
    date_creation_entreprise: "",
    statut: "active",
    montant_mensuel: 15000,
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    mode_paiement: "cash",
    notes_admin: "",
  });

  useEffect(() => {
    loadDemandesDomiciliation();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get("/api/users/index.php");
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const filteredDemandes = demandesDomiciliation.filter((demande) => {
    const matchesSearch =
      demande.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.representantLegal.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "tous" || demande.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: demandesDomiciliation.length,
    enAttente: demandesDomiciliation.filter((d) => d.statut === "en_attente")
      .length,
    validees: demandesDomiciliation.filter((d) => d.statut === "validee")
      .length,
    actives: demandesDomiciliation.filter((d) => d.statut === "active").length,
    refusees: demandesDomiciliation.filter((d) => d.statut === "refusee")
      .length,
    revenuMensuel: demandesDomiciliation
      .filter((d) => d.statut === "active")
      .reduce((sum, d) => sum + (d.montantMensuel || 0), 0),
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<
      string,
      {
        variant: "warning" | "success" | "danger" | "default";
        icon: React.ReactNode;
        label: string;
      }
    > = {
      en_attente: {
        variant: "warning",
        icon: <Clock className="w-3 h-3 mr-1" />,
        label: "En attente",
      },
      validee: {
        variant: "success",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Validée",
      },
      active: {
        variant: "success",
        icon: <PlayCircle className="w-3 h-3 mr-1" />,
        label: "Active",
      },
      refusee: {
        variant: "danger",
        icon: <XCircle className="w-3 h-3 mr-1" />,
        label: "Refusée",
      },
      resiliee: {
        variant: "danger",
        icon: <Ban className="w-3 h-3 mr-1" />,
        label: "Résiliée",
      },
      expiree: {
        variant: "default",
        icon: <AlertCircle className="w-3 h-3 mr-1" />,
        label: "Expirée",
      },
    };

    const badge = badges[statut] || badges.en_attente;
    return (
      <Badge variant={badge.variant}>
        {badge.icon}
        {badge.label}
      </Badge>
    );
  };

  const handleAction = (
    demande: DemandeDomiciliation,
    action: "valider" | "rejeter" | "activer",
  ) => {
    setSelectedDemande(demande);
    setActionType(action);
    setCommentaire("");

    if (action === "activer") {
      setMontantMensuel(15000);
      const debut = new Date();
      const fin = new Date();
      fin.setFullYear(fin.getFullYear() + 1);
      setDateDebut(debut.toISOString().split("T")[0]);
      setDateFin(fin.toISOString().split("T")[0]);
      setModePaiement("cash");
    }

    setShowActionModal(true);
  };

  const handleViewDetails = (demande: DemandeDomiciliation) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  const submitAction = async () => {
    if (!selectedDemande) return;

    if (actionType === "rejeter" && !commentaire.trim()) {
      toast.error("Veuillez préciser la raison du rejet");
      return;
    }

    if (actionType === "activer" && montantMensuel <= 0) {
      toast.error("Le montant mensuel doit être supérieur à 0");
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      let payload: any = { domiciliation_id: selectedDemande.id };

      if (actionType === "valider") {
        endpoint = "/api/domiciliations/validate.php";
        payload.commentaire = commentaire;
      } else if (actionType === "rejeter") {
        endpoint = "/api/domiciliations/reject.php";
        payload.commentaire = commentaire;
      } else if (actionType === "activer") {
        endpoint = "/api/domiciliations/activate.php";
        payload = {
          ...payload,
          montant_mensuel: montantMensuel,
          date_debut: dateDebut,
          date_fin: dateFin,
          mode_paiement: modePaiement,
        };
      }

      const response = await apiClient.post(endpoint, payload);

      if (response.success) {
        toast.success(
          actionType === "valider"
            ? "Demande validée avec succès"
            : actionType === "rejeter"
              ? "Demande rejetée"
              : "Domiciliation activée avec succès",
        );
        setShowActionModal(false);
        await loadDemandesDomiciliation();
      } else {
        toast.error(response.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Erreur lors du traitement de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDomiciliation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !createFormData.user_id ||
      !createFormData.raison_sociale ||
      !createFormData.forme_juridique
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/domiciliations/create.php", {
        ...createFormData,
        capital: createFormData.capital
          ? parseFloat(createFormData.capital)
          : null,
        montant_mensuel: parseFloat(createFormData.montant_mensuel),
      });

      if (response.success) {
        toast.success("Domiciliation créée avec succès");
        setShowCreateModal(false);
        setCreateFormData({
          user_id: "",
          raison_sociale: "",
          forme_juridique: "SARL",
          nif: "",
          nis: "",
          registre_commerce: "",
          article_imposition: "",
          numero_auto_entrepreneur: "",
          capital: "",
          activite_principale: "",
          domaine_activite: "",
          wilaya: "",
          commune: "",
          adresse_actuelle: "",
          adresse_siege_social: "",
          representant_nom: "",
          representant_prenom: "",
          representant_fonction: "",
          representant_telephone: "",
          representant_email: "",
          coordonnees_fiscales: "",
          coordonnees_administratives: "",
          date_creation_entreprise: "",
          statut: "active",
          montant_mensuel: 15000,
          date_debut: new Date().toISOString().split("T")[0],
          date_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          mode_paiement: "cash",
          notes_admin: "",
        });
        await loadDemandesDomiciliation();
      } else {
        toast.error(response.message || "Erreur lors de la création");
      }
    } catch (error: any) {
      console.error("Create domiciliation error:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de la domiciliation",
      );
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Raison Sociale",
        "NIF",
        "NIS",
        "Forme Juridique",
        "Statut",
        "Date Création",
        "Représentant",
        "Email",
        "Téléphone",
        "Montant Mensuel",
      ],
      ...filteredDemandes.map((d) => [
        d.raisonSociale,
        d.nif || "",
        d.nis || "",
        d.formeJuridique,
        d.statut,
        formatDate(d.dateCreation),
        `${d.representantLegal.prenom} ${d.representantLegal.nom}`,
        d.representantLegal.email || "",
        d.representantLegal.telephone || "",
        d.montantMensuel ? formatCurrency(d.montantMensuel) : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `domiciliations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Domiciliations
          </h1>
          <p className="text-gray-600 mt-1">
            Administration des demandes de domiciliation d'entreprises
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Domiciliation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Building className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">En Attente</p>
              <p className="text-3xl font-bold text-amber-900">
                {stats.enAttente}
              </p>
            </div>
            <Clock className="w-10 h-10 text-amber-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Validées</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.validees}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Actives</p>
              <p className="text-3xl font-bold text-emerald-900">
                {stats.actives}
              </p>
            </div>
            <PlayCircle className="w-10 h-10 text-emerald-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Revenu/Mois</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.revenuMensuel)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher par raison sociale, NIF, représentant..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validées</option>
            <option value="active">Actives</option>
            <option value="refusee">Refusées</option>
            <option value="resiliee">Résiliées</option>
            <option value="expiree">Expirées</option>
          </select>
        </div>
      </Card>

      {/* Liste des demandes */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identifiants
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Représentant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <motion.tr
                    key={demande.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {demande.raisonSociale}
                        </p>
                        <p className="text-sm text-gray-500">
                          {demande.formeJuridique}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          NIF: {demande.nif || "N/A"}
                        </p>
                        <p className="text-gray-500">
                          NIS: {demande.nis || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {demande.representantLegal.prenom}{" "}
                          {demande.representantLegal.nom}
                        </p>
                        <p className="text-gray-500">
                          {demande.representantLegal.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(demande.statut)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(demande.dateCreation)}
                    </td>
                    <td className="px-6 py-4">
                      {demande.montantMensuel ? (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(demande.montantMensuel)}/mois
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(demande)}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {demande.statut === "en_attente" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(demande, "valider")}
                              title="Valider la demande"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(demande, "rejeter")}
                              title="Rejeter la demande"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XOctagon className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {demande.statut === "validee" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(demande, "activer")}
                            title="Activer la domiciliation"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Activer
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la demande de domiciliation"
      >
        {selectedDemande && (
          <div className="space-y-6">
            {/* Informations Entreprise */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <Building className="w-5 h-5 mr-2 text-accent" />
                Informations Entreprise
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Raison Sociale</p>
                  <p className="font-medium">{selectedDemande.raisonSociale}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forme Juridique</p>
                  <p className="font-medium">
                    {selectedDemande.formeJuridique}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIF</p>
                  <p className="font-medium">
                    {selectedDemande.nif || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIS</p>
                  <p className="font-medium">
                    {selectedDemande.nis || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RC</p>
                  <p className="font-medium">
                    {selectedDemande.registreCommerce || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Article Imposition</p>
                  <p className="font-medium">
                    {selectedDemande.articleImposition || "Non renseigné"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Domaine d'Activité</p>
                  <p className="font-medium">
                    {selectedDemande.domaineActivite || "Non renseigné"}
                  </p>
                </div>
                {selectedDemande.capital && (
                  <div>
                    <p className="text-sm text-gray-600">Capital</p>
                    <p className="font-medium">
                      {formatCurrency(selectedDemande.capital)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Représentant Légal */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Représentant Légal
              </h3>
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {selectedDemande.representantLegal.prenom}{" "}
                    {selectedDemande.representantLegal.nom}
                  </span>
                  {selectedDemande.representantLegal.fonction && (
                    <span className="text-sm text-gray-500">
                      - {selectedDemande.representantLegal.fonction}
                    </span>
                  )}
                </div>
                {selectedDemande.representantLegal.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${selectedDemande.representantLegal.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedDemande.representantLegal.email}
                    </a>
                  </div>
                )}
                {selectedDemande.representantLegal.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${selectedDemande.representantLegal.telephone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedDemande.representantLegal.telephone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Statut et Informations */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Statut et Informations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut actuel</p>
                    {getStatusBadge(selectedDemande.statut)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">
                      {formatDate(selectedDemande.dateCreation)}
                    </p>
                  </div>
                </div>

                {selectedDemande.statut === "active" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">
                          Montant Mensuel
                        </p>
                        <p className="text-xl font-bold text-emerald-900">
                          {selectedDemande.montantMensuel
                            ? formatCurrency(selectedDemande.montantMensuel)
                            : "N/A"}
                        </p>
                      </div>
                      {selectedDemande.dateDebut && (
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">
                            Date début
                          </p>
                          <p className="font-medium text-emerald-900">
                            {formatDate(selectedDemande.dateDebut)}
                          </p>
                        </div>
                      )}
                      {selectedDemande.dateFin && (
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">
                            Date fin
                          </p>
                          <p className="font-medium text-emerald-900">
                            {formatDate(selectedDemande.dateFin)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedDemande.commentaireAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Notes Admin
                </p>
                <p className="text-sm text-amber-700">
                  {selectedDemande.commentaireAdmin}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Action */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === "valider"
            ? "Valider la demande de domiciliation"
            : actionType === "rejeter"
              ? "Rejeter la demande de domiciliation"
              : "Activer la domiciliation"
        }
      >
        <div className="space-y-4">
          {actionType === "activer" ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Vous allez activer la domiciliation pour{" "}
                  <strong>{selectedDemande?.raisonSociale}</strong>. Une
                  transaction sera créée automatiquement.
                </p>
              </div>

              <Input
                label="Montant Mensuel (DA)"
                type="number"
                value={montantMensuel}
                onChange={(e) => setMontantMensuel(parseFloat(e.target.value))}
                min="0"
                step="1000"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date Début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                />
                <Input
                  label="Date Fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de Paiement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="cash">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire{" "}
                {actionType === "rejeter" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={
                  actionType === "valider"
                    ? "Commentaire optionnel..."
                    : "Veuillez préciser la raison du rejet (obligatoire)..."
                }
                required={actionType === "rejeter"}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={submitAction}
              disabled={
                loading || (actionType === "rejeter" && !commentaire.trim())
              }
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {actionType === "valider" && (
                    <CheckCheck className="w-4 h-4 mr-2" />
                  )}
                  {actionType === "rejeter" && (
                    <XOctagon className="w-4 h-4 mr-2" />
                  )}
                  {actionType === "activer" && (
                    <PlayCircle className="w-4 h-4 mr-2" />
                  )}
                  {actionType === "valider"
                    ? "Valider"
                    : actionType === "rejeter"
                      ? "Rejeter"
                      : "Activer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer une nouvelle domiciliation"
      >
        <form
          onSubmit={handleCreateDomiciliation}
          className="space-y-6 max-h-[70vh] overflow-y-auto px-1"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Créez directement une domiciliation active pour un utilisateur
              existant
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilisateur <span className="text-red-500">*</span>
            </label>
            <select
              value={createFormData.user_id}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  user_id: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom} - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-lg flex items-center">
              <Building className="w-5 h-5 mr-2 text-accent" />
              Informations Entreprise
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Raison Sociale"
                value={createFormData.raison_sociale}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    raison_sociale: e.target.value,
                  })
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forme Juridique <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.forme_juridique}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      forme_juridique: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                >
                  <option value="EURL">EURL</option>
                  <option value="SARL">SARL</option>
                  <option value="SPA">SPA</option>
                  <option value="SNC">SNC</option>
                  <option value="SCS">SCS</option>
                  <option value="Auto-Entrepreneur">Auto-Entrepreneur</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="NIF"
                value={createFormData.nif}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, nif: e.target.value })
                }
                maxLength={20}
                placeholder="20 caractères"
              />
              <Input
                label="NIS"
                value={createFormData.nis}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, nis: e.target.value })
                }
                maxLength={15}
                placeholder="15 caractères"
              />
              <Input
                label="Registre Commerce"
                value={createFormData.registre_commerce}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    registre_commerce: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Article Imposition"
                value={createFormData.article_imposition}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    article_imposition: e.target.value,
                  })
                }
              />
              <Input
                label="Numéro Auto-Entrepreneur"
                value={createFormData.numero_auto_entrepreneur}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    numero_auto_entrepreneur: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capital (DA)"
                type="number"
                value={createFormData.capital}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    capital: e.target.value,
                  })
                }
                min="0"
                step="1000"
              />
              <Input
                label="Domaine d'Activité"
                value={createFormData.domaine_activite}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    domaine_activite: e.target.value,
                  })
                }
              />
            </div>

            <Input
              label="Activité Principale"
              value={createFormData.activite_principale}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  activite_principale: e.target.value,
                })
              }
            />

            <Input
              label="Date de Création Entreprise"
              type="date"
              value={createFormData.date_creation_entreprise}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  date_creation_entreprise: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-lg flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Représentant Légal
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Nom"
                value={createFormData.representant_nom}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    representant_nom: e.target.value,
                  })
                }
              />
              <Input
                label="Prénom"
                value={createFormData.representant_prenom}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    representant_prenom: e.target.value,
                  })
                }
              />
              <Input
                label="Fonction"
                value={createFormData.representant_fonction}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    representant_fonction: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={createFormData.representant_email}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    representant_email: e.target.value,
                  })
                }
              />
              <Input
                label="Téléphone"
                value={createFormData.representant_telephone}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    representant_telephone: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Adresses
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Wilaya"
                value={createFormData.wilaya}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    wilaya: e.target.value,
                  })
                }
              />
              <Input
                label="Commune"
                value={createFormData.commune}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    commune: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Actuelle
              </label>
              <textarea
                value={createFormData.adresse_actuelle}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    adresse_actuelle: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Siège Social
              </label>
              <textarea
                value={createFormData.adresse_siege_social}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    adresse_siege_social: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
              Informations Contrat
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={createFormData.statut}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      statut: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="en_attente">En attente</option>
                  <option value="validee">Validée</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <Input
                label="Montant Mensuel (DA)"
                type="number"
                value={createFormData.montant_mensuel}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    montant_mensuel: e.target.value,
                  })
                }
                required
                min="0"
                step="1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date Début"
                type="date"
                value={createFormData.date_debut}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    date_debut: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Date Fin"
                type="date"
                value={createFormData.date_fin}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    date_fin: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de Paiement
              </label>
              <select
                value={createFormData.mode_paiement}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    mode_paiement: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="cash">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes Admin
              </label>
              <textarea
                value={createFormData.notes_admin}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    notes_admin: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Notes internes..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Création..." : "Créer la Domiciliation"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDomiciliations;
