import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Building,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Target,
  Share2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  Mail,
  Eye,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useERPStore } from "../../store/erpStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";

interface ChartData {
  labels?: string[];
  datasets?: Array<{
    label?: string;
    data?: number[];
    backgroundColor?: string | string[];
  }>;
}

interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

const Chart = ({
  type,
}: {
  type: string;
  data?: ChartData;
  options?: ChartOptions;
}) => {
  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      {type === "bar" && <BarChart3 className="w-12 h-12 text-gray-300" />}
      {type === "pie" && <PieChart className="w-12 h-12 text-gray-300" />}
      {type === "line" && <LineChart className="w-12 h-12 text-gray-300" />}
      <p className="text-gray-500 ml-2">Graphique {type} (simule)</p>
    </div>
  );
};

const AnalyticsAndReporting = () => {
  const {
    spaces,
    reservations,
    members,
    subscriptions,
    invoices,
    payments,
    expenses,
    generateAnalytics,
    analytics,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "month",
  );
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [reportType, setReportType] = useState("financial");
  const [showFilters, setShowFilters] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        generateAnalytics(period);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period, generateAnalytics]);

  const generateReport = async () => {
    setIsGeneratingReport(true);

    try {
      // Simuler la génération d'un rapport
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(20);
      doc.text("RAPPORT ANALYTIQUE", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(
        `Période: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
        105,
        30,
        { align: "center" },
      );

      doc.setFontSize(10);
      doc.text("Coffice Coworking", 20, 40);
      doc.text("Centre-ville, Alger", 20, 45);
      doc.text("Algérie", 20, 50);

      // Type de rapport
      doc.setFontSize(16);
      doc.text(
        reportType === "financial"
          ? "Rapport Financier"
          : reportType === "occupancy"
            ? "Rapport d'Occupation"
            : reportType === "membership"
              ? "Rapport d'Abonnements"
              : "Rapport Analytique",
        20,
        65,
      );

      // Statistiques clés
      doc.setFontSize(12);
      doc.text("Statistiques clés", 20, 75);

      doc.setFillColor(240, 240, 240);
      doc.rect(20, 80, 170, 40, "F");

      if (reportType === "financial") {
        doc.text("Revenus:", 25, 90);
        doc.text(
          formatCurrency(analytics?.financialSummary.revenue || 0),
          80,
          90,
        );

        doc.text("Dépenses:", 25, 100);
        doc.text(
          formatCurrency(analytics?.financialSummary.expenses || 0),
          80,
          100,
        );

        doc.text("Bénéfice:", 25, 110);
        doc.text(
          formatCurrency(analytics?.financialSummary.profit || 0),
          80,
          110,
        );
      } else if (reportType === "occupancy") {
        doc.text("Taux d'occupation:", 25, 90);
        doc.text(`${analytics?.occupancyRate || 0}%`, 80, 90);

        doc.text("Espaces disponibles:", 25, 100);
        doc.text(
          `${spaces.filter((s) => s.available).length} / ${spaces.length}`,
          80,
          100,
        );

        doc.text("Réservations:", 25, 110);
        doc.text(`${reservations.length}`, 80, 110);
      } else if (reportType === "membership") {
        doc.text("Membres actifs:", 25, 90);
        doc.text(
          `${members.filter((m) => m.status === "active").length}`,
          80,
          90,
        );

        doc.text("Abonnements actifs:", 25, 100);
        doc.text(
          `${subscriptions.filter((s) => s.status === "active").length}`,
          80,
          100,
        );

        doc.text("Taux de rétention:", 25, 110);
        doc.text("85%", 80, 110);
      }

      type TableRow = string[];
      let tableData: TableRow[] = [];
      let tableColumns: string[] = [];

      if (reportType === "financial") {
        tableColumns = [
          "Mois",
          "Revenus",
          "Dépenses",
          "Bénéfice",
          "Croissance",
        ];
        tableData = [
          ["Janvier", "150 000 DA", "90 000 DA", "60 000 DA", "+5%"],
          ["Février", "180 000 DA", "100 000 DA", "80 000 DA", "+33%"],
          ["Mars", "200 000 DA", "110 000 DA", "90 000 DA", "+12%"],
          ["Avril", "220 000 DA", "120 000 DA", "100 000 DA", "+11%"],
        ];
      } else if (reportType === "occupancy") {
        tableColumns = [
          "Espace",
          "Réservations",
          "Taux d'occupation",
          "Revenus",
          "Prix moyen",
        ];
        tableData =
          analytics?.topSpaces.map((space) => [
            space.name,
            space.bookings.toString(),
            "75%",
            formatCurrency(space.revenue),
            formatCurrency(space.revenue / space.bookings),
          ]) || [];
      } else if (reportType === "membership") {
        tableColumns = [
          "Plan",
          "Membres",
          "Revenus",
          "Taux de renouvellement",
          "Croissance",
        ];
        tableData = [
          ["Starter", "25", "375 000 DA", "70%", "+10%"],
          ["Standard", "40", "1 000 000 DA", "85%", "+15%"],
          ["Premium", "15", "675 000 DA", "90%", "+5%"],
        ];
      }

      (doc as any).autoTable({
        head: [tableColumns],
        body: tableData,
        startY: 130,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Pied de page
      const finalY = (doc as any).lastAutoTable.finalY + 20;

      doc.setFontSize(8);
      doc.text(
        "Rapport généré le " + new Date().toLocaleDateString(),
        20,
        finalY,
      );
      doc.text("Coffice ERP - Tous droits réservés", 105, 285, {
        align: "center",
      });

      // Enregistrer le PDF
      doc.save(
        `coffice-report-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`,
      );

      toast.success("Rapport généré avec succès");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setIsGeneratingReport(false);
    }
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
            Analytiques & Rapports
          </h1>
          <p className="text-gray-600">
            Analysez les performances de votre coworking
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </Button>
          <Button onClick={generateReport} loading={isGeneratingReport}>
            <Download className="w-5 h-5 mr-2" />
            Générer un rapport
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as "day" | "week" | "month" | "year")}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                >
                  <option value="day">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette annee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de rapport
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                >
                  <option value="financial">Financier</option>
                  <option value="occupancy">Occupation</option>
                  <option value="membership">Abonnements</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPeriod("month");
                    setReportType("financial");
                    setDateRange({
                      start: new Date(
                        new Date().setMonth(new Date().getMonth() - 1),
                      ),
                      end: new Date(),
                    });
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateRange.start.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Revenus{" "}
                  {period === "month"
                    ? "mensuels"
                    : period === "year"
                      ? "annuels"
                      : ""}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(analytics?.financialSummary.revenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600">
                    +12% vs période précédente
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'occupation</p>
                <p className="text-2xl font-bold text-primary">
                  {analytics?.occupancyRate || 0}%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600">
                    +5% vs période précédente
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Membres actifs</p>
                <p className="text-2xl font-bold text-primary">
                  {members.filter((m) => m.status === "active").length}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600">
                    +8% vs période précédente
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bénéfice net</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(analytics?.financialSummary.profit || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                  <p className="text-sm text-red-600">
                    -3% vs période précédente
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warm" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Financial Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Aperçu Financier
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={period === "month" ? "bg-accent/10 text-accent" : ""}
                onClick={() => setPeriod("month")}
              >
                Mois
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={period === "year" ? "bg-accent/10 text-accent" : ""}
                onClick={() => setPeriod("year")}
              >
                Année
              </Button>
            </div>
          </div>

          <Chart type="line" data={{}} options={{}} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800">Revenus</h4>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(analytics?.financialSummary.revenue || 0)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                <p className="text-sm text-green-600">
                  +12% vs période précédente
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-red-800">Dépenses</h4>
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(analytics?.financialSummary.expenses || 0)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-red-600 mr-1" />
                <p className="text-sm text-red-600">
                  +5% vs période précédente
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Marge</h4>
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {analytics?.financialSummary.revenue &&
                analytics?.financialSummary.expenses
                  ? Math.round(
                      (analytics.financialSummary.profit /
                        analytics.financialSummary.revenue) *
                        100,
                    )
                  : 0}
                %
              </p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                <p className="text-sm text-red-600">
                  -2% vs période précédente
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Space Utilization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Utilisation des Espaces
          </h3>

          <Chart type="bar" data={{}} options={{}} />

          <div className="mt-6">
            <h4 className="font-medium text-primary mb-4">
              Espaces les plus populaires
            </h4>
            <div className="space-y-4">
              {analytics?.topSpaces.map((space, index) => (
                <div
                  key={`top-space-${space.id || space.name}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-primary">{space.name}</p>
                    <p className="text-sm text-gray-600">
                      {space.bookings} réservations
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatCurrency(space.revenue)}
                    </p>
                    <p className="text-sm text-green-600">
                      <ArrowUpRight className="w-3 h-3 inline mr-1" />
                      {Math.round(
                        (space.revenue / analytics.financialSummary.revenue) *
                          100,
                      )}
                      % du CA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Membership Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-primary mb-6">
              Analyse des Abonnements
            </h3>

            <Chart type="pie" data={{}} options={{}} />

            <div className="mt-6">
              <h4 className="font-medium text-primary mb-3">
                Répartition par plan
              </h4>
              <div className="space-y-3">
                {Object.entries(analytics?.revenueByMembership || {}).map(
                  ([key, value], index) => (
                    <div
                      key={`membership-${key}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-accent"
                              : index === 1
                                ? "bg-teal"
                                : index === 2
                                  ? "bg-warm"
                                  : "bg-gray-400"
                          } mr-2`}
                        />
                        <span className="text-sm text-gray-700">
                          {key === "membership-1"
                            ? "Starter"
                            : key === "membership-2"
                              ? "Standard"
                              : "Premium"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              index === 0
                                ? "bg-accent"
                                : index === 1
                                  ? "bg-teal"
                                  : index === 2
                                    ? "bg-warm"
                                    : "bg-gray-400"
                            }`}
                            style={{
                              width: `${(value / analytics.financialSummary.revenue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {Math.round(
                            (value / analytics.financialSummary.revenue) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-primary mb-6">
              Croissance des Membres
            </h3>

            <Chart type="line" data={{}} options={{}} />

            <div className="mt-6">
              <h4 className="font-medium text-primary mb-3">
                Évolution mensuelle
              </h4>
              <div className="space-y-3">
                {analytics?.membershipGrowth.map((item, index) => (
                  <div
                    key={`growth-${item.period}`}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{item.period}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal h-2 rounded-full"
                          style={{ width: `${(item.count / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-primary w-16">
                        {item.count} membres
                      </span>
                      <span
                        className={`text-sm w-16 ${item.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.growth >= 0 ? "+" : ""}
                        {item.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* KPI Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Tableau de bord KPI
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-primary flex items-center">
                <Target className="w-4 h-4 mr-2 text-accent" />
                Performance Financière
              </h4>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Revenus vs Objectif
                  </span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Marge bénéficiaire
                  </span>
                  <span className="text-sm font-medium">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal h-2 rounded-full"
                    style={{ width: "40%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Factures payées</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-primary flex items-center">
                <Building className="w-4 h-4 mr-2 text-teal" />
                Performance Opérationnelle
              </h4>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Taux d'occupation
                  </span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal h-2 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Disponibilité des espaces
                  </span>
                  <span className="text-sm font-medium">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "95%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Satisfaction client
                  </span>
                  <span className="text-sm font-medium">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warm h-2 rounded-full"
                    style={{ width: "96%" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-primary flex items-center">
                <Users className="w-4 h-4 mr-2 text-warm" />
                Performance Commerciale
              </h4>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Taux de conversion
                  </span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warm h-2 rounded-full"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Taux de rétention
                  </span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Nouveaux membres
                  </span>
                  <span className="text-sm font-medium">+15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Scheduled Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Rapports Programmés
            </h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau rapport
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-primary mb-1">
                    Rapport Financier Mensuel
                  </h4>
                  <p className="text-sm text-gray-600">
                    Envoyé le 1er de chaque mois
                  </p>
                  <div className="flex items-center mt-2">
                    <Mail className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      direction@coffice.dz
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="success">Actif</Badge>
                  <Button variant="outline" size="sm" className="ml-3">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-primary mb-1">
                    Rapport d'Occupation Hebdomadaire
                  </h4>
                  <p className="text-sm text-gray-600">Envoyé chaque lundi</p>
                  <div className="flex items-center mt-2">
                    <Mail className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      operations@coffice.dz
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="success">Actif</Badge>
                  <Button variant="outline" size="sm" className="ml-3">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-primary mb-1">
                    Rapport de Performance Trimestriel
                  </h4>
                  <p className="text-sm text-gray-600">
                    Envoyé le dernier jour de chaque trimestre
                  </p>
                  <div className="flex items-center mt-2">
                    <Mail className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      direction@coffice.dz, investisseurs@coffice.dz
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="success">Actif</Badge>
                  <Button variant="outline" size="sm" className="ml-3">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Insights & Recommandations
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Opportunité de croissance
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Le taux d'occupation des salles de réunion est en hausse de
                    15%. Envisagez d'augmenter la capacité ou d'ajouter des
                    créneaux horaires supplémentaires.
                  </p>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Share2 className="w-4 h-4 mr-1" />
                    Voir l'analyse
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">
                    Optimisation des horaires
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Les réservations sont faibles le mardi matin. Envisagez des
                    promotions spéciales ou des événements pour augmenter
                    l'occupation pendant cette période.
                  </p>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Share2 className="w-4 h-4 mr-1" />
                    Voir l'analyse
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-1">
                    Performance des abonnements
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Le plan Standard a le meilleur taux de conversion et de
                    rétention. Envisagez de mettre davantage en avant ce plan
                    dans vos communications marketing.
                  </p>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Share2 className="w-4 h-4 mr-1" />
                    Voir l'analyse
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Custom Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Rapports Personnalisés
            </h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Créer un rapport
            </Button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-white">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-primary">
                    Analyse de rentabilité par espace
                  </h4>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-white">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-primary">
                    Analyse des tendances de réservation
                  </h4>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-white">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-primary">
                    Rapport de fidélisation des membres
                  </h4>
                  <Button variant="outline" size="sm">
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">
                  Ce rapport analyse les tendances de renouvellement
                  d'abonnement et identifie les facteurs qui influencent la
                  fidélisation des membres.
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Planifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <Card className="p-6 bg-gradient-to-r from-accent/5 to-teal/5 border-accent/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-2">
                Besoin d'aide avec vos rapports ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe peut vous aider à configurer des rapports
                personnalisés adaptés à vos besoins spécifiques. Nous proposons
                également des formations sur l'analyse de données pour vous
                aider à tirer le meilleur parti de vos informations.
              </p>
              <div className="flex space-x-3">
                <Button>Contacter l'équipe</Button>
                <Button variant="outline">Consulter la documentation</Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsAndReporting;
