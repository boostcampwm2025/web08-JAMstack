import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@codejam/ui';
import type { ShareDialogProps } from './libs/types';
import { useShare } from './libs/useShare';
import { RoomCodeSection } from './components/RoomCodeSection';
import { InviteLinkSection } from './components/InviteLinkSection';
import { QRCodeSection } from './components/QRCodeSection';

export function ShareDialog({ children, roomCode }: ShareDialogProps) {
  const inviteUrl = `${window.location.origin}/rooms/${roomCode}`;
  const {
    codeCopied,
    linkCopied,
    handleCopyCode,
    handleCopyLink,
    handleWebShare,
  } = useShare(roomCode, inviteUrl);

  return (
    <Dialog>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>참여자 초대하기</DialogTitle>
          <DialogDescription>
            세션에 참여할 수 있도록 링크를 공유하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <RoomCodeSection
            roomCode={roomCode}
            copied={codeCopied}
            onCopy={handleCopyCode}
          />

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="border-border w-full border-t" />
            </div>
            <span className="bg-background text-muted-foreground relative px-6 text-xs font-medium">
              또는
            </span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <InviteLinkSection
                inviteUrl={inviteUrl}
                linkCopied={linkCopied}
                onCopy={handleCopyLink}
                onShare={handleWebShare}
              />
            </div>
            <div className="bg-border w-px" />
            <div className="flex-1">
              <QRCodeSection inviteUrl={inviteUrl} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
