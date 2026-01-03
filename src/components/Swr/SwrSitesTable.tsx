import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { SwrSiteListDto } from "@/types/swr";

interface Props {
  sites: SwrSiteListDto[];
  loading: boolean;
  onEdit: (site: SwrSiteListDto) => void;
  onDelete: (id: number) => void;
}

export default function SwrSitesTable({
  sites,
  loading,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-12 bg-purple-900/20 rounded-lg border border-purple-500/20">
        <p className="text-purple-200">
          No sites found. Create your first site to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sites.map((site) => (
        <div
          key={site.id}
          className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {site.name}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-purple-300">
                <span className="font-medium">Type:</span> {site.type}
              </p>
              {site.location && (
                <p className="text-sm text-purple-300">
                  <span className="font-medium">Location:</span> {site.location}
                </p>
              )}
              <p className="text-sm text-purple-400">
                <span className="font-medium">Channels:</span>{" "}
                {site.channelCount}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(site)}
              className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(site.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
