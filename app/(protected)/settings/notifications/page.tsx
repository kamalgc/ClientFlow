"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SettingsHeader from "@/components/settings-header";
import SettingsSidebar from "@/components/SettingsSidebar";

export default function NotificationsSettingsPage() {
  const [selectedOption, setSelectedOption] = useState("nothing");
  const [emailPrefs, setEmailPrefs] = useState({
    communication: true,
    marketing: true,
    social: false,
    security: false,
  });

  return (
    <div className="min-h-screen bg-white text-black">
      {/* <SettingsHeader /> */}
      <div className="flex">
        {/* <SettingsSidebar active="Notifications" /> */}

        <main className="flex-1 p-8">
            <div className="max-w-3xl space-y-8">
              <div className="flex-1 items-center justify-between">
              {/* Notifications Section */}
              <div>
                <h1 className="text-2xl font-semibold text-black">
                  Notifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive notifications.
                </p>

                <hr className="my-4" />

                {/* Radio Options */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notify me about...</p>
                  <RadioGroup
                    value={selectedOption}
                    onValueChange={setSelectedOption}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-sm">
                        All referral activity and conversions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="direct" id="direct" />
                      <Label htmlFor="direct" className="text-sm">
                        Only confirmed conversions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nothing" id="nothing" />
                      <Label htmlFor="nothing" className="text-sm">
                        Nothing
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Email Notifications */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold">Email Notifications</h3>

                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        Communication emails
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get updates about new leads, conversions, and reward claims.
                      </p>
                    </div>
                    <Switch
                      checked={emailPrefs.communication}
                      onCheckedChange={(checked) =>
                        setEmailPrefs((p) => ({ ...p, communication: checked }))
                      }
                    />
                  </div>

                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Client emails</p>
                      <p className="text-xs text-muted-foreground">
                        Receive messages or reminders when your clients interact with your referral links.
                      </p>
                    </div>
                    <Switch
                      checked={emailPrefs.marketing}
                      onCheckedChange={(checked) =>
                        setEmailPrefs((p) => ({ ...p, marketing: checked }))
                      }
                    />
                  </div>

                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Reward management</p>
                      <p className="text-xs text-muted-foreground">
                        Be notified when it’s time to approve or send a manual reward.
                      </p>
                    </div>
                    <Switch
                      checked={emailPrefs.social}
                      onCheckedChange={(checked) =>
                        setEmailPrefs((p) => ({ ...p, social: checked }))
                      }
                    />
                  </div>

                  <div className="p-4 border rounded-lg flex items-center justify-between opacity-60">
                    <div>
                      <p className="font-medium text-sm">System updates</p>
                      <p className="text-xs text-muted-foreground">
                        Stay in the loop about new features or platform changes.
                      </p>
                    </div>
                    <Switch
                      checked={emailPrefs.security}
                      onCheckedChange={(checked) =>
                        setEmailPrefs((p) => ({ ...p, security: checked }))
                      }
                      disabled
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                  <Button>Update notifications</Button>
                </div>
              </div>
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
