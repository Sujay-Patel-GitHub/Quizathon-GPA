'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, User, PlusCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileFooter() {
    const pathname = usePathname();

    // Define navigation items
    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Quiz', href: '/quiz', icon: Brain },
        { name: 'Profile', href: '/profile', icon: User }, // Added for balance, though not explicitly asked, it makes it look balanced. Or stick to 2? User said specifically "left button as home screen right side a quiz button". I should probably stick to 2 as requested to not overcomplicate, effectively making it a pill.
    ];

    // Reverting to the 2 buttons requested: Home and Quiz.
    // "left button as home" and "right side a quiz button"

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-full px-5 py-1.5 gap-2 z-50 md:hidden bg-gradient-to-b from-white/90 to-white/50 ring-1 ring-gray-900/5">
            <Link href="/" className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-10 transition-all",
                isActive('/') ? "text-primary scale-110 relative" : "text-gray-400 hover:text-gray-600"
            )}>
                {isActive('/') && (
                    <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></span>
                )}
                <Home className={cn("w-4 h-4", isActive('/') && "fill-current")} />
                <span className="text-[8px] font-bold tracking-wide uppercase">Home</span>
            </Link>

            <div className="w-px h-5 bg-gray-200/50"></div>

            <Link href="/leaderboard" className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-10 transition-all",
                isActive('/leaderboard') ? "text-primary scale-110 relative" : "text-gray-400 hover:text-gray-600"
            )}>
                {isActive('/leaderboard') && (
                    <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></span>
                )}
                <Trophy className={cn("w-4 h-4", isActive('/leaderboard') && "fill-current")} />
                <span className="text-[8px] font-bold tracking-wide uppercase">Rank</span>
            </Link>

            <div className="w-px h-5 bg-gray-200/50"></div>

            <Link href="/quiz" className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-10 transition-all",
                isActive('/quiz') ? "text-primary scale-110 relative" : "text-gray-400 hover:text-gray-600"
            )}>
                {isActive('/quiz') && (
                    <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full"></span>
                )}
                <Brain className={cn("w-4 h-4", isActive('/quiz') && "fill-current")} />
                <span className="text-[8px] font-bold tracking-wide uppercase">Quiz</span>
            </Link>
        </div>
    );
}
