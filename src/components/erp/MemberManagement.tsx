import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Download,
  ArrowUpDown,
  CreditCard,
  Calendar,
  Building,
  Tag,
  MoreHorizontal,
  UserPlus,
  FileText,
  MessageSquare,
  Star,
  Shield,
  RefreshCw,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { Member, MemberSubscription } from "../../types/erp";
import toast from "react-hot-toast";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const MemberManagement = () => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    subscriptions,
    getMemberSubscription,
    processSubscriptionPayment,
    memberships,
    getMembershipById,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    position: "",
    industry: "",
    status: "active" as "active" | "inactive" | "suspended",
    notes: "",
    marketingConsent: true,
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Algérie",
      isPrimary: true,
    },
  });

  const [subscriptionData, setSubscriptionData] = useState({
    membershipId: "",
    billingCycle: "monthly" as "monthly" | "annual",
    autoRenew: true,
    paymentMethod: "cib",
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const columnHelper = createColumnHelper<Member>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-xs text-gray-500">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: "fullName",
      header: () => <div className="flex items-center">Nom</div>,
      cell: (info) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {info.row.original.firstName.charAt(0)}
              {info.row.original.lastName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {info.getValue()}
            </div>
            <div className="text-sm text-gray-500">
              {info.row.original.email}
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("companyName", {
      header: () => <div className="flex items-center">Entreprise</div>,
      cell: (info) => (
        <div>
          <div className="text-sm text-gray-900">
            {info.getValue() || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.position || "N/A"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Statut",
      cell: (info) => {
        const status = info.getValue();
        const variant =
          status === "active"
            ? "success"
            : status === "inactive"
              ? "warning"
              : "error";
        return <Badge variant={variant}>{status}</Badge>;
      },
    }),
    columnHelper.accessor("joinDate", {
      header: "Inscription",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "subscription",
      header: "Abonnement",
      cell: (info) => {
        const subscription = getMemberSubscription(info.row.original.id);
        if (!subscription)
          return <span className="text-sm text-gray-500">Aucun</span>;

        const membership = getMembershipById(subscription.membershipId);
        return (
          <div>
            <Badge variant="info">{membership?.name || "N/A"}</Badge>
            <div className="text-xs text-gray-500 mt-1">
              Expire: {formatDate(subscription.endDate)}
            </div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMember(info.row.original);
              setShowMemberModal(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMember(info.row.original);
              setFormData({
                firstName: info.row.original.firstName,
                lastName: info.row.original.lastName,
                email: info.row.original.email,
                phone: info.row.original.phone || "",
                companyName: info.row.original.companyName || "",
                position: info.row.original.position || "",
                industry: info.row.original.industry || "",
                status: info.row.original.status,
                notes: info.row.original.notes || "",
                marketingConsent: info.row.original.marketingConsent,
                billingAddress: info.row.original.billingAddress || {
                  street: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "Algérie",
                  isPrimary: true,
                },
              });
              setIsEditing(true);
              setShowMemberModal(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMember(info.row.original);
              setShowSubscriptionModal(true);
            }}
          >
            <CreditCard className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteMember(info.row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.companyName &&
        member.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const table = useReactTable({
    data: filteredMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleCreateMember = () => {
    const newMember: Member = {
      id: `member-${Date.now()}`,
      userId: `user-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      position: formData.position,
      industry: formData.industry,
      status: formData.status,
      membershipType: "standard",
      joinDate: new Date(),
      notes: formData.notes,
      billingAddress: formData.billingAddress,
      marketingConsent: formData.marketingConsent,
      lastActivity: new Date(),
    };

    addMember(newMember);
    resetForm();
    setShowMemberModal(false);
    toast.success("Membre créé avec succès");
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;

    updateMember(selectedMember.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      position: formData.position,
      industry: formData.industry,
      status: formData.status,
      notes: formData.notes,
      billingAddress: formData.billingAddress,
      marketingConsent: formData.marketingConsent,
    });

    resetForm();
    setShowMemberModal(false);
    setIsEditing(false);
    setSelectedMember(null);
    toast.success("Membre mis à jour avec succès");
  };

  const handleDeleteMember = (memberId: string) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.",
      )
    ) {
      deleteMember(memberId);
      toast.success("Membre supprimé avec succès");
    }
  };

  const handleCreateSubscription = () => {
    if (!selectedMember || !subscriptionData.membershipId) {
      toast.error("Veuillez sélectionner un abonnement");
      return;
    }

    const result = processSubscriptionPayment(
      subscriptionData.membershipId,
      0,
      "card",
    );

    if (result.success) {
      toast.success("Abonnement créé avec succès");
      setShowSubscriptionModal(false);
      setSubscriptionData({
        membershipId: "",
        billingCycle: "monthly",
        autoRenew: true,
        paymentMethod: "cib",
      });
    } else {
      toast.error(result.error || "Erreur lors de la création de l'abonnement");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      position: "",
      industry: "",
      status: "active",
      notes: "",
      marketingConsent: true,
      billingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Algérie",
        isPrimary: true,
      },
    });
    setSelectedMember(null);
    setIsEditing(false);
  };

  const industryOptions = [
    "Technologie",
    "Finance",
    "Marketing",
    "Conseil",
    "E-commerce",
    "Éducation",
    "Santé",
    "Immobilier",
    "Médias",
    "Design",
    "Juridique",
    "Autre",
  ];

  const exportMembers = () => {
    const membersData = members.map((member) => {
      const subscription = getMemberSubscription(member.id);
      const membership = subscription
        ? getMembershipById(subscription.membershipId)
        : null;

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone || "N/A",
        company: member.companyName || "N/A",
        position: member.position || "N/A",
        industry: member.industry || "N/A",
        status: member.status,
        joinDate: formatDate(member.joinDate),
        subscription: membership ? membership.name : "Aucun",
        subscriptionEnd: subscription
          ? formatDate(subscription.endDate)
          : "N/A",
        lastActivity: member.lastActivity
          ? formatDate(member.lastActivity)
          : "N/A",
      };
    });

    const dataStr = JSON.stringify(membersData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-members-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Membres exportés avec succès");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">
            Gestion des Membres
          </h1>
          <p className="text-gray-600">
            Gérez tous les membres de votre coworking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportMembers}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowMemberModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouveau membre
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Membres</p>
              <p className="text-2xl font-bold text-primary">
                {members.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Membres Actifs</p>
              <p className="text-2xl font-bold text-primary">
                {members.filter((m) => m.status === "active").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-warm" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Abonnements Actifs</p>
              <p className="text-2xl font-bold text-primary">
                {subscriptions.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-primary">
                {
                  members.filter((m) => {
                    const now = new Date();
                    const joinDate = new Date(m.joinDate);
                    return (
                      joinDate.getMonth() === now.getMonth() &&
                      joinDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Rechercher un membre..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="suspended">Suspendus</option>
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                      )}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 border rounded text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Afficher {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      {/* Member Form Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => {
          setShowMemberModal(false);
          resetForm();
        }}
        title={isEditing ? "Modifier le membre" : "Ajouter un membre"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="Prénom"
            />

            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Nom"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="email@exemple.com"
            />

            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+213 23 804 924"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Entreprise"
              value={formData.companyName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              placeholder="Nom de l'entreprise"
            />

            <Input
              label="Poste"
              value={formData.position}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, position: e.target.value }))
              }
              placeholder="Ex: Développeur, Designer, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="">Sélectionner un secteur</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse de facturation
            </label>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <Input
                label="Rue"
                value={formData.billingAddress.street}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      street: e.target.value,
                    },
                  }))
                }
                placeholder="Adresse"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Ville"
                  value={formData.billingAddress.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress,
                        city: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ville"
                />

                <Input
                  label="État/Province"
                  value={formData.billingAddress.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress,
                        state: e.target.value,
                      },
                    }))
                  }
                  placeholder="État/Province"
                />

                <Input
                  label="Code postal"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billingAddress: {
                        ...prev.billingAddress,
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  placeholder="Code postal"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketingConsent"
              checked={formData.marketingConsent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  marketingConsent: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label
              htmlFor="marketingConsent"
              className="ml-2 text-sm text-gray-700"
            >
              Accepte de recevoir des communications marketing
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMemberModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={isEditing ? handleUpdateMember : handleCreateMember}
              className="flex-1"
              disabled={
                !formData.firstName || !formData.lastName || !formData.email
              }
            >
              {isEditing ? "Mettre à jour" : "Créer le membre"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subscription Modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setSubscriptionData({
            membershipId: "",
            billingCycle: "monthly",
            autoRenew: true,
            paymentMethod: "cib",
          });
        }}
        title="Gérer l'abonnement"
        size="md"
      >
        <div className="space-y-6">
          {selectedMember && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-primary mb-1">
                {selectedMember.firstName} {selectedMember.lastName}
              </h3>
              <p className="text-sm text-gray-600">{selectedMember.email}</p>

              {(() => {
                const subscription = getMemberSubscription(selectedMember.id);
                if (subscription) {
                  const membership = getMembershipById(
                    subscription.membershipId,
                  );
                  return (
                    <div className="mt-2">
                      <Badge variant="success">Abonnement actif</Badge>
                      <p className="text-sm text-gray-700 mt-1">
                        Plan:{" "}
                        <span className="font-medium">{membership?.name}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        Expire le:{" "}
                        <span className="font-medium">
                          {formatDate(subscription.endDate)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="mt-2">
                    <Badge variant="warning">Aucun abonnement actif</Badge>
                  </div>
                );
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan d'abonnement
            </label>
            <select
              value={subscriptionData.membershipId}
              onChange={(e) =>
                setSubscriptionData((prev) => ({
                  ...prev,
                  membershipId: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="">Sélectionner un plan</option>
              {memberships.map((membership) => (
                <option key={membership.id} value={membership.id}>
                  {membership.name} - {formatCurrency(membership.monthlyPrice)}
                  /mois
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cycle de facturation
              </label>
              <select
                value={subscriptionData.billingCycle}
                onChange={(e) =>
                  setSubscriptionData((prev) => ({
                    ...prev,
                    billingCycle: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="monthly">Mensuel</option>
                <option value="annual">Annuel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                value={subscriptionData.paymentMethod}
                onChange={(e) =>
                  setSubscriptionData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="cib">Carte CIB</option>
                <option value="dahabia">Carte Dahabia</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRenew"
              checked={subscriptionData.autoRenew}
              onChange={(e) =>
                setSubscriptionData((prev) => ({
                  ...prev,
                  autoRenew: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700">
              Renouvellement automatique
            </label>
          </div>

          {subscriptionData.membershipId && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-primary">Montant total</p>
                  <p className="text-sm text-gray-600">
                    {subscriptionData.billingCycle === "annual"
                      ? "Facturation annuelle"
                      : "Facturation mensuelle"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {(() => {
                      const membership = getMembershipById(
                        subscriptionData.membershipId,
                      );
                      if (!membership) return formatCurrency(0);

                      return formatCurrency(
                        subscriptionData.billingCycle === "annual"
                          ? membership.annualPrice
                          : membership.monthlyPrice,
                      );
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSubscriptionModal(false);
                setSubscriptionData({
                  membershipId: "",
                  billingCycle: "monthly",
                  autoRenew: true,
                  paymentMethod: "cib",
                });
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateSubscription}
              className="flex-1"
              disabled={!subscriptionData.membershipId}
            >
              Confirmer l'abonnement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberManagement;
