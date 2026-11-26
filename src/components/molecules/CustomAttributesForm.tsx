import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface CustomAttributesFormProps {
  attributes: Record<string, any>;
  onChange: (attributes: Record<string, any>) => void;
}

const PRESETS = [
  {
    label: 'Productos de Aseo (PIECE)',
    data: {
      marca: 'CleanPro',
      presentacion: 'Galón 5 Litros',
      biodegradable: true,
      dilucion: '1:10',
    },
  },
  {
    label: 'Mantenimiento Electromecánico (SERVICE)',
    data: {
      tipoMantenimiento: 'Preventivo',
      horasEstimadas: 6,
      garantiaDias: 90,
      tecnicoCertificadoRequerido: true,
      nivelRiesgo: 'Alto',
    },
  },
];

export function CustomAttributesForm({
  attributes,
  onChange,
}: CustomAttributesFormProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const entries = Object.entries(attributes || {});

  const handleUpdateValue = (keyToUpdate: string, val: string) => {
    let finalVal: any = val;
    if (val === 'true') finalVal = true;
    else if (val === 'false') finalVal = false;
    else if (!isNaN(Number(val)) && val.trim() !== '') finalVal = Number(val);

    onChange({
      ...attributes,
      [keyToUpdate]: finalVal,
    });
  };

  const handleRemoveKey = (keyToRemove: string) => {
    const updated = { ...attributes };
    delete updated[keyToRemove];
    onChange(updated);
  };

  const handleAddAttribute = () => {
    if (!newKey.trim()) return;
    let finalVal: any = newValue;
    if (newValue === 'true') finalVal = true;
    else if (newValue === 'false') finalVal = false;
    else if (!isNaN(Number(newValue)) && newValue.trim() !== '') finalVal = Number(newValue);

    onChange({
      ...attributes,
      [newKey.trim()]: finalVal,
    });

    setNewKey('');
    setNewValue('');
  };

  const handleApplyPreset = (presetData: Record<string, any>) => {
    onChange({
      ...attributes,
      ...presetData,
    });
  };

  return (
    <div className="space-y-3 border-2 border-border p-4 rounded-lg bg-card/50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Atributos Personalizados Dinámicos
          </h4>
          <p className="text-xs text-muted-foreground">
            Metadatos específicos según la industria (JSON)
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => handleApplyPreset(preset.data)}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            {preset.label}
          </Button>
        ))}
      </div>

      {entries.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="w-1/3 text-xs font-mono font-medium truncate bg-muted/60 px-2 py-1.5 rounded border border-border">
                {k}
              </div>
              <Input
                className="w-2/3 h-8 text-xs font-mono"
                value={typeof v === 'object' ? JSON.stringify(v) : String(v)}
                onChange={(e) => handleUpdateValue(k, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => handleRemoveKey(k)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No hay atributos personalizados configurados.
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Input
          placeholder="Nombre propiedad (ej. marca)"
          className="w-1/2 h-8 text-xs font-mono"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <Input
          placeholder="Valor (ej. CleanPro)"
          className="w-1/2 h-8 text-xs font-mono"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddAttribute();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-8 text-xs shrink-0"
          onClick={handleAddAttribute}
          disabled={!newKey.trim()}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Agregar
        </Button>
      </div>
    </div>
  );
}
