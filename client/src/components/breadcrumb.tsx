import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex ${className}`}>
      <ol className="flex items-center space-x-1 text-sm text-gray-500">
        <li>
          <Link href="/">
            <div className="flex items-center hover:text-gray-700 transition-colors">
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </div>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {item.href && !item.current ? (
              <Link href={item.href}>
                <span className="hover:text-gray-700 transition-colors cursor-pointer">
                  {item.name}
                </span>
              </Link>
            ) : (
              <span 
                className={item.current ? "text-gray-900 font-medium" : ""}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}