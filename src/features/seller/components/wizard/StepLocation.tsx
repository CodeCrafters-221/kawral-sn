import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

interface Props {
  region: string; setRegion: (v: string) => void;
  city: string; setCity: (v: string) => void;
  neighborhood: string; setNeighborhood: (v: string) => void;
  address: string; setAddress: (v: string) => void;
}

const field = 'w-full min-w-0 max-w-full box-border p-3 bg-kawral-ivory border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-kawral-green transition-colors';
const fieldRequired = field + ' border-kawral-green/30';

// Toutes les régions administratives du Sénégal
const SENEGAL_REGIONS = [
  { value: 'Dakar',          label: 'Dakar' },
  { value: 'Thiès',          label: 'Thiès' },
  { value: 'Saint-Louis',    label: 'Saint-Louis' },
  { value: 'Mbour',          label: 'Mbour / Saly' },
  { value: 'Ziguinchor',     label: 'Ziguinchor' },
  { value: 'Diourbel',       label: 'Diourbel' },
  { value: 'Fatick',         label: 'Fatick' },
  { value: 'Kaolack',        label: 'Kaolack' },
  { value: 'Kolda',          label: 'Kolda' },
  { value: 'Louga',          label: 'Louga' },
  { value: 'Matam',          label: 'Matam' },
  { value: 'Sédhiou',        label: 'Sédhiou' },
  { value: 'Tambacounda',    label: 'Tambacounda' },
  { value: 'Kédougou',       label: 'Kédougou' },
  { value: 'Kaffrine',       label: 'Kaffrine' },
];

export const StepLocation: React.FC<Props> = ({
  region, setRegion, city, setCity, neighborhood, setNeighborhood, address, setAddress,
}) => (
  <div className="space-y-5 w-full max-w-full min-w-0">

    {/* Indicateur champs obligatoires */}
    <div className="flex items-center gap-1.5 text-[11px] text-kawral-muted font-semibold min-w-0 max-w-full">
      <AlertCircle className="w-3.5 h-3.5 text-kawral-orange shrink-0" />
      <span>Les champs marqués d'un <span className="text-rose-500 font-black">*</span> sont obligatoires</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full min-w-0">
      {/* Région */}
      <div className="min-w-0 max-w-full">
        <label className="block text-xs font-bold text-kawral-dark mb-1.5 truncate">
          Région <span className="text-rose-500">*</span>
        </label>
        <Select
          value={region}
          onValueChange={setRegion}
          required
        >
          <SelectTrigger
            className={fieldRequired + ' h-11 py-2.5 font-bold text-left'}
          >
            <SelectValue placeholder="Sélectionner une région" />
          </SelectTrigger>
          <SelectContent className="max-h-[min(24rem,60dvh)]">
            {SENEGAL_REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ville / Commune */}
      <div className="min-w-0 max-w-full">
        <label className="block text-xs font-bold text-kawral-dark mb-1.5 truncate">
          Ville / Commune <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Ex: Ziguinchor, Dakar, Thiès..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={fieldRequired}
        />
      </div>
    </div>

    {/* Quartier */}
    <div className="min-w-0 max-w-full">
      <label className="block text-xs font-bold text-kawral-dark mb-1.5 truncate">
        Quartier <span className="text-rose-500">*</span>
      </label>
      <input
        type="text"
        required
        placeholder="Ex: Almadies, Boudody, Kipeye, Plateau..."
        value={neighborhood}
        onChange={(e) => setNeighborhood(e.target.value)}
        className={fieldRequired}
      />
    </div>

    {/* Adresse */}
    <div className="min-w-0 max-w-full">
      <label className="block text-xs font-bold text-kawral-dark mb-1.5 truncate">
        Adresse ou repère précis
        <span className="ml-1 text-[10px] text-kawral-muted font-normal">(optionnel)</span>
      </label>
      <input
        type="text"
        placeholder="Ex: Près de la cathédrale, rue du Commerce..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={field}
      />
    </div>
  </div>
);
