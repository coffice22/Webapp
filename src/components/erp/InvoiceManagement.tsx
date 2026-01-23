import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Printer,
  Mail,
  Copy,
  RefreshCw,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { Invoice, InvoiceItem } from "../../types/erp";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const InvoiceManagement = () => {
  const {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    members,
    getMemberById,
    generateInvoice,
    markInvoiceAsPaid,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sortBy, setSortBy] = useState("issueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newInvoice, setNewInvoice] = useState({
    memberId: "",
    items: [
      { description: "", quantity: 1, unitPrice: 0, taxRate: 19, discount: 0 },
    ],
    notes: "",
    dueDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // +15 jours par défaut
  });

  const [paymentData, setPaymentData] = useState({
    method: "cib",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const filteredInvoices = invoices
    .filter((invoice) => {
      const member = getMemberById(invoice.memberId);
      const memberName = member ? `${member.firstName} ${member.lastName}` : "";

      const matchesSearch =
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const today = new Date().toDateString();
        matchesDate = new Date(invoice.issueDate).toDateString() === today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(invoice.issueDate) >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(invoice.issueDate) >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "number":
          comparison = a.number.localeCompare(b.number);
          break;
        case "issueDate":
          comparison =
            new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
        case "dueDate":
          comparison =
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "member":
          const memberA = getMemberById(a.memberId);
          const memberB = getMemberById(b.memberId);
          comparison = (memberA?.lastName || "").localeCompare(
            memberB?.lastName || "",
          );
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "info";
      case "draft":
        return "default";
      case "overdue":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "sent":
        return "Envoyée";
      case "draft":
        return "Brouillon";
      case "overdue":
        return "En retard";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      deleteInvoice(invoiceId);
      toast.success("Facture supprimée avec succès");
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;

    updateInvoice(invoiceId, { status: "sent" });
    toast.success("Facture envoyée avec succès");
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;

    const result = markInvoiceAsPaid(selectedInvoice.id, paymentData.method);

    if (result.success) {
      toast.success("Facture marquée comme payée");
      setShowPaymentModal(false);
      setPaymentData({
        method: "cib",
        reference: "",
        notes: "",
      });
    } else {
      toast.error(result.error || "Erreur lors du traitement du paiement");
    }
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.memberId) {
      toast.error("Veuillez sélectionner un membre");
      return;
    }

    if (
      newInvoice.items.length === 0 ||
      newInvoice.items.some((item) => !item.description || item.quantity <= 0)
    ) {
      toast.error("Veuillez ajouter au moins un article valide");
      return;
    }

    const result = generateInvoice(
      newInvoice.memberId,
      newInvoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        type: "other",
      })),
    );

    if (result.success) {
      toast.success("Facture créée avec succès");
      setShowCreateModal(false);
      setNewInvoice({
        memberId: "",
        items: [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 19,
            discount: 0,
          },
        ],
        notes: "",
        dueDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
      });
    } else {
      toast.error(result.error || "Erreur lors de la création de la facture");
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 19,
          discount: 0,
        },
      ],
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTax = (items: any[]) => {
    return items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice * item.taxRate) / 100,
      0,
    );
  };

  const calculateDiscount = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const calculateTotal = (items: any[]) => {
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(items);
    const discount = calculateDiscount(items);
    return subtotal + tax - discount;
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const generatePDF = (invoice: Invoice) => {
    const member = getMemberById(invoice.memberId);
    if (!member) return;

    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.text("FACTURE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("Coffice Coworking", 20, 30);
    doc.text("Centre-ville, Alger", 20, 35);
    doc.text("Algérie", 20, 40);
    doc.text("desk@coffice.dz", 20, 45);
    doc.text("+213 23 804 924", 20, 50);

    // Informations client
    doc.text("Facturé à:", 140, 30);
    doc.text(`${member.firstName} ${member.lastName}`, 140, 35);
    doc.text(member.companyName || "", 140, 40);
    doc.text(member.billingAddress?.street || "", 140, 45);
    doc.text(
      `${member.billingAddress?.city || ""}, ${member.billingAddress?.postalCode || ""}`,
      140,
      50,
    );

    // Informations facture
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 60, 170, 10, "F");
    doc.setTextColor(0, 0, 0);
    doc.text("Numéro de facture:", 22, 67);
    doc.text(invoice.number, 70, 67);
    doc.text("Date d'émission:", 100, 67);
    doc.text(formatDate(invoice.issueDate), 140, 67);

    doc.setFillColor(240, 240, 240);
    doc.rect(20, 75, 170, 10, "F");
    doc.text("Date d'échéance:", 22, 82);
    doc.text(formatDate(invoice.dueDate), 70, 82);
    doc.text("Statut:", 100, 82);
    doc.text(getStatusLabel(invoice.status), 140, 82);

    // Tableau des articles
    const tableColumn = [
      "Description",
      "Quantité",
      "Prix unitaire",
      "TVA",
      "Remise",
      "Total",
    ];
    const tableRows = invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      `${item.taxRate}%`,
      formatCurrency(item.discount),
      formatCurrency(item.total),
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text("Sous-total:", 130, finalY);
    doc.text(formatCurrency(invoice.subtotal), 170, finalY, { align: "right" });

    doc.text("TVA:", 130, finalY + 7);
    doc.text(formatCurrency(invoice.taxAmount), 170, finalY + 7, {
      align: "right",
    });

    doc.text("Remise:", 130, finalY + 14);
    doc.text(formatCurrency(invoice.discount), 170, finalY + 14, {
      align: "right",
    });

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Total:", 130, finalY + 24);
    doc.text(formatCurrency(invoice.total), 170, finalY + 24, {
      align: "right",
    });

    // Notes
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text("Notes:", 20, finalY + 35);
      doc.text(invoice.notes, 20, finalY + 42);
    }

    // Pied de page
    doc.setFontSize(8);
    doc.text("Merci pour votre confiance.", 105, 280, { align: "center" });
    doc.text("Coffice SARL - SIRET: 123456789 - TVA: FR12345678900", 105, 285, {
      align: "center",
    });

    // Enregistrer le PDF
    doc.save(`facture-${invoice.number}.pdf`);
    toast.success("Facture téléchargée avec succès");
  };

  const exportInvoices = () => {
    const invoicesData = filteredInvoices.map((invoice) => {
      const member = getMemberById(invoice.memberId);

      return {
        number: invoice.number,
        client: member
          ? `${member.firstName} ${member.lastName}`
          : "Client inconnu",
        company: member?.companyName || "N/A",
        issueDate: formatDate(invoice.issueDate),
        dueDate: formatDate(invoice.dueDate),
        status: getStatusLabel(invoice.status),
        subtotal: formatCurrency(invoice.subtotal),
        tax: formatCurrency(invoice.taxAmount),
        discount: formatCurrency(invoice.discount),
        total: formatCurrency(invoice.total),
        paidDate: invoice.paidDate ? formatDate(invoice.paidDate) : "N/A",
        paymentMethod: invoice.paymentMethod || "N/A",
      };
    });

    const dataStr = JSON.stringify(invoicesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-invoices-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Factures exportées avec succès");
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
            Gestion des Factures
          </h1>
          <p className="text-gray-600">
            Gérez toutes les factures de votre coworking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportInvoices}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Factures</p>
              <p className="text-2xl font-bold text-primary">
                {invoices.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Factures Payées</p>
              <p className="text-2xl font-bold text-primary">
                {invoices.filter((i) => i.status === "paid").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-primary">
                {invoices.filter((i) => i.status === "sent").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-primary">
                {invoices.filter((i) => i.status === "overdue").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher une facture..."
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
            <option value="draft">Brouillons</option>
            <option value="sent">Envoyées</option>
            <option value="paid">Payées</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulées</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("number")}
                >
                  <div className="flex items-center">
                    Numéro
                    {sortBy === "number" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("member")}
                >
                  <div className="flex items-center">
                    Client
                    {sortBy === "member" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("issueDate")}
                >
                  <div className="flex items-center">
                    Date d'émission
                    {sortBy === "issueDate" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("dueDate")}
                >
                  <div className="flex items-center">
                    Échéance
                    {sortBy === "dueDate" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("total")}
                >
                  <div className="flex items-center">
                    Montant
                    {sortBy === "total" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map((invoice, index) => {
                const member = getMemberById(invoice.memberId);

                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.items.length} article
                            {invoice.items.length > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member
                          ? `${member.firstName} ${member.lastName}`
                          : "Client inconnu"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member?.companyName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.issueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.dueDate)}
                      </div>
                      {invoice.status === "overdue" && (
                        <div className="text-xs text-red-600">
                          En retard de{" "}
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(invoice.dueDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          jours
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {invoice.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}

                        {invoice.status === "sent" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentModal(true);
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(invoice)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        {invoice.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}{" "}
              sur {filteredInvoices.length} factures
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="Détails de la facture"
          size="lg"
        >
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-1">
                  Facture #{selectedInvoice.number}
                </h3>
                <Badge variant={getStatusVariant(selectedInvoice.status)}>
                  {getStatusLabel(selectedInvoice.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date d'émission</p>
                <p className="font-medium">
                  {formatDate(selectedInvoice.issueDate)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Date d'échéance</p>
                <p className="font-medium">
                  {formatDate(selectedInvoice.dueDate)}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Facturé à</p>
                <p className="font-medium">
                  {(() => {
                    const member = getMemberById(selectedInvoice.memberId);
                    return member
                      ? `${member.firstName} ${member.lastName}`
                      : "Client inconnu";
                  })()}
                </p>
                <p className="text-sm text-gray-700">
                  {(() => {
                    const member = getMemberById(selectedInvoice.memberId);
                    return member?.companyName || "";
                  })()}
                </p>
                <p className="text-sm text-gray-700">
                  {(() => {
                    const member = getMemberById(selectedInvoice.memberId);
                    return member?.email || "";
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Adresse de facturation
                </p>
                <p className="text-sm text-gray-700">
                  {selectedInvoice.billingAddress.street}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedInvoice.billingAddress.city},{" "}
                  {selectedInvoice.billingAddress.postalCode}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedInvoice.billingAddress.country}
                </p>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h4 className="font-medium text-primary mb-3">Articles</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TVA
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remise
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={`invoice-item-${item.description}-${index}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.taxRate}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.discount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                      >
                        Sous-total
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(selectedInvoice.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                      >
                        TVA
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(selectedInvoice.taxAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                      >
                        Remise
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(selectedInvoice.discount)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-bold text-primary text-right"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-primary text-right">
                        {formatCurrency(selectedInvoice.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Info */}
            {selectedInvoice.status === "paid" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">
                      Payée le {formatDate(selectedInvoice.paidDate!)}
                    </p>
                    <p className="text-sm text-green-700">
                      Méthode:{" "}
                      {selectedInvoice.paymentMethod === "cib"
                        ? "Carte CIB"
                        : selectedInvoice.paymentMethod === "dahabia"
                          ? "Carte Dahabia"
                          : selectedInvoice.paymentMethod === "cash"
                            ? "Espèces"
                            : selectedInvoice.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedInvoice.notes && (
              <div>
                <h4 className="font-medium text-primary mb-2">Notes</h4>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  {selectedInvoice.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => generatePDF(selectedInvoice)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>

              {selectedInvoice.status === "draft" && (
                <Button
                  onClick={() => handleSendInvoice(selectedInvoice.id)}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              )}

              {selectedInvoice.status === "sent" && (
                <Button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Marquer comme payée
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewInvoice({
            memberId: "",
            items: [
              {
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxRate: 19,
                discount: 0,
              },
            ],
            notes: "",
            dueDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
          });
        }}
        title="Créer une facture"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              value={newInvoice.memberId}
              onChange={(e) =>
                setNewInvoice((prev) => ({ ...prev, memberId: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="">Sélectionner un client</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}{" "}
                  {member.companyName ? `(${member.companyName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'échéance
            </label>
            <input
              type="date"
              value={newInvoice.dueDate.toISOString().split("T")[0]}
              onChange={(e) =>
                setNewInvoice((prev) => ({
                  ...prev,
                  dueDate: new Date(e.target.value),
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Articles
              </label>
              <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-4">
              {newInvoice.items.map((item, index) => (
                <div key={`new-item-${index}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-primary">
                      Article {index + 1}
                    </h4>
                    {newInvoice.items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateInvoiceItem(index, "description", e.target.value)
                      }
                      placeholder="Description de l'article"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Quantité"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />

                      <Input
                        label="Prix unitaire (DA)"
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Taux de TVA (%)"
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "taxRate",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />

                      <Input
                        label="Remise (DA)"
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "discount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Total:{" "}
                        {formatCurrency(
                          item.quantity * item.unitPrice - (item.discount || 0),
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={newInvoice.notes}
              onChange={(e) =>
                setNewInvoice((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Invoice Summary */}
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <h4 className="font-medium text-primary mb-3">Récapitulatif</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total:</span>
                <span className="font-medium">
                  {formatCurrency(calculateSubtotal(newInvoice.items))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA:</span>
                <span className="font-medium">
                  {formatCurrency(calculateTax(newInvoice.items))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remise:</span>
                <span className="font-medium">
                  {formatCurrency(calculateDiscount(newInvoice.items))}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-primary">Total:</span>
                  <span className="font-bold text-accent">
                    {formatCurrency(calculateTotal(newInvoice.items))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewInvoice({
                  memberId: "",
                  items: [
                    {
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                      taxRate: 19,
                      discount: 0,
                    },
                  ],
                  notes: "",
                  dueDate: new Date(
                    new Date().getTime() + 15 * 24 * 60 * 60 * 1000,
                  ),
                });
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateInvoice}
              className="flex-1"
              disabled={
                !newInvoice.memberId ||
                newInvoice.items.some(
                  (item) => !item.description || item.quantity <= 0,
                )
              }
            >
              Créer la facture
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData({
              method: "cib",
              reference: "",
              notes: "",
            });
          }}
          title="Enregistrer un paiement"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-primary mb-1">
                    Facture #{selectedInvoice.number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Client:{" "}
                    {(() => {
                      const member = getMemberById(selectedInvoice.memberId);
                      return member
                        ? `${member.firstName} ${member.lastName}`
                        : "Client inconnu";
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Montant dû</p>
                  <p className="text-xl font-bold text-accent">
                    {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                value={paymentData.method}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    method: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="cib">Carte CIB</option>
                <option value="dahabia">Carte Dahabia</option>
                <option value="cash">Espèces</option>
                <option value="transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
              </select>
            </div>

            <Input
              label="Référence de paiement (optionnel)"
              value={paymentData.reference}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
              placeholder="Ex: Numéro de transaction, chèque..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) =>
                  setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
                placeholder="Notes additionnelles..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData({
                    method: "cib",
                    reference: "",
                    notes: "",
                  });
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={handleMarkAsPaid} className="flex-1">
                Confirmer le paiement
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceManagement;
