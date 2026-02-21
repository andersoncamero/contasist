import React from "react";
import { Account } from "@/entities/Account";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/molecules/Select";

interface AuxiliaryReportFiltersProps {
    accounts: Account[];
    selectedAccountId: string;
    onAccountChange: (id: string) => void;
    startDate: string;
    onStartDateChange: (date: string) => void;
    endDate: string;
    onEndDateChange: (date: string) => void;
}

export function AuxiliaryReportFilters({
    accounts,
    selectedAccountId,
    onAccountChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange
}: AuxiliaryReportFiltersProps) {
    // Solo mostrar cuentas de nivel 4 (Subcuentas) para el auxiliar
    const subAccounts = accounts
        .filter(acc => acc.Level === 4)
        .sort((a, b) => a.Code.localeCompare(b.Code));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-card border-2 border-border rounded-xl shadow-sm">
            <div className="space-y-2">
                <Label htmlFor="account">Cuenta Auxiliar</Label>
                <Select value={selectedAccountId} onValueChange={onAccountChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione una cuenta..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                        {subAccounts.map((acc) => (
                            <SelectItem key={acc.ID} value={acc.ID}>
                                <span className="font-mono text-xs mr-2">{acc.Code}</span>
                                {acc.Name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="startDate">Desde</Label>
                <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="endDate">Hasta</Label>
                <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                />
            </div>
        </div>
    );
}
