"use client";

import { useState } from "react";
import { Search, Building, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Unit {
  id: string;
  block: string;
  unit_number: string;
  status: string;
  monthly_fee?: number;
}

interface UnitSelectorProps {
  units: Unit[];
  selectedUnitId?: string;
  onUnitSelect: (unitId: string) => void;
  showOnlyVacant?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function UnitSelector({
  units,
  selectedUnitId,
  onUnitSelect,
  showOnlyVacant = false,
  disabled = false,
  placeholder = "Select a unit",
}: UnitSelectorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"hierarchy" | "search">("hierarchy");

  // Filter units based on availability
  const availableUnits = showOnlyVacant
    ? units.filter((unit) => unit.status === "vacant")
    : units;

  // Get unique blocks
  const blocks = Array.from(
    new Set(availableUnits.map((unit) => unit.block))
  ).sort();

  // Get floors for selected block (extract from unit_number)
  const getFloorsForBlock = (block: string) => {
    const blockUnits = availableUnits.filter((unit) => unit.block === block);
    const floors = Array.from(
      new Set(
        blockUnits.map((unit) =>
          Math.floor(Number.parseInt(unit.unit_number) / 100)
        )
      )
    ).sort((a, b) => a - b);
    return floors;
  };

  // Get units for selected block and floor
  const getUnitsForFloor = (block: string, floor: number) => {
    return availableUnits
      .filter(
        (unit) =>
          unit.block === block &&
          Math.floor(Number.parseInt(unit.unit_number) / 100) === floor
      )
      .sort(
        (a, b) =>
          Number.parseInt(a.unit_number) - Number.parseInt(b.unit_number)
      );
  };

  // Search filtered units
  const searchFilteredUnits = availableUnits
    .filter(
      (unit) =>
        unit.unit_number.includes(searchTerm) ||
        unit.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${unit.block}${unit.unit_number}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .slice(0, 20); // Limit to 20 results for performance

  // Get selected unit details
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);

  const floors = selectedBlock ? getFloorsForBlock(selectedBlock) : [];
  const floorUnits =
    selectedBlock && selectedFloor
      ? getUnitsForFloor(selectedBlock, Number.parseInt(selectedFloor))
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          type="button"
          variant={viewMode === "hierarchy" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("hierarchy")}
        >
          <Building className="h-4 w-4 mr-2" />
          Browse
        </Button>
        <Button
          type="button"
          variant={viewMode === "search" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("search")}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {viewMode === "hierarchy" ? (
        <div className="space-y-4">
          {/* Block Selection */}
          <div className="space-y-2">
            <Label>Block</Label>
            <Select
              value={selectedBlock}
              onValueChange={(value) => {
                setSelectedBlock(value);
                setSelectedFloor("");
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select block" />
              </SelectTrigger>
              <SelectContent>
                {blocks.map((block) => (
                  <SelectItem key={block} value={block}>
                    Block {block} (
                    {availableUnits.filter((u) => u.block === block).length}{" "}
                    units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Floor Selection */}
          {selectedBlock && (
            <div className="space-y-2">
              <Label>Floor</Label>
              <Select
                value={selectedFloor}
                onValueChange={setSelectedFloor}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Floor {floor} (
                      {getUnitsForFloor(selectedBlock, floor).length} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Unit Selection */}
          {selectedBlock && selectedFloor && (
            <div className="space-y-2">
              <Label>Unit</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {floorUnits.map((unit) => (
                  <Card
                    key={unit.id}
                    className={`cursor-pointer transition-colors ${
                      selectedUnitId === unit.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => !disabled && onUnitSelect(unit.id)}
                  >
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="font-medium">#{unit.unit_number}</div>
                        <Badge
                          variant={
                            unit.status === "vacant" ? "secondary" : "outline"
                          }
                          className="text-xs mt-1"
                        >
                          {unit.status}
                        </Badge>
                        {unit.monthly_fee && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ${unit.monthly_fee.toFixed(2)}/mo
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label>Search Units</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by unit number (e.g., 1420) or block..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="space-y-2">
              <Label>Search Results ({searchFilteredUnits.length})</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchFilteredUnits.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No units found matching "{searchTerm}"
                  </div>
                ) : (
                  searchFilteredUnits.map((unit) => (
                    <Card
                      key={unit.id}
                      className={`cursor-pointer transition-colors ${
                        selectedUnitId === unit.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => !disabled && onUnitSelect(unit.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span className="font-medium">
                              Block {unit.block}, #{unit.unit_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                unit.status === "vacant"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {unit.status}
                            </Badge>
                            {unit.monthly_fee && (
                              <span className="text-sm text-muted-foreground">
                                ${unit.monthly_fee.toFixed(2)}/mo
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Unit Display */}
      {selectedUnit && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  Selected: Block {selectedUnit.block}, #
                  {selectedUnit.unit_number}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedUnit.status}</Badge>
                {selectedUnit.monthly_fee && (
                  <span className="text-sm text-muted-foreground">
                    ${selectedUnit.monthly_fee.toFixed(2)}/mo
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="unitId" value={selectedUnitId || ""} />
    </div>
  );
}
