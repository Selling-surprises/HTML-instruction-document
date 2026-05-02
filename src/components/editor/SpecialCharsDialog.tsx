import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';

interface SpecialCharsDialogProps {
  onInsertChar: (char: string) => void;
}

const specialChars = [
  '©', '®', '™', '§', '¶', '†', '‡', '•', '…', '‰',
  '°', '±', '×', '÷', '−', '∞', '≈', '≠', '≤', '≥',
  '←', '↑', '→', '↓', '↔', '↕', '↵', '⇐', '⇑', '⇒',
  '⇓', '⇔', '∀', '∂', '∃', '∅', '∇', '∈', '∉', '∋',
  '∏', '∑', '−', '∗', '√', '∝', '∠', '∧', '∨', '∩',
  '∪', '∫', '∴', '∼', '≅', '≈', '≠', '≡', '⊕', '⊗',
  '⊥', '⋅', '⌈', '⌉', '⌊', '⌋', '〈', '〉', '◊', '♠',
  '♣', '♥', '♦', '€', '£', '¥', '¢', '¤', 'ƒ', 'α',
  'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ',
  'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ',
  'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η',
  'Θ', 'Ι', 'Κ', 'Λ', 'Ｍ', 'Ｎ', 'Ξ', 'Ο', 'Π', 'Ρ',
  'Σ', 'Ｔ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'
];

export function SpecialCharsDialog({ onInsertChar }: SpecialCharsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="特殊字符">
          <Type className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>插入特殊字符</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-10 gap-1 p-2">
          {specialChars.map((char, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-10 w-10 p-0 text-lg hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                onInsertChar(char);
                setOpen(false);
              }}
            >
              {char}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
