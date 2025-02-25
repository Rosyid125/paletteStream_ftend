import { Home, Compass, Award, PenTool, BookOpen, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`${isOpen ? "translate-x-0" : "-translate-x-full"} transform transition-transform duration-200 ease-in-out fixed inset-y-0 left-0 z-50 w-64 bg-background border-r p-4 md:relative md:translate-x-0`}>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Compass className="mr-2 h-4 w-4" />
          Discover
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Award className="mr-2 h-4 w-4" />
          Challenges
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <PenTool className="mr-2 h-4 w-4" />
          Illustrations
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <BookOpen className="mr-2 h-4 w-4" />
          Mangas
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <BookMarked className="mr-2 h-4 w-4" />
          Novels
        </Button>
      </nav>
    </aside>
  );
}
