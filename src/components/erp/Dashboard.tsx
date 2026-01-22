import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  FileText,
  Package,
  PenTool as Tool,
  Bell,
  Activity,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useERPStore } from "../../store/erpStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { apiClient } from "../../lib/api-client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: "green" | "blue" | "purple" | "orange" | "red";
  delay?: number;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color,
  delay = 0,
}: StatCardProps) => {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  const isPositive = trend && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
        {trendLabel && (
          <p className="text-xs text-gray-500 mt-2">{trendLabel}</p>
        )}
      </Card>
    </motion.div>
  );
};

const ERPDashboard = () => {
  const {
    spaces,
    reservations,
    members,
    subscriptions,
    invoices,
    maintenanceRequests,
    inventory,
    generateAnalytics,
    analytics,
    getLowStockItems,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "month",
  );
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        generateAnalytics(period);

        const response = await apiClient.getAdminStats();
        if (response.success && response.data) {
          setAdminStats(response.data);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const availableSpaces = spaces.filter((s) => s.available).length;
  const stats = {
    totalSpaces: spaces.length,
    availableSpaces,
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    totalReservations: reservations.length,
    todayReservations: reservations.filter(
      (r) => new Date(r.startDate).toDateString() === new Date().toDateString(),
    ).length,
    pendingInvoices: invoices.filter(
      (i) => i.status === "sent" || i.status === "draft",
    ).length,
    overdueInvoices: invoices.filter((i) => i.status === "overdue").length,
    activeSubscriptions: subscriptions.filter((s) => s.status === "active")
      .length,
    lowStockItems: getLowStockItems().length,
    pendingMaintenance: maintenanceRequests.filter(
      (r) => r.status === "pending",
    ).length,
    occupancyRate:
      spaces.length > 0
        ? Math.round(((spaces.length - availableSpaces) / spaces.length) * 100)
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const recentActivities = [
    ...reservations.slice(0, 3).map((r) => ({
      type: "reservation",
      message: `Nouvelle réservation pour ${r.spaceId || "un espace"}`,
      time: r.createdAt || new Date().toISOString(),
      icon: <Calendar className="w-4 h-4" />,
    })),
    ...maintenanceRequests.slice(0, 2).map((m) => ({
      type: "maintenance",
      message: `Demande de maintenance: ${m.description}`,
      time: m.createdAt || new Date().toISOString(),
      icon: <Tool className="w-4 h-4" />,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Tableau de bord ERP
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble et métriques en temps réel
          </p>
        </div>

        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "primary" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === "day"
                ? "Jour"
                : p === "week"
                  ? "Semaine"
                  : p === "month"
                    ? "Mois"
                    : "Année"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus ce mois"
          value={formatCurrency(
            adminStats?.revenue?.month ||
              analytics?.financialSummary.revenue ||
              0,
          )}
          icon={<DollarSign className="w-6 h-6" />}
          trend={adminStats?.revenue?.growth}
          trendLabel="vs mois dernier"
          color="green"
          delay={0.1}
        />

        <StatCard
          title="Membres actifs"
          value={`${stats.activeMembers} / ${stats.totalMembers}`}
          icon={<Users className="w-6 h-6" />}
          trend={adminStats?.members?.growth}
          trendLabel="nouveaux ce mois"
          color="blue"
          delay={0.2}
        />

        <StatCard
          title="Taux d'occupation"
          value={`${stats.occupancyRate}%`}
          icon={<Building className="w-6 h-6" />}
          trend={adminStats?.occupancy?.growth}
          trendLabel={`${stats.totalSpaces - stats.availableSpaces}/${stats.totalSpaces} espaces`}
          color="purple"
          delay={0.3}
        />

        <StatCard
          title="Réservations aujourd'hui"
          value={stats.todayReservations}
          icon={<Calendar className="w-6 h-6" />}
          trendLabel={`${stats.totalReservations} ce mois`}
          color="orange"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Indicateurs clés
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Factures en attente</p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {stats.pendingInvoices}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">Factures en retard</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdueInvoices}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600">Abonnements actifs</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeSubscriptions}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-600">Stock faible</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.lowStockItems}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Tool className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-600">Maintenance</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingMaintenance}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-600">Espaces disponibles</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.availableSpaces}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activités récentes
              </h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-600">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {(stats.overdueInvoices > 0 ||
        stats.lowStockItems > 0 ||
        stats.pendingMaintenance > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Actions requises
                </h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {stats.overdueInvoices > 0 && (
                    <li>
                      • {stats.overdueInvoices} facture(s) en retard nécessitent
                      votre attention
                    </li>
                  )}
                  {stats.lowStockItems > 0 && (
                    <li>
                      • {stats.lowStockItems} article(s) en stock faible à
                      réapprovisionner
                    </li>
                  )}
                  {stats.pendingMaintenance > 0 && (
                    <li>
                      • {stats.pendingMaintenance} demande(s) de maintenance en
                      attente
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ERPDashboard;
