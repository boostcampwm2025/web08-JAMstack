import { Button, RadixInput as Input, RadixLabel as Label } from '@codejam/ui';
import {
  RadixDialog as Dialog,
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { RadixDialogTrigger as DialogTrigger } from '@codejam/ui';
import { useState, type ChangeEvent, type FormEvent } from 'react';

type NewFileDialogProps = {
  onSubmit: (filename: string) => Promise<void>;
  children: React.ReactNode;
};

export function NewFileDialog({ onSubmit, children }: NewFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState('');
  const [helperMessage, setHelperMessage] = useState('');

  const errorPass = (): boolean => {
    if (filename.trim().length === 0) {
      setHelperMessage('파일 이름을 입력해주세요.');
      return false;
    }

    return true;
  };

  const clear = () => {
    setFilename('');
    setHelperMessage('');
    setOpen(false);
  };

  const handleChangeFilename = (ev: ChangeEvent<HTMLInputElement>) => {
    setFilename(ev.target.value);
  };

  const handleOnSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!errorPass()) {
      return;
    }

    onSubmit(filename);
    clear();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleOnSubmit}>
          <DialogHeader>
            <DialogTitle>새 파일</DialogTitle>
            <DialogDescription>
              파일의 이름을 입력해서 새 파일을 만들어보세요
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 mb-2 flex items-center space-x-2">
            <Label htmlFor="filename" className="sr-only">
              파일명
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={handleChangeFilename}
              className="h-9"
              placeholder="example.txt"
              autoFocus
            />
          </div>
          {helperMessage && (
            <p className="text-destructive text-[12px]">{helperMessage}</p>
          )}
          <DialogFooter className="sm:justify-start">
            <Button type="submit" variant="default" size="sm">
              생성
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="sm">
                닫기
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
