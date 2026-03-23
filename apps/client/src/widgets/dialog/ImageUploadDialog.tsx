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
import { useState } from 'react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, url: string) => void;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}: ImageUploadDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckImage = () => {
    setError(null);
    setPreviewUrl(null);

    if (!name.trim()) {
      setError('파일 이름을 입력해주세요');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('올바른 URL 형식이 아닙니다');
      return;
    }

    setIsChecking(true);

    const img = new Image();
    img.onload = () => {
      setPreviewUrl(url);
      setIsChecking(false);
    };
    img.onerror = () => {
      setError('이미지를 불러올 수 없습니다');
      setIsChecking(false);
    };
    img.src = url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    onSubmit(name.trim(), previewUrl);
    onOpenChange(false);

    // reset
    setName('');
    setUrl('');
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>이미지 공유</DialogTitle>
            <DialogDescription>
              이미지 URL을 사용해 파일을 공유하면 파일 목록에서 이미지를 확인할
              수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="image-name" className="text-right">
                파일 이름
              </Label>
              <Input
                id="image-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="example.png"
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-url" className="text-right">
                이미지 URL
              </Label>
              <Input
                id="image-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image"
                className="col-span-3"
              />
            </div>

            <Button
              type="button"
              onClick={handleCheckImage}
              disabled={isChecking}
              variant="secondary"
              className="w-full"
            >
              {isChecking ? '이미지 확인 중 …' : '이미지 확인'}
            </Button>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-48 w-full rounded-md border object-contain"
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={!previewUrl}>
              공유
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
