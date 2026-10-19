import React, { useState, useRef, useEffect, useMemo } from "react";
import { CategoryType } from "../../../../types";
import { getCharacteristicsForCategory, CharacteristicField } from "../../../../data/characteristicsRegistry";
import { getCategoryLabel } from "../../../../utils/formatters";
import { Sparkles, ChevronDown, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface Props {
  category: CategoryType;
  characteristics: Record<string, any>;
  setCharacteristics: (val: Record<string, any>) => void;
}

const inputClass =
  "w-full min-w-0 max-w-full box-border p-3 bg-kawral-ivory border border-slate-200 rounded-xl text-xs font-semibold text-kawral-dark placeholder:text-slate-400 focus:outline-none focus:border-kawral-green focus:ring-2 focus:ring-kawral-green/15 transition-all";

interface MultiSelectFieldProps {
  field: CharacteristicField;
  value: any;
  onChange: (val: string[] | undefined) => void;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({ field, value, onChange }) => {
  // Normaliser les valeurs sélectionnées sous forme de tableau de chaînes
  const selected: string[] = useMemo(() => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string" && value.trim()) {
      return value.includes(",")
        ? value.split(",").map((s) => s.trim()).filter(Boolean)
        : [value.trim()];
    }
    return [];
  }, [value]);

  const toggleOption = (optVal: string) => {
    const exists = selected.includes(optVal);
    const updated = exists ? selected.filter((v) => v !== optVal) : [...selected, optVal];
    onChange(updated.length > 0 ? updated : undefined);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const selectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!field.options) return;
    onChange(field.options.map((opt) => String(opt.value)));
  };

  const options = field.options || [];

  return (
    <div className="space-y-2.5 p-3 sm:p-3.5 bg-kawral-ivory/70 border border-slate-200/90 rounded-2xl min-w-0 max-w-full overflow-hidden">
      {/* En-tête avec compteur et actions rapides */}
      <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200/60 min-w-0 max-w-full gap-2">
        <span className="flex items-center gap-1.5 min-w-0 max-w-full">
          <span className="text-kawral-dark font-extrabold truncate">
            {selected.length === 0 ? "Plusieurs choix possibles" : `${selected.length} sélectionnée${selected.length > 1 ? "s" : ""}`}
          </span>
          {field.placeholder && selected.length === 0 && (
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
              ({field.placeholder})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 text-[11px] shrink-0">
          {options.length > 1 && (
            <button
              type="button"
              onClick={selectAll}
              className="text-kawral-green font-bold hover:underline cursor-pointer"
            >
              Tout cocher
            </button>
          )}
          {selected.length > 0 && (
            <>
              {options.length > 1 && <span>•</span>}
              <button
                type="button"
                onClick={clearAll}
                className="text-rose-500 font-bold hover:underline cursor-pointer"
              >
                Tout effacer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grille de cases à cocher / puces tactiles réactives */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5 max-h-64 overflow-y-auto overscroll-contain pr-1 w-full max-w-full">
        {options.map((opt) => {
          const optVal = String(opt.value);
          const isChecked = selected.includes(optVal);

          return (
            <label
              key={optVal}
              className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border min-h-[36px] max-w-full min-w-0 ${
                isChecked
                  ? "bg-kawral-green text-white border-kawral-green shadow-xs ring-2 ring-kawral-green/20"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleOption(optVal)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  isChecked
                    ? "bg-white text-kawral-green border-white"
                    : "bg-white border-slate-300"
                }`}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate flex-1 min-w-0">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const StepCharacteristics: React.FC<Props> = ({
  category,
  characteristics,
  setCharacteristics,
}) => {
  const fields = getCharacteristicsForCategory(category);
  const categoryLabel = getCategoryLabel(category);

  const handleChange = (id: string, value: any) => {
    setCharacteristics({ ...characteristics, [id]: value });
  };

  const renderField = (field: CharacteristicField) => {
    const value = characteristics[field.id];

    switch (field.type) {
      case "multiselect":
        return (
          <MultiSelectField
            field={field}
            value={value}
            onChange={(val) => handleChange(field.id, val)}
          />
        );

      case "text":
        return (
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={inputClass}
            placeholder={field.placeholder || "Renseigner cette information..."}
            required={field.required}
          />
        );

      case "number":
        return (
          <div className="relative w-full min-w-0 max-w-full">
            <input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                handleChange(
                  field.id,
                  e.target.value !== "" ? Number(e.target.value) : undefined
                )
              }
              className={`${inputClass} ${field.unit ? "pr-14" : ""}`}
              placeholder={field.placeholder || "0"}
              min={field.min}
              max={field.max}
              required={field.required}
            />
            {field.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-kawral-muted font-bold pointer-events-none select-none bg-slate-100/90 px-1.5 py-0.5 rounded max-w-[80px] truncate shrink-0">
                {field.unit}
              </span>
            )}
          </div>
        );

      case "select":
        return (
          <Select
            value={value == null || value === "" ? undefined : String(value)}
            onValueChange={(nextValue) => handleChange(field.id, nextValue)}
            required={field.required}
          >
            <SelectTrigger
              className={`${inputClass} h-11 py-2.5 pr-3 text-left appearance-none`}
            >
              <SelectValue placeholder="Sélectionner une option..." />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,60dvh)]">
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2.5 p-3 bg-kawral-ivory border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-kawral-dark hover:bg-slate-50 transition-colors w-full min-w-0 max-w-full overflow-hidden">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="rounded text-kawral-green focus:ring-kawral-green w-4 h-4 shrink-0"
            />
            <span className="truncate flex-1 min-w-0">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  const checkboxes = fields.filter((f) => f.type === "checkbox");
  const standardFields = fields.filter((f) => f.type !== "checkbox");

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* En-tête explicatif compact */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl w-full max-w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <Sparkles className="w-4 h-4 text-kawral-orange shrink-0" />
          <p className="text-xs font-bold text-kawral-green truncate">
            Caractéristiques pour : <span className="text-kawral-dark font-black">{categoryLabel}</span>
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded-lg border border-emerald-200/60 shrink-0">
          {fields.length} {fields.length > 1 ? "critères clés" : "critère clé"}
        </span>
      </div>

      {/* Champs principaux */}
      {standardFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full min-w-0">
          {standardFields.map((field) => (
            <div
              key={field.id}
              className={`space-y-1.5 min-w-0 max-w-full overflow-hidden ${field.type === "multiselect" ? "sm:col-span-2" : ""}`}
            >
              <label className="block text-xs font-bold text-kawral-dark truncate">
                {field.label}{" "}
                {field.required ? (
                  <span className="text-rose-500 font-bold">*</span>
                ) : (
                  <span className="text-slate-400 font-normal text-[11px]">(Optionnel)</span>
                )}
              </label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-[10px] text-slate-500 break-words">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options complémentaires si checkboxes */}
      {checkboxes.length > 0 && (
        <div className="pt-4 border-t border-slate-100 w-full max-w-full min-w-0">
          <label className="block text-xs font-bold text-kawral-dark mb-3">
            Options supplémentaires
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full min-w-0">
            {checkboxes.map((field) => (
              <div key={field.id} className="min-w-0 max-w-full overflow-hidden">{renderField(field)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Cas rare : aucun champ spécifique */}
      {fields.length === 0 && (
        <div className="p-6 text-center text-kawral-muted bg-slate-50 rounded-2xl text-xs w-full max-w-full">
          Aucune caractéristique spécifique requise pour cette catégorie.
        </div>
      )}
    </div>
  );
};
