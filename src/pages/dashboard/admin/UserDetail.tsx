import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiClient } from "../../../lib/api-client";
import { useAppStore } from "../../../store/store";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Modal from "../../../components/ui/Modal";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserDetail {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  profession?: string;
  entreprise?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadUsers } = useAppStore();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUser(id!);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error("Utilisateur introuvable");
        navigate("/app/admin/users");
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
      toast.error("Erreur lors du chargement");
      navigate("/app/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      const response = await apiClient.deleteUser(id);
      if (response.success) {
        toast.success("Utilisateur supprimé avec succès");
        await loadUsers();
        navigate("/app/admin/users");
      } else {
        toast.error(response.error || "Erreur lors de la suppression");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Utilisateur introuvable</p>
        <Button onClick={() => navigate("/app/admin/users")} className="mt-4">
          Retour aux utilisateurs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/app/admin/users")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.prenom} {user.nom}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user.role === "admin" ? "warning" : "primary"}>
            {user.role === "admin" ? "Administrateur" : "Utilisateur"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:bg-red-50 border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Informations personnelles
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prénom</p>
                  <p className="font-medium text-lg">{user.prenom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium text-lg">{user.nom}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.email}</p>
                  {user.emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" title="Email vérifié" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" title="Email non vérifié" />
                  )}
                </div>
              </div>
              {user.telephone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </p>
                  <p className="font-medium">{user.telephone}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              Informations professionnelles
            </h2>
            <div className="space-y-4">
              {user.profession && (
                <div>
                  <p className="text-sm text-gray-600">Profession</p>
                  <p className="font-medium">{user.profession}</p>
                </div>
              )}
              {user.entreprise && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Entreprise
                  </p>
                  <p className="font-medium">{user.entreprise}</p>
                </div>
              )}
              {!user.profession && !user.entreprise && (
                <p className="text-gray-500 italic">
                  Aucune information professionnelle renseignée
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Compte & Permissions
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Rôle</p>
                <Badge variant={user.role === "admin" ? "warning" : "primary"}>
                  {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut email</p>
                <Badge variant={user.emailVerified ? "success" : "error"}>
                  {user.emailVerified ? "Vérifié" : "Non vérifié"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Informations système
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date d'inscription</p>
                <p className="font-medium">
                  {format(new Date(user.createdAt), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(user.createdAt), "HH:mm", { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Utilisateur</p>
                <p className="font-mono text-xs break-all">{user.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'utilisateur"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
            est irréversible et supprimera également toutes les données
            associées (réservations, domiciliations, etc.).
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Confirmer la suppression"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetail;
