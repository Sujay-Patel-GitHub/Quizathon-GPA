'use client';

import { useEffect, useState } from 'react';
import { useDatabase, useFirestore } from '@/firebase';
import { ref, get } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trophy, Medal, Star, ArrowLeft, Coins } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface QuizResult {
    marks: number;
    total: number;
    studentEmail: string;
    studentName: string;
}

interface LeaderboardEntry {
    name: string;
    email: string;
    totalMarks: number;
    totalQuestions: number;
    testCount: number;
    accuracy: number;
}

export default function LeaderboardPage() {
    const database = useDatabase();
    const firestore = useFirestore();
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const allUsers = usersSnapshot.docs.map(doc => doc.data());

            const resultsRef = ref(database, 'results');
            const resultsSnapshot = await get(resultsRef);
            const resultsData = resultsSnapshot.exists() ? resultsSnapshot.val() : {};

            const allResultsMap = new Map<string, QuizResult>();
            Object.values(resultsData).forEach((studentResult: any) => {
                if (!studentResult || typeof studentResult !== 'object') return;
                Object.values(studentResult).forEach((dateResult: any) => {
                    if (!dateResult || typeof dateResult !== 'object') return;
                    Object.values(dateResult).forEach((subjectResult: any) => {
                        if (!subjectResult || typeof subjectResult !== 'object') return;
                        Object.entries(subjectResult).forEach(([attemptId, attempt]: [string, any]) => {
                            if (attempt && typeof attempt === 'object' && attempt.studentEmail) {
                                allResultsMap.set(attemptId, attempt as QuizResult);
                            }
                        });
                    });
                });
            });

            const allResults = Array.from(allResultsMap.values());
            const statsMap = new Map<string, LeaderboardEntry>();

            allUsers.forEach((u: any) => {
                statsMap.set(u.email, {
                    name: u.name || 'Anonymous',
                    email: u.email,
                    totalMarks: 0,
                    totalQuestions: 0,
                    testCount: 0,
                    accuracy: 0
                });
            });

            allResults.forEach(res => {
                const existing = statsMap.get(res.studentEmail);
                if (existing) {
                    existing.totalMarks += res.marks || 0;
                    existing.totalQuestions += res.total || 0;
                    existing.testCount += 1;
                } else {
                    statsMap.set(res.studentEmail, {
                        name: res.studentName || 'Anonymous',
                        email: res.studentEmail,
                        totalMarks: res.marks || 0,
                        totalQuestions: res.total || 0,
                        testCount: 1,
                        accuracy: 0
                    });
                }
            });

            const entries = Array.from(statsMap.values()).map(entry => ({
                ...entry,
                accuracy: entry.totalQuestions > 0 ? (entry.totalMarks / entry.totalQuestions) * 100 : 0
            }));

            entries.sort((a, b) => b.totalMarks - a.totalMarks || b.accuracy - a.accuracy);
            setLeaderboard(entries);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8]">
                <Loader2 className="h-12 w-12 animate-spin text-[#4CAF50]" />
            </div>
        );
    }

    const topThree = [leaderboard[1], leaderboard[0], leaderboard[2]]; // 2nd, 1st, 3rd
    const rest = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Top Green Section */}
            <div className="bg-[#2D8A4E] text-white pt-6 pb-20 px-4 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>

                {/* Custom Header - Only on Mobile (Desktop uses global Header) */}
                <div className="flex items-center gap-4 mb-10 relative z-10 md:hidden">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
                </div>

                {/* Podium */}
                <div className="flex items-end justify-center gap-1 md:gap-4 mt-4 relative z-10">
                    {/* Rank 2 */}
                    <PodiumBlock
                        entry={topThree[0]}
                        rank={2}
                        height="h-32 md:h-40"
                        color="bg-[#5DB37E]"
                        active={false}
                    />

                    {/* Rank 1 */}
                    <PodiumBlock
                        entry={topThree[1]}
                        rank={1}
                        height="h-44 md:h-56"
                        color="bg-[#6BBF8C]"
                        active={true}
                    />

                    {/* Rank 3 */}
                    <PodiumBlock
                        entry={topThree[2]}
                        rank={3}
                        height="h-24 md:h-32"
                        color="bg-[#489966]"
                        active={false}
                    />
                </div>
            </div>

            {/* Global Title Section */}
            <div className="flex justify-center -mt-6 relative z-20 mb-8 px-4">
                <div className="bg-white rounded-full shadow-lg px-10 py-3 border border-gray-100 ring-2 ring-gray-900/5 items-center justify-center flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2D8A4E] animate-pulse"></div>
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-800">Global Standings</span>
                </div>
            </div>

            {/* List Section */}
            <div className="container mx-auto px-4 space-y-3">
                {leaderboard.slice(3).map((player, index) => (
                    <div
                        key={player.email}
                        className="bg-[#EBF7F0] border border-[#D0F0DC] rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-center gap-4">
                            <span className="w-6 text-base font-bold text-[#2D8A4E]">{index + 4}</span>
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white shadow-md bg-white flex items-center justify-center font-black text-[#2D8A4E]">
                                {player.name[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 tracking-tight">{player.name}</p>
                                <p className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-tighter opacity-70">{player.testCount} Tests</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-full border border-white/50">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                            <span className="font-black text-gray-900 text-sm">{player.totalMarks}</span>
                        </div>
                    </div>
                ))}

                {leaderboard.length <= 3 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Star className="text-gray-300 w-8 h-8" />
                        </div>
                        <p className="text-gray-400 font-medium">Competition is heating up! Keep it up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PodiumBlock({ entry, rank, height, color, active }: {
    entry?: LeaderboardEntry,
    rank: number,
    height: string,
    color: string,
    active: boolean
}) {
    if (!entry) return <div className={cn("w-24 md:w-32 rounded-t-2xl", height, "bg-white/10 opacity-50")}></div>;

    return (
        <div className="flex flex-col items-center group">
            {/* Avatar Section */}
            <div className="relative mb-3 flex flex-col items-center">
                {rank === 1 && (
                    <div className="absolute -top-6 animate-bounce">
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" fill="currentColor" />
                    </div>
                )}
                <div className={cn(
                    "flex items-center justify-center rounded-full border-4 border-white shadow-2xl font-black transition-transform group-hover:scale-110",
                    active ? "h-16 w-16 md:h-20 md:w-20 text-2xl md:text-3xl bg-white text-[#2D8A4E]" : "h-12 w-12 md:h-16 md:w-16 text-xl md:text-2xl bg-white/40 text-white"
                )}>
                    {entry.name[0].toUpperCase()}
                </div>
                <div className="mt-2 text-center max-w-[80px] md:max-w-[120px]">
                    <p className="text-[10px] md:text-xs font-bold truncate">{entry.name}</p>
                    <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span className="text-[10px] font-black">{entry.totalMarks}</span>
                    </div>
                </div>
            </div>

            {/* The Block */}
            <div className={cn(
                "w-24 md:w-32 rounded-t-2xl flex items-center justify-center relative transition-all duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]",
                height,
                color
            )}>
                <span className="text-4xl md:text-6xl font-black text-white/40 select-none">
                    {rank}
                </span>
                {/* 3D Top Surface Effect */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 rounded-t-2xl"></div>
            </div>
        </div>
    );
}
