import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  BarChart3,
  RefreshCw,
  ShoppingCart,
  Truck,
  Tag,
  Clipboard,
  QrCode,
  Printer,
  FileText,
  Camera,
  Share2,
  HelpCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { Inventory } from "../../types/erp";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

const InventoryManagement = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryItemById,
    adjustInventoryQuantity,
    getLowStockItems,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "pièce",
    minQuantity: 0,
    location: "",
    purchasePrice: 0,
    supplier: "",
    notes: "",
  });

  const [adjustData, setAdjustData] = useState({
    adjustment: 0,
    reason: "",
    reference: "",
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const filteredItems = inventory
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && item.quantity <= item.minQuantity) ||
        (stockFilter === "out" && item.quantity === 0) ||
        (stockFilter === "normal" && item.quantity > item.minQuantity);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "price":
          comparison =
            (a.purchasePrice || a.cost || 0) - (b.purchasePrice || b.cost || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const categories = Array.from(
    new Set(inventory.map((item) => item.category)),
  );

  const getStockStatusVariant = (item: Inventory) => {
    if (item.quantity === 0) return "error";
    if (item.quantity <= item.minQuantity) return "warning";
    return "success";
  };

  const getStockStatusLabel = (item: Inventory) => {
    if (item.quantity === 0) return "Rupture";
    if (item.quantity <= item.minQuantity) return "Stock bas";
    return "En stock";
  };

  const handleCreateItem = () => {
    const quantity = formData.quantity;
    const status: "in_stock" | "low_stock" | "out_of_stock" =
      quantity === 0
        ? "out_of_stock"
        : quantity <= formData.minQuantity
          ? "low_stock"
          : "in_stock";

    const newItem: Inventory = {
      id: `inv-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      quantity,
      unit: formData.unit,
      minQuantity: formData.minQuantity,
      location: formData.location,
      purchasePrice: formData.purchasePrice,
      cost: formData.purchasePrice,
      supplier: formData.supplier,
      lastRestockDate: new Date(),
      lastRestocked: new Date(),
      status,
      notes: formData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addInventoryItem(newItem);
    resetForm();
    setShowItemModal(false);
    toast.success("Article ajouté avec succès");
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;

    updateInventoryItem(selectedItem.id, {
      name: formData.name,
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      minQuantity: formData.minQuantity,
      location: formData.location,
      purchasePrice: formData.purchasePrice,
      supplier: formData.supplier,
      notes: formData.notes,
      updatedAt: new Date(),
    });

    resetForm();
    setShowItemModal(false);
    setIsEditing(false);
    setSelectedItem(null);
    toast.success("Article mis à jour avec succès");
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteInventoryItem(itemId);
      toast.success("Article supprimé avec succès");
    }
  };

  const handleAdjustQuantity = () => {
    if (!selectedItem) return;

    const result = adjustInventoryQuantity(
      selectedItem.id,
      adjustData.adjustment,
      `${adjustData.reason}${adjustData.reference ? ` (Réf: ${adjustData.reference})` : ""}`,
    );

    if (result.success) {
      toast.success(
        `Quantité ajustée avec succès (${adjustData.adjustment > 0 ? "+" : ""}${adjustData.adjustment} ${selectedItem.unit})`,
      );
      setShowAdjustModal(false);
      setAdjustData({
        adjustment: 0,
        reason: "",
        reference: "",
      });
    } else {
      toast.error(result.error || "Erreur lors de l'ajustement");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "pièce",
      minQuantity: 0,
      location: "",
      purchasePrice: 0,
      supplier: "",
      notes: "",
    });
    setSelectedItem(null);
    setIsEditing(false);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportInventory = () => {
    const inventoryData = filteredItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      location: item.location,
      purchasePrice: formatCurrency(item.purchasePrice),
      supplier: item.supplier,
      lastRestockDate: formatDate(item.lastRestockDate),
      notes: item.notes || "",
      status: getStockStatusLabel(item),
    }));

    const dataStr = JSON.stringify(inventoryData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-inventory-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Inventaire exporté avec succès");
  };

  const printQRCode = () => {
    if (!selectedItem) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Veuillez autoriser les popups pour imprimer");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${selectedItem.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 400px; margin: 0 auto; }
            .item-info { margin-top: 20px; }
            .qr-code { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${selectedItem.name}</h2>
            <div class="item-info">
              <p><strong>ID:</strong> ${selectedItem.id}</p>
              <p><strong>Catégorie:</strong> ${selectedItem.category}</p>
              <p><strong>Emplacement:</strong> ${selectedItem.location}</p>
            </div>
            <div class="qr-code">
              <img src="${document.getElementById("qr-code-to-print")?.querySelector("canvas")?.toDataURL()}" />
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
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
            Gestion de l'Inventaire
          </h1>
          <p className="text-gray-600">Gérez votre stock et vos fournitures</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportInventory}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowItemModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvel article
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-primary">
                {inventory.length}
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
              <p className="text-sm text-gray-600">En Stock</p>
              <p className="text-2xl font-bold text-primary">
                {inventory.filter((i) => i.quantity > i.minQuantity).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Stock Bas</p>
              <p className="text-2xl font-bold text-primary">
                {
                  inventory.filter(
                    (i) => i.quantity > 0 && i.quantity <= i.minQuantity,
                  ).length
                }
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
              <p className="text-sm text-gray-600">Rupture</p>
              <p className="text-2xl font-bold text-primary">
                {inventory.filter((i) => i.quantity === 0).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher un article..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Tous les niveaux de stock</option>
            <option value="normal">En stock</option>
            <option value="low">Stock bas</option>
            <option value="out">Rupture de stock</option>
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Article
                    {sortBy === "name" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("category")}
                >
                  <div className="flex items-center">
                    Catégorie
                    {sortBy === "category" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("quantity")}
                >
                  <div className="flex items-center">
                    Quantité
                    {sortBy === "quantity" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("price")}
                >
                  <div className="flex items-center">
                    Prix
                    {sortBy === "price" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.supplier}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="default">{item.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {item.minQuantity} {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStockStatusVariant(item)}>
                      {getStockStatusLabel(item)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {formatCurrency(item.purchasePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setFormData({
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity,
                            unit: item.unit,
                            minQuantity: item.minQuantity,
                            location: item.location,
                            purchasePrice: item.purchasePrice,
                            supplier: item.supplier,
                            notes: item.notes || "",
                          });
                          setIsEditing(true);
                          setShowItemModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAdjustModal(true);
                        }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowQRModal(true);
                        }}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} sur{" "}
              {filteredItems.length} articles
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

      {/* Inventory Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          resetForm();
        }}
        title={isEditing ? "Détails de l'article" : "Nouvel article"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de l'article"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Cartouche d'encre"
              disabled={isEditing && selectedItem?.id.includes("system-")}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                disabled={isEditing && selectedItem?.id.includes("system-")}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="new">+ Nouvelle catégorie</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantité"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0,
                }))
              }
              disabled={isEditing}
            />

            <Input
              label="Quantité minimale"
              type="number"
              min="0"
              value={formData.minQuantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  minQuantity: parseInt(e.target.value) || 0,
                }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="pièce">Pièce</option>
                <option value="kg">Kilogramme</option>
                <option value="litre">Litre</option>
                <option value="boîte">Boîte</option>
                <option value="paquet">Paquet</option>
                <option value="carton">Carton</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prix d'achat (DA)"
              type="number"
              min="0"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchasePrice: parseFloat(e.target.value) || 0,
                }))
              }
            />

            <Input
              label="Fournisseur"
              value={formData.supplier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, supplier: e.target.value }))
              }
              placeholder="Nom du fournisseur"
            />
          </div>

          <Input
            label="Emplacement"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Ex: Étagère A, Rangée 3"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
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

          {isEditing && selectedItem && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-3">
                Informations supplémentaires
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Dernier réapprovisionnement
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedItem.lastRestockDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <Badge variant={getStockStatusVariant(selectedItem)}>
                    {getStockStatusLabel(selectedItem)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valeur totale</p>
                  <p className="font-medium">
                    {formatCurrency(
                      selectedItem.quantity * selectedItem.purchasePrice,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de création</p>
                  <p className="font-medium">
                    {formatDate(selectedItem.createdAt)}
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
                setShowItemModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            {isEditing ? (
              <Button
                onClick={handleUpdateItem}
                className="flex-1"
                disabled={!formData.name || !formData.category}
              >
                Mettre à jour
              </Button>
            ) : (
              <Button
                onClick={handleCreateItem}
                className="flex-1"
                disabled={!formData.name || !formData.category}
              >
                Créer l'article
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Adjust Quantity Modal */}
      {selectedItem && (
        <Modal
          isOpen={showAdjustModal}
          onClose={() => {
            setShowAdjustModal(false);
            setAdjustData({
              adjustment: 0,
              reason: "",
              reference: "",
            });
          }}
          title="Ajuster la quantité"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                {selectedItem.name}
              </h4>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Quantité actuelle</p>
                <p className="font-medium">
                  {selectedItem.quantity} {selectedItem.unit}
                </p>
              </div>
            </div>

            <Input
              label="Ajustement"
              type="number"
              value={adjustData.adjustment}
              onChange={(e) =>
                setAdjustData((prev) => ({
                  ...prev,
                  adjustment: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="Ex: 10 pour ajouter, -5 pour retirer"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de l'ajustement
              </label>
              <select
                value={adjustData.reason}
                onChange={(e) =>
                  setAdjustData((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="">Sélectionner une raison</option>
                <option value="Réception de commande">
                  Réception de commande
                </option>
                <option value="Utilisation">Utilisation</option>
                <option value="Inventaire physique">Inventaire physique</option>
                <option value="Perte/Dommage">Perte/Dommage</option>
                <option value="Retour">Retour</option>
                <option value="Correction">Correction</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <Input
              label="Référence (optionnel)"
              value={adjustData.reference}
              onChange={(e) =>
                setAdjustData((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
              placeholder="Ex: Numéro de commande, bon de livraison..."
            />

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustData({
                    adjustment: 0,
                    reason: "",
                    reference: "",
                  });
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAdjustQuantity}
                className="flex-1"
                disabled={adjustData.adjustment === 0 || !adjustData.reason}
              >
                Confirmer l'ajustement
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {selectedItem && (
        <Modal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          title="Code QR de l'article"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                {selectedItem.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Catégorie: {selectedItem.category} | Emplacement:{" "}
                {selectedItem.location}
              </p>
              <Badge variant={getStockStatusVariant(selectedItem)}>
                {getStockStatusLabel(selectedItem)}
              </Badge>
            </div>

            <div className="flex justify-center" id="qr-code-to-print">
              <QRCodeSVG
                value={JSON.stringify({
                  id: selectedItem.id,
                  name: selectedItem.name,
                  category: selectedItem.category,
                  location: selectedItem.location,
                })}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowQRModal(false)}
                className="flex-1"
              >
                Fermer
              </Button>
              <Button onClick={printQRCode} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Low Stock Alert */}
      {getLowStockItems().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-yellow-800">
                  Alerte de Stock Bas
                </h3>
                <p className="text-yellow-700">
                  {getLowStockItems().length} article(s) nécessite(nt) un
                  réapprovisionnement
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {getLowStockItems()
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={`low-stock-${item.id}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {item.quantity} / {item.minQuantity} {item.unit}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAdjustModal(true);
                          setAdjustData((prev) => ({
                            ...prev,
                            adjustment: item.minQuantity * 2 - item.quantity,
                          }));
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Commander
                      </Button>
                    </div>
                  </div>
                ))}

              {getLowStockItems().length > 3 && (
                <Button variant="outline" className="w-full">
                  Voir tous les articles en stock bas
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Inventory Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Valeur de l'Inventaire
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Valeur Totale</h4>
                <Tag className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(
                  inventory.reduce(
                    (sum, item) => sum + item.quantity * item.purchasePrice,
                    0,
                  ),
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Basé sur les prix d'achat
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Articles Actifs</h4>
                <Package className="w-5 h-5 text-teal" />
              </div>
              <p className="text-2xl font-bold text-teal">
                {inventory.filter((i) => i.quantity > 0).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Sur {inventory.length} articles au total
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Taux de Rotation</h4>
                <RefreshCw className="w-5 h-5 text-warm" />
              </div>
              <p className="text-2xl font-bold text-warm">3.2</p>
              <p className="text-sm text-gray-600 mt-1">
                Rotations par an (simulé)
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-primary mb-4">
              Valeur par catégorie
            </h4>
            <div className="bg-gray-50 h-48 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500 ml-2">Graphique (simulé)</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inventory Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Actions Rapides
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Commander des articles
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Générez automatiquement des bons de commande pour les articles
                en stock bas.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Générer des commandes
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center">
                  <Clipboard className="w-5 h-5 text-teal" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Inventaire physique
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Lancez un processus d'inventaire physique pour vérifier les
                stocks.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Démarrer l'inventaire
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-warm/10 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-warm" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Réception de commande
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Enregistrez la réception d'une commande et mettez à jour
                l'inventaire.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Enregistrer une réception
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inventory Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-primary">
              Rapports d'Inventaire
            </h3>
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Tous les rapports
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-primary">
                  Rapport de Valorisation
                </h4>
                <Download className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Analyse complète de la valeur de l'inventaire par catégorie et
                par article.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Dernière génération: {formatDate(new Date())}
                </span>
                <Button variant="outline" size="sm">
                  Générer
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-primary">
                  Rapport de Mouvements
                </h4>
                <Download className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Historique des entrées et sorties de stock sur une période
                donnée.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Dernière génération: {formatDate(new Date())}
                </span>
                <Button variant="outline" size="sm">
                  Générer
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inventory Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6 bg-gradient-to-r from-accent/5 to-teal/5 border-accent/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-2">
                Optimisez votre gestion d'inventaire
              </h3>
              <p className="text-gray-600 mb-4">
                Découvrez comment optimiser votre gestion d'inventaire avec nos
                meilleures pratiques. Réduisez les ruptures de stock, améliorez
                la rotation des stocks et minimisez les coûts de stockage.
              </p>
              <div className="flex space-x-3">
                <Button>Consulter le guide</Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default InventoryManagement;
