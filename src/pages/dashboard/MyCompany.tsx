import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building,
  FileText,
  Users,
  Edit2,
  Save,
  X,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/store";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { wilayas } from "../../data/wilayas";
import { logger } from "../../utils/logger";

const MyCompany = () => {
  const { user, loadUser } = useAuthStore();
  const { updateUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    entreprise: "",
    raisonSociale: "",
    formeJuridique: "",
    typeEntreprise: "",
    nif: "",
    nis: "",
    registreCommerce: "",
    articleImposition: "",
    numeroAutoEntrepreneur: "",
    activitePrincipale: "",
    siegeSocial: "",
    capital: "",
    dateCreationEntreprise: "",
    wilaya: "",
    commune: "",
  });

  // Charger les données utilisateur au montage ET à chaque changement de user
  useEffect(() => {
    if (user) {
      setFormData({
        entreprise: user.entreprise || "",
        raisonSociale: user.raisonSociale || user.raison_sociale || "",
        formeJuridique: user.formeJuridique || user.forme_juridique || "",
        typeEntreprise: user.typeEntreprise || user.type_entreprise || "",
        nif: user.nif || "",
        nis: user.nis || "",
        registreCommerce: user.registreCommerce || user.registre_commerce || "",
        articleImposition: user.articleImposition || user.article_imposition || "",
        numeroAutoEntrepreneur: user.numeroAutoEntrepreneur || user.numero_auto_entrepreneur || "",
        activitePrincipale: user.activitePrincipale || user.activite_principale || "",
        siegeSocial: user.siegeSocial || user.siege_social || "",
        capital: user.capital || "",
        dateCreationEntreprise: user.dateCreationEntreprise || user.date_creation_entreprise || "",
        wilaya: user.wilaya || "",
        commune: user.commune || "",
      });
    }
  }, [user]); // Se déclenche à chaque changement de user

  const hasCompanyInfo = !!(
    user?.raisonSociale || 
    user?.raison_sociale || 
    user?.nif || 
    user?.nis
  );

  console.log("hasCompanyInfo: ",hasCompanyInfo)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    try {
      // Validation simple côté frontend
      if (!formData.raisonSociale.trim()) {
        toast.error("La raison sociale est obligatoire");
        return;
      }

      if (!formData.typeEntreprise) {
        toast.error("Le type d'entreprise est obligatoire");
        return;
      }

      // Validation du capital si renseigné
      if (formData.capital && isNaN(parseFloat(formData.capital.toString()))) {
        toast.error("Le capital doit être un nombre valide");
        return;
      }

      // Préparer les données à envoyer
      const dataToSend = {
        entreprise: formData.entreprise || null,
        raisonSociale: formData.raisonSociale || null,
        formeJuridique: formData.formeJuridique || null,
        typeEntreprise: formData.typeEntreprise || null,
        nif: formData.nif || null,
        nis: formData.nis || null,
        registreCommerce: formData.registreCommerce || null,
        articleImposition: formData.articleImposition || null,
        numeroAutoEntrepreneur: formData.numeroAutoEntrepreneur || null,
        activitePrincipale: formData.activitePrincipale || null,
        siegeSocial: formData.siegeSocial || null,
        capital: formData.capital ? parseFloat(formData.capital.toString()) : null,
        dateCreationEntreprise: formData.dateCreationEntreprise || null,
        wilaya: formData.wilaya || null,
        commune: formData.commune || null,
      };

      // Mettre à jour via le store
      await updateUser(user.id, dataToSend);
      
      // Recharger les données utilisateur pour s'assurer d'avoir les dernières infos
      await loadUser();
      
      setIsEditing(false);
      toast.success("Informations de l'entreprise mises à jour avec succès");
    } catch (error) {
      logger.error("Erreur mise à jour:", error instanceof Error ? error.message : "Unknown error");
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        entreprise: user?.entreprise || "",
        raisonSociale: user.raisonSociale || user.raison_sociale || "",
        formeJuridique: user.formeJuridique || user.forme_juridique || "",
        typeEntreprise: user.typeEntreprise || user.type_entreprise || "",
        nif: user.nif || "",
        nis: user.nis || "",
        registreCommerce: user.registreCommerce || user.registre_commerce || "",
        articleImposition: user.articleImposition || user.article_imposition || "",
        numeroAutoEntrepreneur: user.numeroAutoEntrepreneur || user.numero_auto_entrepreneur || "",
        activitePrincipale: user.activitePrincipale || user.activite_principale || "",
        siegeSocial: user.siegeSocial || user.siege_social || "",
        capital: user.capital || "",
        dateCreationEntreprise: user.dateCreationEntreprise || user.date_creation_entreprise || "",
        wilaya: user.wilaya || "",
        commune: user.commune || "",
      });
    }
  };

  const selectedWilaya = wilayas.find((w) => w.code === formData.wilaya);
  const communes = selectedWilaya?.communes || [];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Entreprise</h1>
          <p className="text-gray-600 mt-1">
            Gérez les informations de votre entreprise
          </p>
        </div>
        {hasCompanyInfo && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      {(!hasCompanyInfo && !isEditing) &&(
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune information d'entreprise
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez les informations de votre entreprise pour faciliter vos
              démarches et demandes de domiciliation.
            </p>
            <Button size="lg" onClick={() => setIsEditing(true)}>
              <Building className="w-5 h-5 mr-2" />
              Ajouter mes informations
            </Button>
          </Card>
        </motion.div>
      )}
     {(hasCompanyInfo || isEditing)  &&(
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Informations Générales
                </h2>
                <p className="text-sm text-gray-500">
                  Détails de votre entreprise
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Raison Sociale"
                icon={<Building className="w-5 h-5" />}
                value={formData.raisonSociale}
                onChange={(e) =>
                  setFormData({ ...formData, raisonSociale: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Ex: SARL Innovation Tech"
                required={isEditing}
              />

              <Input
                label="Nom de l'Entreprise"
                icon={<Building className="w-5 h-5" />}
                value={formData.entreprise}
                onChange={(e) =>
                  setFormData({ ...formData, entreprise: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Ex: Coffice"
                required={isEditing}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'Entreprise{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={formData.typeEntreprise}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typeEntreprise: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                    required={isEditing}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="sarl">SARL - Société à Responsabilité Limitée</option>
                    <option value="eurl">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                    <option value="spa">SPA - Société Par Actions</option>
                    <option value="snc">SNC - Société en Nom Collectif</option>
                    <option value="st">Startup</option>
                    <option value="auto_entrepreneur">Auto-Entrepreneur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme Juridique
                  </label>
                  <select
                    value={formData.formeJuridique}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        formeJuridique: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="sarl">SARL - Société à Responsabilité Limitée</option>
                    <option value="eurl">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                    <option value="spa">SPA - Société Par Actions</option>
                    <option value="snc">SNC - Société en Nom Collectif</option>
                    <option value="st">Startup</option>
                    <option value="auto_entrepreneur">Auto-Entrepreneur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Activité Principale"
                  icon={<Briefcase className="w-5 h-5" />}
                  value={formData.activitePrincipale}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activitePrincipale: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="Ex: Développement logiciel"
                />

                <Input
                  label="Date de Création"
                  type="date"
                  icon={<Calendar className="w-5 h-5" />}
                  value={formData.dateCreationEntreprise}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateCreationEntreprise: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <Input
                label="Capital Social (DA)"
                type="number"
                icon={<DollarSign className="w-5 h-5" />}
                value={formData.capital}
                onChange={(e) =>
                  setFormData({ ...formData, capital: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Ex: 100000"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Identifications Officielles
                </h2>
                <p className="text-sm text-gray-500">
                  Numéros d'identification et registres
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="NIF (Numéro d'Identification Fiscale)"
                  icon={<Hash className="w-5 h-5" />}
                  value={formData.nif}
                  onChange={(e) =>
                    setFormData({ ...formData, nif: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Ex: 099012345678901"
                />

                <Input
                  label="NIS (Numéro d'Identification Statistique)"
                  icon={<Hash className="w-5 h-5" />}
                  value={formData.nis}
                  onChange={(e) =>
                    setFormData({ ...formData, nis: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Ex: 123456789012345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={!isEditing}
                  placeholder="Ex: 16/00-1234567A23"
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
                  disabled={!isEditing}
                  placeholder="Ex: 16123456789"
                />
              </div>

              {formData.typeEntreprise === "AUTO" && (
                <Input
                  label="Numéro Auto-Entrepreneur"
                  icon={<Hash className="w-5 h-5" />}
                  value={formData.numeroAutoEntrepreneur}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numeroAutoEntrepreneur: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="Ex: AE-123456"
                />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Localisation
                </h2>
                <p className="text-sm text-gray-500">Adresse du siège social</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wilaya
                  </label>
                  <select
                    value={formData.wilaya}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        wilaya: e.target.value,
                        commune: "",
                      });
                    }}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Sélectionnez une wilaya</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.code} - {wilaya.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commune
                  </label>
                  <select
                    value={formData.commune}
                    onChange={(e) =>
                      setFormData({ ...formData, commune: e.target.value })
                    }
                    disabled={!isEditing || !formData.wilaya}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Sélectionnez une commune</option>
                    {communes.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Adresse complète du siège social"
                icon={<MapPin className="w-5 h-5" />}
                value={formData.siegeSocial}
                onChange={(e) =>
                  setFormData({ ...formData, siegeSocial: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Ex: 12 Rue Didouche Mourad, Alger"
              />
            </div>
          </Card>

          {!hasCompanyInfo && isEditing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Informations importantes
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Ces informations seront utilisées pour vos demandes de
                      domiciliation
                    </li>
                    <li>
                      • Assurez-vous que toutes les informations sont exactes
                    </li>
                    <li>
                      • Vous pourrez modifier ces informations à tout moment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {hasCompanyInfo && !isEditing && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700">
                  Vos informations d'entreprise sont complètes. Vous pouvez
                  maintenant faire une demande de domiciliation.
                </p>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default MyCompany;