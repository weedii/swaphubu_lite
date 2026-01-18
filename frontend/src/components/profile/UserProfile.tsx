"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectUser, updateUserProfile } from "@/redux/slices/userSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput, FormCountrySelect } from "@/components/common";
import { GradientButton } from "@/components/common";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Shield,
  Key,
  CreditCard,
  Clock,
  Bell,
  Trash2,
  AlertTriangle,
  Settings,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  updateUserProfile as updateProfileAPI,
  deleteUserAccount,
} from "@/actions/users";
import { getCountryNameByCode } from "@/components/ui/country-dropdown";

export function UserProfile() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    country: user?.country || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
    // Clear country error if it exists
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await updateProfileAPI({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        country: formData.country,
      });

      if (result.success) {
        // Update Redux store with the new user data
        dispatch(
          updateUserProfile({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            country: formData.country,
          })
        );

        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      country: user?.country || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount();

      if (result.success) {
        toast.success(result.message);
        // Redirect to home page or sign out
        window.location.href = "/";
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        {/* Header */}
        <SlideUp>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-gray-700 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account information and settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user.kyc_status === "verified" ? (
                <Badge className="bg-green-500 text-white px-3 py-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-500 text-white px-3 py-1 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {user.kyc_status === "not_started"
                    ? "Not Verified"
                    : user.kyc_status}
                </Badge>
              )}
            </div>
          </div>
        </SlideUp>

        {/* Tabs Navigation */}
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <SlideUp delay={0.1}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="account-settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>
          </SlideUp>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <SlideUp delay={0.2}>
              <Card className="border-2 border-opacity-50 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5 text-orange-500" />
                      Personal Information
                    </CardTitle>
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-100/50 dark:hover:bg-orange-900/20"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Manage your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          id="first_name"
                          name="first_name"
                          label="First Name"
                          icon={<User className="h-4 w-4" />}
                          value={formData.first_name}
                          onChange={handleInputChange}
                          error={errors.first_name}
                          variant="primary"
                          autoFocus
                        />

                        <FormInput
                          id="last_name"
                          name="last_name"
                          label="Last Name"
                          icon={<User className="h-4 w-4" />}
                          value={formData.last_name}
                          onChange={handleInputChange}
                          error={errors.last_name}
                          variant="secondary"
                        />

                        <div className="md:col-span-2">
                          <FormInput
                            id="email"
                            name="email"
                            label="Email Address"
                            icon={<Mail className="h-4 w-4" />}
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            variant="primary"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <FormCountrySelect
                            id="country"
                            label="Country"
                            icon={<Globe className="h-4 w-4" />}
                            value={formData.country}
                            onValueChange={handleCountryChange}
                            error={errors.country}
                            variant="secondary"
                            placeholder="Select your country..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <GradientButton
                          type="submit"
                          icon={<Save className="h-4 w-4" />}
                          gradientVariant="primary"
                        >
                          Save Changes
                        </GradientButton>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-orange-500" />
                            First Name
                          </div>
                          <div className="font-medium">{user.first_name}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-orange-500" />
                            Last Name
                          </div>
                          <div className="font-medium">{user.last_name}</div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4 text-orange-500" />
                            Email Address
                          </div>
                          <div className="font-medium">{user.email}</div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4 text-orange-500" />
                            Country
                          </div>
                          <div className="font-medium">
                            {user.country
                              ? getCountryNameByCode(user.country)
                              : "Not specified"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideUp>

            <SlideUp delay={0.3}>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-500/10 to-orange-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Account Status
                  </CardTitle>
                  <CardDescription>
                    Information about your account status and verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4 text-orange-500" />
                          Verification Status
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          {user.kyc_status === "verified" ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <span>Verified</span>
                            </>
                          ) : user.kyc_status === "pending" ? (
                            <>
                              <Clock className="h-5 w-5 text-amber-500" />
                              <span>Verification in Progress</span>
                            </>
                          ) : user.kyc_status === "declined" ? (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span>Verification Declined</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-5 w-5 text-gray-500" />
                              <span>Not Verified</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          Member Since
                        </div>
                        <div className="font-medium">
                          {/* Placeholder date - in a real app, you would get this from the user object */}
                          January 2023
                        </div>
                      </div>
                    </div>

                    {user.kyc_status !== "verified" && (
                      <div className="pt-4">
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                          onClick={() =>
                            (window.location.href = "/verify-account")
                          }
                        >
                          Complete Verification
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account-settings" className="mt-6">
            <SlideUp>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Change your password to keep your account secure
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        Change Password
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium">Session Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your active sessions and sign out from other
                          devices
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Manage Sessions
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium text-red-600">
                          Delete Account
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                      </div>
                      <Dialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="h-5 w-5" />
                              Delete Account
                            </DialogTitle>
                            <DialogDescription className="hidden"></DialogDescription>
                          </DialogHeader>
                          <div className="text-sm text-muted-foreground text-left">
                            <p>
                              Are you sure you want to delete your account? This
                              action will:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                              <li>Permanently remove your profile and data</li>
                              <li>Cancel any pending transactions</li>
                              <li>Delete your verification records</li>
                              <li>This action cannot be undone</li>
                            </ul>
                          </div>
                          <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleteDialogOpen(false)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="flex items-center gap-2"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Delete Account
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <SlideUp>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <h3 className="font-medium">Your Payment Methods</h3>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>

                    <div className="py-8 text-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No payment methods added yet</p>
                      <p className="text-sm mt-1">
                        Add a payment method to start trading
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <SlideUp>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how and when we contact you
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates and alerts via email
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium">Security Alerts</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified about important security events
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium">Marketing Preferences</h3>
                        <p className="text-sm text-muted-foreground">
                          Control which promotional content you receive
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  );
}
