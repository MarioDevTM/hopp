import { useEffect, useState } from "react";
import { useAPI } from "@/hooks/useQueryClients";
import { useHoppStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import CopyButton from "@/components/ui/copy-button";

export function Settings() {
  const { useQuery, useMutation } = useAPI();
  const authToken = useHoppStore((store) => store.authToken);

  const { data: user, refetch } = useQuery("get", "/api/auth/user", undefined, {
    queryHash: `user-${authToken}`,
    select: (data) => data,
  });

  const { data: token } = useQuery("get", "/api/auth/authenticate-app", undefined, {
    queryHash: `token-app-${authToken}`,
    select: (data) => data.token,
  });

  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
  });

  useEffect(() => {
    setFormData({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
    });
  }, [user]);

  const updateProfileMutation = useMutation("put", "/api/auth/update-user-name");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        body: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });
      await refetch();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <h2 className="h2-section">Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="First Name"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Last Name"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email} disabled className="bg-muted" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="app-token">App token</Label>
          <div className="flex items-center gap-2">
            <Input id="app-token" value={token} disabled className="bg-muted" />
            <CopyButton
              onCopy={() => {
                navigator.clipboard.writeText(token || "");
              }}
            />
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
