import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  CreditCard,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  User,
  Clock,
  Send,
  Printer,
  Receipt,
  ArrowRight,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Invoice, Payment, Member } from "../../types/erp";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const FinancialManagement = () => {
  const {
    invoices,
    payments,
    members,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    getMemberById,
    generateInvoice,
    markInvoiceAsPaid,
    addPayment,
    getPaymentById,
    processPayment,
    refundPayment,
  } = useERPStore();

  const [activeTab, setActiveTab] = useState<
    "invoices" | "payments" | "reports"
  >("invoices");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    memberId: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        type: "other",
      },
    ],
    notes: "",
  });

  const [newPayment, setNewPayment] = useState({
    memberId: "",
    amount: 0,
    method: "cib",
    invoiceId: "",
    notes: "",
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "warning";
      case "draft":
        return "default";
      case "overdue":
        return "error";
      case "cancelled":
        return "error";
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

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Complété";
      case "pending":
        return "En attente";
      case "failed":
        return "Échoué";
      case "refunded":
        return "Remboursé";
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cib":
        return "Carte CIB";
      case "dahabia":
        return "Carte Dahabia";
      case "cash":
        return "Espèces";
      case "refund":
        return "Remboursement";
      default:
        return method;
    }
  };

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
        case "date":
          comparison =
            new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
        case "number":
          comparison = a.number.localeCompare(b.number);
          break;
        case "member":
          const memberA = getMemberById(a.memberId);
          const memberB = getMemberById(b.memberId);
          comparison = (memberA?.lastName || "").localeCompare(
            memberB?.lastName || "",
          );
          break;
        case "amount":
          comparison = a.total - b.total;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const filteredPayments = payments
    .filter((payment) => {
      const member = getMemberById(payment.memberId);
      const memberName = member ? `${member.firstName} ${member.lastName}` : "";

      const matchesSearch =
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const today = new Date().toDateString();
        matchesDate = new Date(payment.date).toDateString() === today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(payment.date) >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(payment.date) >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "member":
          const memberA = getMemberById(a.memberId);
          const memberB = getMemberById(b.memberId);
          comparison = (memberA?.lastName || "").localeCompare(
            memberB?.lastName || "",
          );
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    updateInvoice(invoiceId, { status: "sent" });
    alert("Facture envoyée avec succès");
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const result = markInvoiceAsPaid(invoiceId, "cib");
    if (result.success) {
      alert("Facture marquée comme payée");
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleRefundPayment = (paymentId: string) => {
    const payment = getPaymentById(paymentId);
    if (!payment) return;

    const amount = prompt(
      `Entrez le montant à rembourser (max: ${payment.amount}):`,
      payment.amount.toString(),
    );
    if (!amount) return;

    const parsedAmount = parseFloat(amount);
    if (
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      parsedAmount > payment.amount
    ) {
      alert("Montant invalide");
      return;
    }

    const reason = prompt("Raison du remboursement:");
    if (!reason) return;

    const result = refundPayment(paymentId, parsedAmount, reason);
    if (result.success) {
      alert("Remboursement effectué avec succès");
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.memberId || newInvoice.items.length === 0) {
      alert("Veuillez sélectionner un membre et ajouter au moins un article");
      return;
    }

    // Vérifier que tous les articles ont une description et un prix
    const invalidItems = newInvoice.items.some(
      (item) => !item.description || item.unitPrice <= 0,
    );
    if (invalidItems) {
      alert("Veuillez remplir tous les champs des articles");
      return;
    }

    const result = generateInvoice(newInvoice.memberId, newInvoice.items);
    if (result.success) {
      alert("Facture créée avec succès");
      setShowCreateInvoiceModal(false);
      setNewInvoice({
        memberId: "",
        items: [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            type: "other",
          },
        ],
        notes: "",
      });
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleCreatePayment = () => {
    if (!newPayment.memberId || newPayment.amount <= 0) {
      alert("Veuillez sélectionner un membre et entrer un montant valide");
      return;
    }

    const result = processPayment(
      newPayment.memberId,
      newPayment.amount,
      newPayment.method,
      newPayment.invoiceId || undefined,
    );

    if (result.success) {
      alert("Paiement enregistré avec succès");
      setShowCreatePaymentModal(false);
      setNewPayment({
        memberId: "",
        amount: 0,
        method: "cib",
        invoiceId: "",
        notes: "",
      });
    } else {
      alert(`Erreur: ${result.error}`);
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
          discount: 0,
          type: "other",
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
    field: string,
    value: string | number,
  ) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const calculateInvoiceTotal = () => {
    return newInvoice.items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice - (item.discount || 0);
    }, 0);
  };

  const generateInvoicePdf = (invoice: Invoice) => {
    const member = getMemberById(invoice.memberId);
    if (!member) return;

    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.text("FACTURE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Numéro: ${invoice.number}`, 20, 40);
    doc.text(`Date: ${formatDate(new Date(invoice.issueDate))}`, 20, 50);
    doc.text(`Échéance: ${formatDate(new Date(invoice.dueDate))}`, 20, 60);

    // Informations client
    doc.text("Client:", 20, 80);
    doc.text(`${member.firstName} ${member.lastName}`, 40, 80);
    doc.text(`${member.email}`, 40, 90);
    if (member.phone) doc.text(`${member.phone}`, 40, 100);

    // Adresse de facturation
    if (invoice.billingAddress) {
      doc.text("Adresse de facturation:", 120, 80);
      doc.text(`${invoice.billingAddress.street}`, 140, 80);
      doc.text(
        `${invoice.billingAddress.postalCode} ${invoice.billingAddress.city}`,
        140,
        90,
      );
      doc.text(`${invoice.billingAddress.country}`, 140, 100);
    }

    // Tableau des articles
    doc.line(20, 120, 190, 120);
    doc.text("Description", 20, 130);
    doc.text("Qté", 120, 130);
    doc.text("Prix unitaire", 140, 130);
    doc.text("Total", 170, 130);
    doc.line(20, 135, 190, 135);

    let y = 145;
    invoice.items.forEach((item) => {
      doc.text(item.description, 20, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(formatCurrency(item.unitPrice), 140, y);
      doc.text(formatCurrency(item.total), 170, y);
      y += 10;
    });

    doc.line(20, y, 190, y);
    y += 10;

    // Totaux
    doc.text("Sous-total:", 120, y);
    doc.text(formatCurrency(invoice.subtotal), 170, y);
    y += 10;

    doc.text("TVA (19%):", 120, y);
    doc.text(formatCurrency(invoice.taxAmount), 170, y);
    y += 10;

    if (invoice.discount > 0) {
      doc.text("Réduction:", 120, y);
      doc.text(`-${formatCurrency(invoice.discount)}`, 170, y);
      y += 10;
    }

    doc.setFontSize(14);
    doc.text("Total:", 120, y);
    doc.text(formatCurrency(invoice.total), 170, y);

    // Pied de page
    doc.setFontSize(10);
    doc.text("Merci pour votre confiance.", 105, 280, { align: "center" });

    // Télécharger le PDF
    doc.save(`facture-${invoice.number}.pdf`);
  };

  const exportInvoices = () => {
    const workbook = XLSX.utils.book_new();

    const invoicesData = filteredInvoices.map((invoice) => {
      const member = getMemberById(invoice.memberId);

      return {
        Numéro: invoice.number,
        Date: formatDate(new Date(invoice.issueDate)),
        Échéance: formatDate(new Date(invoice.dueDate)),
        Client: member ? `${member.firstName} ${member.lastName}` : "Inconnu",
        Email: member?.email || "",
        Statut: getStatusLabel(invoice.status),
        "Sous-total": invoice.subtotal,
        TVA: invoice.taxAmount,
        Réduction: invoice.discount,
        Total: invoice.total,
        "Date de paiement": invoice.paidDate
          ? formatDate(new Date(invoice.paidDate))
          : "",
        "Méthode de paiement": invoice.paymentMethod || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(invoicesData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factures");

    // Générer le fichier Excel
    XLSX.writeFile(
      workbook,
      `coffice-factures-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const exportPayments = () => {
    const workbook = XLSX.utils.book_new();

    const paymentsData = filteredPayments.map((payment) => {
      const member = getMemberById(payment.memberId);

      return {
        ID: payment.id,
        Date: formatDate(new Date(payment.date)),
        Client: member ? `${member.firstName} ${member.lastName}` : "Inconnu",
        Email: member?.email || "",
        Montant: payment.amount,
        Méthode: getPaymentMethodLabel(payment.paymentMethod),
        Statut: getPaymentStatusLabel(payment.status),
        Facture: payment.invoiceId || "",
        Notes: payment.notes || "",
        Remboursement: payment.refundAmount || "",
        "Date de remboursement": payment.refundDate
          ? formatDate(new Date(payment.refundDate))
          : "",
        "Raison du remboursement": payment.refundReason || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(paymentsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paiements");

    // Générer le fichier Excel
    XLSX.writeFile(
      workbook,
      `coffice-paiements-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
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
            Gestion Financière
          </h1>
          <p className="text-gray-600">
            Gérez les factures, paiements et rapports financiers
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === "invoices" && (
            <>
              <Button variant="outline" onClick={exportInvoices}>
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </Button>
              <Button onClick={() => setShowCreateInvoiceModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle facture
              </Button>
            </>
          )}
          {activeTab === "payments" && (
            <>
              <Button variant="outline" onClick={exportPayments}>
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </Button>
              <Button onClick={() => setShowCreatePaymentModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Nouveau paiement
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === "invoices"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Factures
            {activeTab === "invoices" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === "payments"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Paiements
            {activeTab === "payments" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === "reports"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Rapports
            {activeTab === "reports" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher..."
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
            {activeTab === "invoices" ? (
              <>
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
                <option value="paid">Payées</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulées</option>
              </>
            ) : (
              <>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
                <option value="refunded">Remboursés</option>
              </>
            )}
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

      {/* Content based on active tab */}
      {activeTab === "invoices" && (
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
                      Facture
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
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === "date" && (
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center">
                      Montant
                      {sortBy === "amount" && (
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
                {filteredInvoices.map((invoice, index) => {
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
                            <div className="text-sm text-gray-500">
                              Échéance: {formatDate(new Date(invoice.dueDate))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {member
                                ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                : "NA"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {member
                                ? `${member.firstName} ${member.lastName}`
                                : "Client inconnu"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member?.email || "Email inconnu"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(new Date(invoice.issueDate))}
                        </div>
                        {invoice.paidDate && (
                          <div className="text-sm text-green-600">
                            Payée le: {formatDate(new Date(invoice.paidDate))}
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

                          {(invoice.status === "sent" ||
                            invoice.status === "overdue") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoicePdf(invoice)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === "date" && (
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center">
                      Montant
                      {sortBy === "amount" && (
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment, index) => {
                  const member = getMemberById(payment.memberId);

                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(new Date(payment.date))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.invoiceId
                            ? `Facture: ${payment.invoiceId}`
                            : "Paiement direct"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {member
                                ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                : "NA"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {member
                                ? `${member.firstName} ${member.lastName}`
                                : "Client inconnu"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member?.email || "Email inconnu"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${payment.amount < 0 ? "text-red-600" : "text-primary"}`}
                        >
                          {formatCurrency(Math.abs(payment.amount))}
                          {payment.amount < 0 && " (Remboursement)"}
                        </div>
                        {payment.refundAmount > 0 && (
                          <div className="text-xs text-red-600">
                            Remboursé: {formatCurrency(payment.refundAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getPaymentStatusVariant(payment.status)}
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {payment.status === "completed" &&
                            payment.amount > 0 &&
                            !payment.refundAmount && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefundPayment(payment.id)}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const receipt = new jsPDF();
                              receipt.text(
                                `Reçu de paiement #${payment.id}`,
                                105,
                                20,
                                { align: "center" },
                              );
                              receipt.text(
                                `Date: ${formatDate(new Date(payment.date))}`,
                                20,
                                40,
                              );
                              receipt.text(
                                `Montant: ${formatCurrency(Math.abs(payment.amount))}`,
                                20,
                                50,
                              );
                              receipt.text(
                                `Méthode: ${getPaymentMethodLabel(payment.paymentMethod)}`,
                                20,
                                60,
                              );
                              receipt.text(
                                `Client: ${member ? `${member.firstName} ${member.lastName}` : "Inconnu"}`,
                                20,
                                70,
                              );
                              receipt.save(`recu-${payment.id}.pdf`);
                            }}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-primary mb-4">
              Rapports financiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      Rapport de revenus
                    </h4>
                    <p className="text-sm text-gray-600">
                      Analyse des revenus par période
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Générer
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      Factures impayées
                    </h4>
                    <p className="text-sm text-gray-600">
                      Liste des factures en attente
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Générer
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-warm" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      Revenus par client
                    </h4>
                    <p className="text-sm text-gray-600">
                      Analyse des dépenses par client
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Générer
                </Button>
              </Card>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-primary mb-4">
              Rapports personnalisés
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de rapport
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none">
                  <option value="revenue">Revenus</option>
                  <option value="expenses">Dépenses</option>
                  <option value="profit">Bénéfices</option>
                  <option value="taxes">Taxes</option>
                  <option value="invoices">Factures</option>
                  <option value="payments">Paiements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none">
                  <option value="this_month">Ce mois</option>
                  <option value="last_month">Mois dernier</option>
                  <option value="this_quarter">Ce trimestre</option>
                  <option value="last_quarter">Trimestre dernier</option>
                  <option value="this_year">Cette année</option>
                  <option value="last_year">Année dernière</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options supplémentaires
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Inclure les graphiques
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Inclure les détails
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Générer le rapport
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="Détails de la facture"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-1">
                  Facture {selectedInvoice.number}
                </h3>
                <p className="text-gray-600">
                  Émise le {formatDate(new Date(selectedInvoice.issueDate))}
                </p>
              </div>
              <Badge variant={getStatusVariant(selectedInvoice.status)}>
                {getStatusLabel(selectedInvoice.status)}
              </Badge>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Client</h4>
                {(() => {
                  const member = getMemberById(selectedInvoice.memberId);
                  return (
                    <>
                      <p className="text-gray-700">
                        {member
                          ? `${member.firstName} ${member.lastName}`
                          : "Client inconnu"}
                      </p>
                      <p className="text-gray-700">
                        {member?.email || "Email inconnu"}
                      </p>
                      {member?.phone && (
                        <p className="text-gray-700">{member.phone}</p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-primary mb-2">
                  Adresse de facturation
                </h4>
                <p className="text-gray-700">
                  {selectedInvoice.billingAddress.street}
                </p>
                <p className="text-gray-700">
                  {selectedInvoice.billingAddress.postalCode}{" "}
                  {selectedInvoice.billingAddress.city}
                </p>
                <p className="text-gray-700">
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
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={`fin-item-${item.description}-${index}`}>
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
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={3}
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
                        colSpan={3}
                        className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                      >
                        TVA (19%)
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(selectedInvoice.taxAmount)}
                      </td>
                    </tr>
                    {selectedInvoice.discount > 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                        >
                          Réduction
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          -{formatCurrency(selectedInvoice.discount)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td
                        colSpan={3}
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

            {/* Notes */}
            {selectedInvoice.notes && (
              <div>
                <h4 className="font-medium text-primary mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedInvoice.notes}
                </p>
              </div>
            )}

            {/* Payment Info */}
            {selectedInvoice.status === "paid" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">
                      Payée le{" "}
                      {formatDate(
                        new Date(selectedInvoice.paidDate || new Date()),
                      )}
                    </p>
                    <p className="text-sm text-green-700">
                      Méthode:{" "}
                      {getPaymentMethodLabel(
                        selectedInvoice.paymentMethod || "unknown",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => generateInvoicePdf(selectedInvoice)}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>

              {selectedInvoice.status === "draft" && (
                <Button
                  onClick={() => {
                    handleSendInvoice(selectedInvoice.id);
                    setShowInvoiceModal(false);
                  }}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              )}

              {(selectedInvoice.status === "sent" ||
                selectedInvoice.status === "overdue") && (
                <Button
                  onClick={() => {
                    handleMarkAsPaid(selectedInvoice.id);
                    setShowInvoiceModal(false);
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme payée
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Détails du paiement"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-1">
                  Paiement #{selectedPayment.id.substring(0, 8)}
                </h3>
                <p className="text-gray-600">
                  Effectué le {formatDate(new Date(selectedPayment.date))}
                </p>
              </div>
              <Badge variant={getPaymentStatusVariant(selectedPayment.status)}>
                {getPaymentStatusLabel(selectedPayment.status)}
              </Badge>
            </div>

            {/* Client Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Client</h4>
              {(() => {
                const member = getMemberById(selectedPayment.memberId);
                return (
                  <>
                    <p className="text-gray-700">
                      {member
                        ? `${member.firstName} ${member.lastName}`
                        : "Client inconnu"}
                    </p>
                    <p className="text-gray-700">
                      {member?.email || "Email inconnu"}
                    </p>
                    {member?.phone && (
                      <p className="text-gray-700">{member.phone}</p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant
                </label>
                <p
                  className={`text-lg font-bold ${selectedPayment.amount < 0 ? "text-red-600" : "text-accent"}`}
                >
                  {formatCurrency(Math.abs(selectedPayment.amount))}
                  {selectedPayment.amount < 0 && " (Remboursement)"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode
                </label>
                <p className="text-primary">
                  {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Invoice Reference */}
            {selectedPayment.invoiceId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facture associée
                </label>
                <p className="text-primary">{selectedPayment.invoiceId}</p>
              </div>
            )}

            {/* Refund Info */}
            {selectedPayment.refundAmount > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">
                      Remboursement:{" "}
                      {formatCurrency(selectedPayment.refundAmount)}
                    </p>
                    {selectedPayment.refundDate && (
                      <p className="text-sm text-red-700">
                        Date: {formatDate(new Date(selectedPayment.refundDate))}
                      </p>
                    )}
                    {selectedPayment.refundReason && (
                      <p className="text-sm text-red-700">
                        Raison: {selectedPayment.refundReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPayment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedPayment.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const receipt = new jsPDF();
                  receipt.text(
                    `Reçu de paiement #${selectedPayment.id}`,
                    105,
                    20,
                    { align: "center" },
                  );
                  receipt.text(
                    `Date: ${formatDate(new Date(selectedPayment.date))}`,
                    20,
                    40,
                  );
                  receipt.text(
                    `Montant: ${formatCurrency(Math.abs(selectedPayment.amount))}`,
                    20,
                    50,
                  );
                  receipt.text(
                    `Méthode: ${getPaymentMethodLabel(selectedPayment.paymentMethod)}`,
                    20,
                    60,
                  );

                  const member = getMemberById(selectedPayment.memberId);
                  receipt.text(
                    `Client: ${member ? `${member.firstName} ${member.lastName}` : "Inconnu"}`,
                    20,
                    70,
                  );

                  if (selectedPayment.invoiceId) {
                    receipt.text(
                      `Facture: ${selectedPayment.invoiceId}`,
                      20,
                      80,
                    );
                  }

                  receipt.save(`recu-${selectedPayment.id}.pdf`);
                }}
                className="flex-1"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Générer reçu
              </Button>

              {selectedPayment.status === "completed" &&
                selectedPayment.amount > 0 &&
                !selectedPayment.refundAmount && (
                  <Button
                    onClick={() => {
                      handleRefundPayment(selectedPayment.id);
                      setShowPaymentModal(false);
                    }}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Rembourser
                  </Button>
                )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        title="Nouvelle facture"
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
                  {member.firstName} {member.lastName} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-primary">Articles</h4>
              <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-4">
              {newInvoice.items.map((item, index) => (
                <div
                  key={`fin-new-item-${index}`}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">
                      Article #{index + 1}
                    </h5>
                    {newInvoice.items.length > 1 && (
                      <button
                        onClick={() => removeInvoiceItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateInvoiceItem(index, "description", e.target.value)
                      }
                      placeholder="Description de l'article"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          updateInvoiceItem(index, "type", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                      >
                        <option value="reservation">Réservation</option>
                        <option value="membership">Abonnement</option>
                        <option value="service">Service</option>
                        <option value="product">Produit</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <Input
                      label="Réduction (DA)"
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

                  <div className="text-right mt-3">
                    <p className="text-sm font-medium text-gray-700">
                      Total:{" "}
                      {formatCurrency(
                        item.quantity * item.unitPrice - (item.discount || 0),
                      )}
                    </p>
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
              placeholder="Notes ou conditions particulières..."
            />
          </div>

          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-primary">Total de la facture</h4>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(calculateInvoiceTotal())}
              </p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateInvoiceModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateInvoice}
              className="flex-1"
              disabled={!newInvoice.memberId || newInvoice.items.length === 0}
            >
              Créer la facture
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Payment Modal */}
      <Modal
        isOpen={showCreatePaymentModal}
        onClose={() => setShowCreatePaymentModal(false)}
        title="Nouveau paiement"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              value={newPayment.memberId}
              onChange={(e) =>
                setNewPayment((prev) => ({ ...prev, memberId: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="">Sélectionner un client</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Montant (DA)"
            type="number"
            min="0"
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <select
              value={newPayment.method}
              onChange={(e) =>
                setNewPayment((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="cib">Carte CIB</option>
              <option value="dahabia">Carte Dahabia</option>
              <option value="cash">Espèces</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facture associée (optionnel)
            </label>
            <select
              value={newPayment.invoiceId}
              onChange={(e) =>
                setNewPayment((prev) => ({
                  ...prev,
                  invoiceId: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="">Aucune facture (paiement direct)</option>
              {newPayment.memberId &&
                invoices
                  .filter(
                    (invoice) =>
                      invoice.memberId === newPayment.memberId &&
                      (invoice.status === "sent" ||
                        invoice.status === "overdue"),
                  )
                  .map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.number} - {formatCurrency(invoice.total)} -{" "}
                      {formatDate(new Date(invoice.issueDate))}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={newPayment.notes}
              onChange={(e) =>
                setNewPayment((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Notes sur le paiement..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreatePaymentModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreatePayment}
              className="flex-1"
              disabled={!newPayment.memberId || newPayment.amount <= 0}
            >
              Enregistrer le paiement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialManagement;
