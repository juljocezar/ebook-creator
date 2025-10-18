// FIX: Implemented the missing DocumentationView component as a placeholder.
import React from 'react';
import { Card } from './ui/Card';

export const DocumentationView: React.FC = () => {
  return (
    <div className="p-8">
      <Card title="Dokumentation">
        <div className="prose prose-invert max-w-none">
          <h2>Willkommen beim AI eBook Orchestrator</h2>
          <p>Dies ist ein Platzhalter für die Dokumentationsansicht. Hier finden Sie Informationen zur Verwendung der Anwendung, Details zu den KI-Agenten und Tipps, um die besten Ergebnisse zu erzielen.</p>
          <h3>Funktionen</h3>
          <ul>
            <li>Dokumentenverwaltung und -bearbeitung.</li>
            <li>KI-gestützte Analyse Ihres Textes.</li>
            <li>Automatisierte eBook-Erstellung mit anpassbaren Agenten.</li>
            <li>Interaktiver Schreibassistent für Echtzeit-Hilfe.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};