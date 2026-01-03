import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swrSignalApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { SwrSiteListDto } from "@/types/swr";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SwrSiteListDto | null;
  onSaved: () => void;
}

export default function SwrSiteDialog({
  open,
  onOpenChange,
  site,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Trunking");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location || "");
      setType(site.type);
    } else {
      setName("");
      setLocation("");
      setType("Trunking");
    }
  }, [site, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Site name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (site) {
        await swrSignalApi.updateSite({
          id: site.id,
          name,
          location,
          type,
        });
        toast({ description: "Site updated successfully" });
      } else {
        await swrSignalApi.createSite({
          name,
          location,
          type,
        });
        toast({ description: "Site created successfully" });
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save site",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-purple-900/90 to-slate-900/90 border border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">
            {site ? "Edit Site" : "Create New Site"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-200">
              Site Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter site name"
              className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-purple-200">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (optional)"
              className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-purple-200">
              Site Type *
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-purple-900/90 border-purple-500/30">
                <SelectItem value="Trunking" className="text-white">
                  Trunking
                </SelectItem>
                <SelectItem value="Conventional" className="text-white">
                  Conventional
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-purple-500/30 text-purple-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? "Saving..." : site ? "Update Site" : "Create Site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
