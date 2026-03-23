import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@codejam/ui';
import type { FormEvent } from 'react';

interface ErrorDialogProps {
  title: string;
  description: string;
  open?: boolean;
  buttonLabel: string;
  onSubmit: () => void;
}

export function ErrorDialog({
  title,
  description,
  open = true,
  buttonLabel,
  onSubmit,
}: ErrorDialogProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{description}</DialogDescription>
          <DialogFooter>
            <Button type="submit">{buttonLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
