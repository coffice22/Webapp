import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { useAppStore } from "../../store/store";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface PaymentSummaryProps {
  transactionId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentDate: Date;
  status: "pending" | "completed" | "failed" | "refunded";
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
  };
  onDownloadInvoice?: () => void;
  onRetry?: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  transactionId,
  amount,
  currency = "DZD",
  paymentMethod,
  paymentDate,
  status,
  items,
  customer,
  onDownloadInvoice,
  onRetry,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "completed":
        return "Payé";
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

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "refunded":
        return <CreditCard className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case "cib":
        return "Carte CIB";
      case "dahabia":
        return "Carte Dahabia";
      case "edahabia":
        return "Carte Edahabia";
      case "cash":
        return "Espèces";
      default:
        return paymentMethod;
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.19); // 19% TVA
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-primary mb-1">
            Récapitulatif de paiement
          </h3>
          <p className="text-gray-600">Transaction #{transactionId}</p>
        </div>
        <Badge
          variant={getStatusColor()}
          size="md"
          className="flex items-center"
        >
          {getStatusIcon()}
          <span className="ml-1">{getStatusLabel()}</span>
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Détails du paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Montant</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(amount, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Méthode de paiement</p>
            <p className="text-primary">{getPaymentMethodName()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            <p className="text-primary">{formatDate(paymentDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Client</p>
            <p className="text-primary">{customer.name}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        {/* Détails des articles */}
        <div>
          <h4 className="font-medium text-primary mb-3">Détails</h4>
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
                {items.map((item, index) => (
                  <tr key={`item-${item.description}-${index}`}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.amount * item.quantity, currency)}
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
                    {formatCurrency(calculateSubtotal(), currency)}
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
                    {formatCurrency(calculateTax(), currency)}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm font-bold text-primary text-right"
                  >
                    Total
                  </td>
                  <td className="px-4 py-2 text-sm font-bold text-primary text-right">
                    {formatCurrency(amount, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {status === "failed" && onRetry && (
            <Button onClick={onRetry}>Réessayer le paiement</Button>
          )}

          {status === "completed" && onDownloadInvoice && (
            <Button onClick={onDownloadInvoice}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger la facture
            </Button>
          )}

          {status === "pending" && (
            <div className="bg-yellow-50 p-3 rounded-lg w-full">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                <p className="text-sm text-yellow-700">
                  Votre paiement est en cours de traitement. Vous recevrez une
                  confirmation par email.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PaymentSummary;
