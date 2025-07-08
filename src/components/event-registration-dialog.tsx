
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { registerForEvent, type Event } from '@/lib/firebase';
import { Calendar, MapPin, User, HandHeart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface EventRegistrationDialogProps {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EventRegistrationDialog({ event, isOpen, onOpenChange }: EventRegistrationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<'participant' | 'volunteer'>('participant');

  const handleRegistration = async () => {
    if (!user || !event) return;

    setIsLoading(true);
    try {
      await registerForEvent(user.uid, user.name, user.email, event.id, event.title, registrationType);
      toast({
        title: "Registration Successful!",
        description: `You're now registered for "${event.title}". Contact the host at ${event.hostEmail} for more details.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not register for the event. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register for: {event.title}</DialogTitle>
          <DialogDescription>
            Confirm your details and choose how you'd like to be involved.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{event.location}</span>
          </div>
           <div className="prose prose-sm text-muted-foreground mt-2">
            <p>{event.description}</p>
           </div>
           
            <div className="space-y-4">
                 <p className="text-sm font-medium">How would you like to join?</p>
                 <RadioGroup defaultValue="participant" onValueChange={(value: 'participant' | 'volunteer') => setRegistrationType(value)}>
                    <div className="flex items-center space-x-2 p-4 border rounded-md">
                        <RadioGroupItem value="participant" id="participant" />
                        <Label htmlFor="participant" className="font-normal flex items-center gap-2">
                           <User className="w-4 h-4" /> I want to participate in the event.
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2 p-4 border rounded-md">
                        <RadioGroupItem value="volunteer" id="volunteer" />
                        <Label htmlFor="volunteer" className="font-normal flex items-center gap-2">
                            <HandHeart className="w-4 h-4" /> I want to volunteer to help.
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
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Cancel
                </Button>
            </DialogClose>
            <Button type="button" onClick={handleRegistration} disabled={isLoading}>
                {isLoading ? "Confirming..." : "Confirm Registration"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
