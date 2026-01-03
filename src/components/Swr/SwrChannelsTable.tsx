import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { SwrChannelListDto } from "@/types/swr";

interface Props {
  channels: SwrChannelListDto[];
  loading: boolean;
  onEdit: (channel: SwrChannelListDto) => void;
  onDelete: (id: number) => void;
}

export default function SwrChannelsTable({
  channels,
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

  if (channels.length === 0) {
    return (
      <div className="text-center py-12 bg-purple-900/20 rounded-lg border border-purple-500/20">
        <p className="text-purple-200">
          No channels found. Create your first channel to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-purple-900/40 border-b border-purple-500/30">
          <tr>
            <th className="px-4 py-3 text-left text-purple-200 font-semibold">
              Channel Name
            </th>
            <th className="px-4 py-3 text-left text-purple-200 font-semibold">
              Site Name
            </th>
            <th className="px-4 py-3 text-left text-purple-200 font-semibold">
              Site Type
            </th>
            <th className="px-4 py-3 text-left text-purple-200 font-semibold">
              Expected SWR Max
            </th>
            <th className="px-4 py-3 text-left text-purple-200 font-semibold">
              Expected PWR Max
            </th>
            <th className="px-4 py-3 text-right text-purple-200 font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel, idx) => (
            <tr
              key={channel.id}
              className={`border-b border-purple-500/10 hover:bg-purple-500/10 transition ${
                idx % 2 === 0 ? "bg-purple-900/10" : ""
              }`}
            >
              <td className="px-4 py-3 text-white font-medium">
                {channel.channelName}
              </td>
              <td className="px-4 py-3 text-purple-300">
                {channel.swrSiteName}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                  {channel.swrSiteType}
                </span>
              </td>
              <td className="px-4 py-3 text-purple-300">
                {channel.expectedSwrMax.toFixed(1)}
              </td>
              <td className="px-4 py-3 text-purple-300">
                {channel.expectedPwrMax
                  ? `${channel.expectedPwrMax.toFixed(0)}W`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(channel)}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(channel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
