"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, AlertTriangle, Bug, Zap, Shield, HelpCircle } from 'lucide-react';
import { ReportType } from '@/types/tweak';
import { TweaksClientService } from '@/lib/services/client/tweaks-client-service';

interface TweakReportModalProps {
  tweakId: string;
  tweakTitle: string;
  children: React.ReactNode;
}

export default function TweakReportModal({ tweakId, tweakTitle, children }: TweakReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reportTypes = [
    { value: 'bug', label: 'Bug/Error', icon: Bug, description: 'The tweak caused an error or unexpected behavior' },
    { value: 'compatibility', label: 'Compatibility Issue', icon: AlertTriangle, description: 'Tweak doesn\'t work with my system/software' },
    { value: 'performance', label: 'Performance Problem', icon: Zap, description: 'Tweak caused slowdowns or performance issues' },
    { value: 'security', label: 'Security Concern', icon: Shield, description: 'Potential security vulnerability or risk' },
    { value: 'other', label: 'Other', icon: HelpCircle, description: 'Other issues not listed above' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Collect system information if requested
      const systemInfo = includeSystemInfo ? {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : undefined;

      // Submit report via API
      const response = await TweaksClientService.submitReport({
        tweakId,
        reportType: reportType as ReportType,
        title: title.trim(),
        description: description.trim(),
        userSystemInfo: systemInfo
      });

      // Reset form on success
      setReportType('');
      setTitle('');
      setDescription('');
      setIsOpen(false);

      // Show success message (you could use toast here instead)
      alert(`Report submitted successfully! Report ID: ${response.reportId}\n\n${response.message}`);

    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReportType = reportTypes.find(type => type.value === reportType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tweak Info */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">{tweakTitle}</p>
            <p className="text-xs text-muted-foreground">ID: {tweakId}</p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-xs text-destructive">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type">What type of issue are you reporting?</Label>
            <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type..." />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedReportType && (
              <p className="text-xs text-muted-foreground">
                {selectedReportType.description}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Brief description of the issue</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Causes blue screen on startup"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible about what happened, when it occurred, and any error messages you saw..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* System Info Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="system-info"
              checked={includeSystemInfo}
              onChange={(e) => setIncludeSystemInfo(e.target.checked)}
              disabled={isSubmitting}
              className="rounded"
            />
            <Label htmlFor="system-info" className="text-sm">
              Include system information (helps us debug)
            </Label>
          </div>

          {/* High Risk Warning */}
          {reportType === 'security' && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <Shield className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-xs text-destructive">
                Security reports are treated with high priority. Our security team will review this immediately.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !reportType || !title.trim() || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
