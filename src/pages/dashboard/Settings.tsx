import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import Card from "../../components/ui/Card";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <Card className="p-6">
        <p className="text-gray-600">Paramètres utilisateur</p>
      </Card>
    </div>
  );
};

export default Settings;
