
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { registerForHackathon, type Hackathon } from '@/lib/firebase';
import { Calendar, Info, User, HandHeart, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface HackathonRegistrationDialogProps {
  hackathon: Hackathon | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function HackathonRegistrationDialog({ hackathon, isOpen, onOpenChange }: HackathonRegistrationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<'participant' | 'volunteer'>('participant');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegistration = async () => {
    if (!user || !hackathon) return;

    setIsLoading(true);
    try {
      await registerForHackathon(user.uid, user.name, user.email, hackathon.id, hackathon.title, registrationType);
      setIsSuccess(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not register for the hackathon. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
      onOpenChange(false);
      // Reset state after a short delay to allow for closing animation
      setTimeout(() => {
          setIsSuccess(false);
          setRegistrationType('participant');
      }, 300);
  };

  if (!hackathon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            handleClose();
        } else {
            onOpenChange(true);
        }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
             <>
                <DialogHeader className="items-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <DialogTitle className="text-2xl">Registration Confirmed!</DialogTitle>
                    <DialogDescription>
                        You're all set! You have successfully registered for "{hackathon.title}".
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-secondary/50 rounded-md mt-2 text-center">
                    <p className="text-sm font-medium">Have questions?</p>
                    <p className="text-sm text-muted-foreground">
                        You can contact the host directly at <a href={`mailto:${hackathon.hostEmail}`} className="text-primary underline">{hackathon.hostEmail}</a>.
                    </p>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleClose} className="w-full">
                        Done
                    </Button>
                </DialogFooter>
            </>
        ) : (
            <>
                <DialogHeader>
                  <DialogTitle>Register for: {hackathon.title}</DialogTitle>
                  <DialogDescription>
                    Confirm your details and choose how you'd like to be involved.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{hackathon.dates}</span>
                  </div>
                  <div className="flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{hackathon.description}</p>
                  </div>
                   <div className="space-y-4">
                         <p className="text-sm font-medium">How would you like to join?</p>
                         <RadioGroup defaultValue="participant" onValueChange={(value: 'participant' | 'volunteer') => setRegistrationType(value)}>
                            <div className="flex items-center space-x-2 p-4 border rounded-md">
                                <RadioGroupItem value="participant" id="participant" />
                                <Label htmlFor="participant" className="font-normal flex items-center gap-2">
                                   <User className="w-4 h-4" /> I want to participate in the hackathon.
                                </Label>
                            </div>
                             <div className="flex items-center space-x-2 p-4 border rounded-md">
                                <RadioGroupItem value="volunteer" id="volunteer" />
                                <Label htmlFor="volunteer" className="font-normal flex items-center gap-2">
                                    <HandHeart className="w-4 h-4" /> I want to volunteer to help organize.
                                </Label>
                            </div>
                         </RadioGroup>
                    </div>
                  <div className="p-4 bg-secondary/50 rounded-md mt-2">
                    <p className="text-sm font-medium">You are registering as:</p>
                    <p className="text-sm text-muted-foreground">{user?.name} ({user?.email})</p>
                  </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleRegistration} disabled={isLoading}>
                        {isLoading ? "Confirming..." : "Confirm Registration"}
                    </Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
