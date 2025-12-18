import { PROJECT_NAME } from '@codejam/common';
import { useState } from 'react';
import LogoAnimation from '@/assets/logo_animation.svg';
import { Button } from '@/shared/ui/button';
import {
  Copy,
  Upload,
  Download,
  Share2,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

const roomId = 'PROTOTYPE';

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
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
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 우측 액션 버튼들 */}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
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
