'use client';

import { Badge } from '@/components/ui/Badge';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Trash2,
  User as UserIcon
} from 'lucide-react';
import React, { useRef, useState } from 'react';

// UploadThing Integrations
import { updateProfileAvatar } from '@/app/actions/user';
import { useUploadThing } from '@/lib/uploadthing';

export default function SettingsPage() {
  const { user, onboardingData, login, resetOnboarding, githubAnalytics, connectGithub, disconnectGithub } = useAppStore();
  
  // Local states for inputs
  const [profileName, setProfileName] = useState(user?.name || 'yogender verma');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'yogendarverma0268@gmail.com');
  const [profileGoal, setProfileGoal] = useState(user?.careerGoal || 'AI Engineer');
  
  // Notification states
  const [notifyWeeklyPlan, setNotifyWeeklyPlan] = useState(true);
  const [notifyMentorReplied, setNotifyMentorReplied] = useState(true);
  const [notifyRecruiterScans, setNotifyRecruiterScans] = useState(false);
  
  // Success toast helpers
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // --- AVATAR UPLOAD STATE HOOKS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>((user as any)?.imageUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: async (res) => {
      const uploadedUrl = res?.[0]?.url;
      if (!uploadedUrl) {
        setAvatarError("Upload resolved with an empty payload reference.");
        return;
      }

      const success = await updateProfileAvatar(uploadedUrl);
      if (success) {
        setAvatarSuccess("Avatar updated successfully!");
        setAvatarFile(null);
      }
    },
    onUploadError: (error: Error) => {
      setAvatarError(`Upload exception: ${error.message}`);
    },
  });

  const handleAvatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    setAvatarSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME formats
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      setAvatarError("Format unsupported. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image file size exceeds the 5MB limit.");
      return;
    }

    setAvatarFile(file);

    // Create client memory string preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  // ----------------------------------

  // Save profile information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login(profileEmail, profileName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Reset Onboarding pathway
  const handleResetOnboarding = () => {
    resetOnboarding();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  // Toggle Git Connection
  const handleToggleGithub = () => {
    if (githubAnalytics.connected) {
      disconnectGithub();
    } else {
      connectGithub('devpilot-architect');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure profile options, connected repositories, notifications, and onboarding preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Settings (Profile & Notification configs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROFILE SETTINGS FORM */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Profile Details</CardTitle>
              <CardDescription className="text-xs">Edit your public metadata and target career goals.</CardDescription>
            </CardHeader>
            <CardContent>

              {/* DYNAMIC AVATAR UPLOAD COMPONENT */}
              <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center gap-6 mb-6 text-xs sm:text-sm">
                <div className="relative w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0 group">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover transition duration-200 group-hover:opacity-75" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-500" />
                  )}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-2 w-full flex-1">
                  <h4 className="font-bold text-slate-200">Profile Image</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Update your public avatar image. JPG, PNG, or WEBP up to 5MB.</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleAvatarSelection}
                    disabled={isUploading}
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-8 text-[11px] border-white/10 text-slate-300 hover:text-white"
                    >
                      Choose Image
                    </Button>

                    {avatarFile && (
                      <Button
                        type="button"
                        variant="premium"
                        size="sm"
                        onClick={() => startUpload([avatarFile])}
                        disabled={isUploading}
                        className="h-8 text-[11px] font-semibold flex items-center"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Save Image Changes"
                        )}
                      </Button>
                    )}
                  </div>

                  {avatarError && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {avatarError}
                    </p>
                  )}
                  {avatarSuccess && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center mt-1">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      {avatarSuccess}
                    </p>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <Input
                  label="Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <Input
                  label="Target Career Goal"
                  value={profileGoal}
                  onChange={(e) => setProfileGoal(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <div className="flex items-center justify-between pt-4">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1.5 animate-bounce" />
                      Changes saved successfully
                    </span>
                  )}
                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="h-11 px-6 ml-auto text-xs font-semibold"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* NOTIFICATION PREFERENCES */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Notification Controls</CardTitle>
              <CardDescription className="text-xs">Manage how and when you receive system alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start justify-between p-3.5 bg-white/2 rounded-xl border border-white/5 gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">Weekly plan guides alerts</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Receive automated email alerts summarizing checklist items for the week.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWeeklyPlan}
                  onChange={() => setNotifyWeeklyPlan(!notifyWeeklyPlan)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between p-3.5 bg-white/2 rounded-xl border border-white/5 gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">AI Mentor replies stream alerts</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Push notifications alert when AI mentor finishes vector parsing calculations.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMentorReplied}
                  onChange={() => setNotifyMentorReplied(!notifyMentorReplied)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between p-3.5 bg-white/2 rounded-xl border border-white/5 gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">Recruiter search logs crawl alerts</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Receive instant notifications when recruiters request access indices.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRecruiterScans}
                  onChange={() => setNotifyRecruiterScans(!notifyRecruiterScans)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Connection accounts & Operations configs */}
        <div className="space-y-8">
          
          {/* CONNECTED ACCOUNTS */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Connected Integrations</CardTitle>
              <CardDescription className="text-xs">Connect credentials to sync active files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              
              {/* GitHub integration status */}
              <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">GitHub Crawlers</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {githubAnalytics.connected ? `Synced: @${githubAnalytics.username}` : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={githubAnalytics.connected ? 'outline' : 'glow'}
                  size="sm"
                  onClick={handleToggleGithub}
                  className="h-9 text-xs"
                >
                  {githubAnalytics.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>

              {/* LinkedIn integration status */}
              <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">LinkedIn Endorsements</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Synced & parsed</p>
                  </div>
                </div>
                <Badge variant="glow">Active</Badge>
              </div>

            </CardContent>
          </Card>

          {/* DANGER ZONES: RESET & DELETE ACCOUNTS */}
          <Card hoverEffect={false} className="border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-base font-bold text-rose-300">Danger Operations</CardTitle>
              <CardDescription className="text-xs">Destructive changes that erase technical indices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              
              {/* Reset Onboarding pathway */}
              <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/10 flex flex-col space-y-3.5 text-xs text-slate-300">
                <div>
                  <h4 className="font-bold text-slate-200 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1 text-rose-400" />
                    Reset Onboarding Wizard
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Erase your active profile metrics, resume attachments, and GitHub mappings to rerun the cinematic AI blueprint engine from start.</p>
                </div>
                
                <div className="flex items-center justify-between">
                  {resetSuccess && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Erased. Go to navbar CTAs.
                    </span>
                  )}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                    className="h-9 text-[10px] border-rose-500/30 hover:bg-rose-500/10 hover:text-white"
                  >
                    Reset Onboarding State
                  </Button>
                </div>
              </div>

              {/* Delete Account */}
              <Button 
                variant="outline"
                className="w-full h-11 border-rose-500/20 hover:bg-rose-500/10 text-rose-400 hover:text-white text-xs font-semibold"
                leftIcon={<Trash2 className="w-4 h-4 shrink-0" />}
              >
                Delete Account & Cockpit
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}