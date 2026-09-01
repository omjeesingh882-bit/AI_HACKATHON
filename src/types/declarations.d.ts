declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Snowflake: LucideIcon;
  export const Search: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const FileText: LucideIcon;
  export const Calendar: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Database: LucideIcon;
  export const Cpu: LucideIcon;
  export const Upload: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const FileSearch: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Bot: LucideIcon;
  export const User: LucideIcon;
  export const Send: LucideIcon;
  export const Loader2: LucideIcon;
  export const Trash2: LucideIcon;
  export const Folder: LucideIcon;
  export const MapPin: LucideIcon;
  export const Users: LucideIcon;
  export const Clock: LucideIcon;
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Plus: LucideIcon;
  export const Inbox: LucideIcon;
  export const Building: LucideIcon;
  export const Info: LucideIcon;
  export const Brain: LucideIcon;
  export const BrainCircuit: LucideIcon;
  export const Filter: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Layers: LucideIcon;
  export const Shield: LucideIcon;
  export const Zap: LucideIcon;
  export const Award: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Terminal: LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}
