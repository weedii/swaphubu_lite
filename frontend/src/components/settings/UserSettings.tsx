"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/slices/userSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  ShieldAlert,
  Eye,
  Smartphone,
  Clock,
  DollarSign,
  Palette,
  ToggleLeft,
  LogOut,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

export function UserSettings() {
  const user = useAppSelector(selectUser);
  const [activeTab, setActiveTab] = useState("appearance");

  // Example state for settings
  const [settings, setSettings] = useState({
    darkMode: false,
    language: "english",
    notifications: {
      email: true,
      push: true,
      marketing: false,
      security: true,
    },
    privacy: {
      showProfile: true,
      showActivity: false,
      twoFactorAuth: false,
    },
    preferences: {
      currency: "USD",
      timeFormat: "24h",
      colorTheme: "system",
    },
  });

  const handleToggleSetting = (category: string, setting: string) => {
    setSettings((prev) => {
      const categorySettings = prev[category as keyof typeof prev] as Record<
        string,
        any
      >;
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !categorySettings[setting],
        },
      };
    });

    toast.success(`Setting updated successfully!`);
  };

  const handleChangeSetting = (
    category: string,
    setting: string,
    value: any
  ) => {
    setSettings((prev) => {
      const categorySettings = prev[category as keyof typeof prev] as Record<
        string,
        any
      >;
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: value,
        },
      };
    });

    toast.success(`Setting updated successfully!`);
  };

  const handleSimpleToggle = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));

    toast.success(`Setting updated successfully!`);
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
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your experience and preferences
              </p>
            </div>
          </div>
        </SlideUp>

        {/* Tabs Navigation */}
        <Tabs
          defaultValue="appearance"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <SlideUp delay={0.1}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
            </TabsList>
          </SlideUp>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <SlideUp delay={0.2}>
              <Card className="border-2 border-opacity-50 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Palette className="h-5 w-5 text-orange-500" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how SwapHubu looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Moon className="h-4 w-4 text-orange-500" />
                          Dark Mode
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <div
                          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => handleSimpleToggle("darkMode")}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                              settings.darkMode
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </div>
                        <Moon className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-orange-500" />
                          Language
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                      <select
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        value={settings.language}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="chinese">Chinese</option>
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Palette className="h-4 w-4 text-orange-500" />
                          Color Theme
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred color theme
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            settings.preferences.colorTheme === "system"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleChangeSetting(
                              "preferences",
                              "colorTheme",
                              "system"
                            )
                          }
                        >
                          System
                        </Button>
                        <Button
                          variant={
                            settings.preferences.colorTheme === "light"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleChangeSetting(
                              "preferences",
                              "colorTheme",
                              "light"
                            )
                          }
                        >
                          Light
                        </Button>
                        <Button
                          variant={
                            settings.preferences.colorTheme === "dark"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleChangeSetting(
                              "preferences",
                              "colorTheme",
                              "dark"
                            )
                          }
                        >
                          Dark
                        </Button>
                      </div>
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
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Control how and when we contact you
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-orange-500" />
                          Email Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("notifications", "email")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.notifications.email
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-orange-500" />
                          Push Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your devices
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("notifications", "push")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.notifications.push
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-orange-500" />
                          Security Alerts
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified about important security events
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("notifications", "security")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.notifications.security
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" />
                          Marketing Communications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about promotions and new features
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("notifications", "marketing")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.notifications.marketing
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-6">
            <SlideUp>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-500" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-orange-500" />
                          Profile Visibility
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile information
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("privacy", "showProfile")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.privacy.showProfile
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-orange-500" />
                          Activity Visibility
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your trading activity
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("privacy", "showActivity")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.privacy.showActivity
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-orange-500" />
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() =>
                          handleToggleSetting("privacy", "twoFactorAuth")
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            settings.privacy.twoFactorAuth
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2 text-red-500">
                          <LogOut className="h-4 w-4" />
                          Delete Account
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <SlideUp>
              <Card className="border-2 border-opacity-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    General Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          Default Currency
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred currency for transactions
                        </p>
                      </div>
                      <select
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        value={settings.preferences.currency}
                        onChange={(e) =>
                          handleChangeSetting(
                            "preferences",
                            "currency",
                            e.target.value
                          )
                        }
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="BTC">BTC (₿)</option>
                      </select>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          Time Format
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose between 12-hour and 24-hour time format
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            settings.preferences.timeFormat === "12h"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleChangeSetting(
                              "preferences",
                              "timeFormat",
                              "12h"
                            )
                          }
                        >
                          12-hour
                        </Button>
                        <Button
                          variant={
                            settings.preferences.timeFormat === "24h"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handleChangeSetting(
                              "preferences",
                              "timeFormat",
                              "24h"
                            )
                          }
                        >
                          24-hour
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <ToggleLeft className="h-4 w-4 text-orange-500" />
                          Session Timeout
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Set how long before you&apos;re automatically logged
                          out
                        </p>
                      </div>
                      <select className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="never">Never</option>
                      </select>
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
