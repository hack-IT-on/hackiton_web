import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectFilters({
  onSearchChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <Input
        placeholder="Search projects..."
        className="md:w-[300px]"
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="web">Web Development</SelectItem>
          <SelectItem value="mobile">Mobile Apps</SelectItem>
          <SelectItem value="ai">AI/ML</SelectItem>
          <SelectItem value="game">Game Development</SelectItem>
        </SelectContent>
      </Select>
      {/* <Select onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select> */}
    </div>
  );
}
