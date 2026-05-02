import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollButtonsProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ScrollButtons({ containerRef }: ScrollButtonsProps) {
  const scrollToTop = () => {
    if (containerRef && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (containerRef && containerRef.current) {
      containerRef.current.scrollTo({ 
        top: containerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    } else {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg border border-border hover:scale-110 transition-smooth touch-target bg-background/80 backdrop-blur-sm text-foreground hover:bg-accent"
          onClick={scrollToTop}
          title="回到顶部"
        >
          <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg border border-border hover:scale-110 transition-smooth touch-target bg-background/80 backdrop-blur-sm text-foreground hover:bg-accent"
          onClick={scrollToBottom}
          title="跳到底部"
        >
          <ArrowDown className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </>
  );
}
