import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useContext, useState, type FormEvent } from 'react';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { filenameSchema } from '@codejam/common';

type RenameDialogProps = {
  fileId: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenameDialog({
  fileId,
  fileName: initialFileName,
  open,
  onOpenChange,
}: RenameDialogProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const findFileIdByName = useFileStore((state) => state.getFileId);
  const renameFile = useFileStore((state) => state.renameFile);
  const { updateLinearTab } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);

  const closeDialog = () => {
    setErrorMessage('');
    onOpenChange(false);
  };

  const validateFilename = (name: string) => {
    const result = filenameSchema.safeParse(name);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }
    const newFilename = result.data;
    if (newFilename !== initialFileName && findFileIdByName(newFilename)) {
      return { success: false, error: '이미 존재하는 파일입니다.' };
    }
    return { success: true, data: newFilename };
  };

  const handleRename = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const formData = new FormData(ev.currentTarget);
    const filename = formData.get('filename') as string;
    const validationResult = validateFilename(filename);
    if (!validationResult.success) {
      setErrorMessage(validationResult.error as string);
      return;
    }
    const newFilename = validationResult.data as string;
    renameFile(fileId, newFilename);
    updateLinearTab(activeTab.active, fileId, {
      fileName: newFilename,
    });
    closeDialog();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleRename} className="contents">
          <DialogHeader>
            <DialogTitle>파일 이름 변경</DialogTitle>
            <DialogDescription>파일의 이름을 변경합니다.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                파일명
              </Label>
              <Input
                id="filename"
                name="filename"
                defaultValue={initialFileName}
                className="col-span-3"
                autoFocus
              />
            </div>
            {errorMessage && (
              <p className="p-0.5 text-[12px] text-red-500">{errorMessage}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">변경</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
