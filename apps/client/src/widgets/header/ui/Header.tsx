import { PROJECT_NAME } from "@codejam/common";
import { useState } from "react";
import LogoAnimation from "@/assets/logo_animation.svg";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/shared/ui/dialog";
import {
  Check,
  Copy,
  Upload,
  Download,
  Share2,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

const roomId = "PROTOTYPE";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert("복사에 실패했습니다.");
    }
  };

  const handleNotImplemented = (feature: string) => {
    alert(`${feature} 기능은 아직 구현되지 않았습니다.`);
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-4">
      {/* 로고 및 서비스명 */}
      <a href="/">
        <div className="flex items-center gap-3">
          <img src={LogoAnimation} alt="CodeJam Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-semibold text-foreground">
            {PROJECT_NAME}
          </h1>
        </div>
      </a>

      {/* Room ID */}
      <div className="flex items-center gap-2 ml-6">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          ROOM ID
        </span>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-secondary/50">
          <span className="font-mono text-sm font-semibold">{roomId}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={copyRoomId}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* 우측 액션 버튼들 */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => handleNotImplemented("Upload")}
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => handleNotImplemented("Download")}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => handleNotImplemented("Copy")}
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>

        {/* 공유 다이얼로그 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Link</DialogTitle>
              <DialogDescription>
                현재 페이지의 링크를 복사하여 다른 사람에게 공유해보세요.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={window.location.href}
                  readOnly
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="sm">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => handleNotImplemented("Settings")}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>

        {/* 라이트/다크 모드 토글 */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={toggleDarkMode}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
